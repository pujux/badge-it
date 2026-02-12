import assert from "node:assert/strict";
import { describe, test } from "node:test";

import fetchGitHubJson from "../src/helpers/fetchGitHubJson";
import imageToBase64 from "../src/helpers/imageToBase64";

interface ErrorWithStatus {
  statusCode?: number;
}

describe("fetchGitHubJson", () => {
  test("returns 504 for timed out requests", async () => {
    const originalFetch = global.fetch;

    try {
      global.fetch = ((_: string, init?: RequestInit) => {
        return new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            const abortError = new Error("aborted") as Error & { name: string };
            abortError.name = "AbortError";
            reject(abortError);
          });
        });
      }) as typeof fetch;

      await assert.rejects(fetchGitHubJson("/users/test", { timeoutMs: 5 }), (error: unknown) => {
        return (error as ErrorWithStatus).statusCode === 504;
      });
    } finally {
      global.fetch = originalFetch;
    }
  });
});

describe("imageToBase64", () => {
  test("returns 502 when content-type is not an image", async () => {
    const originalFetch = global.fetch;

    try {
      global.fetch = (async () => {
        return new Response("{}", {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }) as typeof fetch;

      await assert.rejects(imageToBase64("https://example.com/non-image"), (error: unknown) => {
        return (error as ErrorWithStatus).statusCode === 502;
      });
    } finally {
      global.fetch = originalFetch;
    }
  });
});
