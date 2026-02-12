import githubHeaders from "./githubHeaders";
import createHttpError from "./httpError";

import type { HttpError } from "../types/http";

const DEFAULT_GITHUB_API_BASE_URL = "https://api.github.com";
const DEFAULT_TIMEOUT_MS = 8000;

interface FetchGitHubJsonOptions {
  headers?: Record<string, string>;
  timeoutMs?: number;
}

function isHttpError(error: unknown): error is HttpError {
  return typeof error === "object" && error !== null && "statusCode" in error;
}

function isAbortError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "name" in error && (error as { name?: unknown }).name === "AbortError";
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number, timeoutMessage: string): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (error: unknown) {
    if (isAbortError(error)) {
      throw createHttpError(504, timeoutMessage);
    }

    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export default async function fetchGitHubJson<T = unknown>(path: string, options: FetchGitHubJsonOptions = {}): Promise<T> {
  const { headers = {}, timeoutMs = DEFAULT_TIMEOUT_MS } = options;
  const baseUrl = process.env.GITHUB_API_BASE_URL ?? DEFAULT_GITHUB_API_BASE_URL;
  const url = `${baseUrl}${path}`;

  let response: Response;
  try {
    response = await fetchWithTimeout(url, { headers: { ...githubHeaders(), ...headers } }, timeoutMs, `GitHub request timed out for ${path}`);
  } catch (error: unknown) {
    if (isHttpError(error)) {
      throw error;
    }

    const details = error instanceof Error ? error.message : undefined;
    throw createHttpError(502, `GitHub request failed for ${path}`, details);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw createHttpError(502, `GitHub returned non-JSON content for ${path}`);
  }

  if (!response.ok) {
    const rateLimited = response.status === 403 && response.headers.get("x-ratelimit-remaining") === "0";
    const statusCode = rateLimited ? 429 : response.status === 404 ? 404 : 502;
    const payloadMessage = typeof payload === "object" && payload !== null && "message" in payload ? payload.message : undefined;
    const message = rateLimited
      ? "GitHub API rate limit exceeded"
      : typeof payloadMessage === "string"
        ? `GitHub API error: ${payloadMessage}`
        : `GitHub API request failed with status ${response.status}`;

    throw createHttpError(statusCode, message, payload);
  }

  return payload as T;
}
