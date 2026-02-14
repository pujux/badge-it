import createHttpError from "./httpError";

const DEFAULT_IMAGE_TIMEOUT_MS = 5000;
const DEFAULT_MAX_IMAGE_BYTES = 512 * 1024;
const MAX_IMAGE_BYTES_HARD_LIMIT = 5 * 1024 * 1024;

function isAbortError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "name" in error && (error as { name?: unknown }).name === "AbortError";
}

function resolveMaxImageBytes(): number {
  const rawValue = process.env.MAX_IMAGE_BYTES;

  if (!rawValue) {
    return DEFAULT_MAX_IMAGE_BYTES;
  }

  const parsedValue = Number.parseInt(rawValue, 10);

  if (!Number.isInteger(parsedValue) || parsedValue < 1_024) {
    return DEFAULT_MAX_IMAGE_BYTES;
  }

  return Math.min(parsedValue, MAX_IMAGE_BYTES_HARD_LIMIT);
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

  const maxImageBytes = resolveMaxImageBytes();
  const contentLengthHeader = response.headers.get("content-length");

  if (contentLengthHeader !== null) {
    const contentLength = Number.parseInt(contentLengthHeader, 10);

    if (Number.isInteger(contentLength) && contentLength > maxImageBytes) {
      throw createHttpError(502, `Image payload exceeded ${maxImageBytes} bytes`);
    }
  }

  if (!response.body) {
    throw createHttpError(502, "Image request returned an empty body");
  }

  const reader = response.body.getReader();
  const chunks: Buffer[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    const chunk = Buffer.from(value);
    totalBytes += chunk.byteLength;

    if (totalBytes > maxImageBytes) {
      await reader.cancel();
      throw createHttpError(502, `Image payload exceeded ${maxImageBytes} bytes`);
    }

    chunks.push(chunk);
  }

  return Buffer.concat(chunks, totalBytes).toString("base64");
}
