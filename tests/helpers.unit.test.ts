import assert from "node:assert/strict";
import { describe, test } from "node:test";

import type { Request } from "express";

import getContext from "../src/helpers/getContext";
import startOf from "../src/helpers/startOf";
import { assertGitHubRepoName, assertGitHubUsername, parseBoundedInt } from "../src/helpers/validators";

function createRequest(originalUrl: string, params: Record<string, string> = {}): Request {
  return {
    originalUrl,
    params,
  } as unknown as Request;
}

describe("startOf", () => {
  test("uses Monday as start of week when current day is Sunday", () => {
    const sunday = new Date("2026-02-15T12:00:00.000Z");
    assert.equal(startOf("week", sunday), "2026-02-09");
  });
});

describe("getContext", () => {
  test("removes color query from badge options", () => {
    const req = createRequest("/repos/testuser?color=blue", { user: "testuser" });
    const context = getContext(req);

    assert.equal(context.color, "blue");
    assert.equal(context.options, "");
  });

  test("keeps non-color options and preserves valid query", () => {
    const req = createRequest("/repos/testuser?style=flat&color=red&logo=github", { user: "testuser" });
    const context = getContext(req);

    assert.equal(context.color, "red");
    assert.equal(context.options, "?style=flat&logo=github");
  });
});

describe("validators", () => {
  test("accepts valid usernames and repository names", () => {
    assert.doesNotThrow(() => {
      assertGitHubUsername("valid-user");
      assertGitHubRepoName("repo_name.v2");
    });
  });

  test("rejects invalid repository names", () => {
    assert.throws(() => {
      assertGitHubRepoName("repo/name");
    });
  });

  test("parseBoundedInt rejects partially numeric values", () => {
    assert.throws(() => {
      parseBoundedInt("10px", "size", { min: 1, max: 100, defaultValue: 10 });
    });
  });
});
