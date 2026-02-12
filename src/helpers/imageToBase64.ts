import createHttpError from "./httpError";

const DEFAULT_IMAGE_TIMEOUT_MS = 5000;

function isAbortError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "name" in error && (error as { name?: unknown }).name === "AbortError";
}

export default async function imageToBase64(url: string, timeoutMs = DEFAULT_IMAGE_TIMEOUT_MS): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  let response: Response;
  try {
    response = await fetch(url, { signal: controller.signal });
  } catch (error: unknown) {
    if (isAbortError(error)) {
      throw createHttpError(504, `Image request timed out for ${url}`);
    }

    const details = error instanceof Error ? error.message : undefined;
    throw createHttpError(502, `Image request failed for ${url}`, details);
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    throw createHttpError(502, `Image request failed with status ${response.status}`);
  }

  const contentType = response.headers.get("content-type");
  if (contentType && !contentType.startsWith("image/")) {
    throw createHttpError(502, "Image request returned non-image content");
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer).toString("base64");
}
