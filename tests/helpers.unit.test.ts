import assert from "node:assert/strict";
import { describe, test } from "node:test";

import type { Request } from "express";

import fromNow from "../src/helpers/fromNow";
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

  test("uses UTC boundaries for day periodicity", () => {
    const dateWithOffset = new Date("2026-02-15T23:30:00-05:00");
    assert.equal(startOf("day", dateWithOffset), "2026-02-16");
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

describe("fromNow", () => {
  test("uses floor semantics for elapsed units", () => {
    const now = Date.now();
    const sixDaysTwentyHoursAgo = now - (6 * 24 + 20) * 60 * 60 * 1000;

    assert.equal(fromNow(sixDaysTwentyHoursAgo), "6 days ago");
  });

  test("returns just now for invalid dates", () => {
    assert.equal(fromNow("not-a-date"), "just now");
  });
});
