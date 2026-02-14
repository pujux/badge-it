import assert from "node:assert/strict";
import http, { type IncomingMessage, type ServerResponse } from "node:http";
import { after, before, describe, test } from "node:test";

import type { VisitsStore } from "../src/services/visitsStore";

const ONE_PIXEL_PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO8GfRkAAAAASUVORK5CYII=", "base64");

function encodeBadgeSegment(value: number | string): string {
  return encodeURIComponent(String(value)).replace(/-/g, "--");
}

function startServer(handler: http.RequestListener): Promise<http.Server> {
  return new Promise((resolve, reject) => {
    const server = http.createServer(handler);
    server.listen(0, "127.0.0.1", () => resolve(server));
    server.on("error", reject);
  });
}

function closeServer(server: http.Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

function serverOrigin(server: http.Server): string {
  const address = server.address();

  if (!address || typeof address === "string") {
    throw new Error("Unexpected server address");
  }

  return `http://127.0.0.1:${address.port}`;
}

function json(res: ServerResponse, statusCode: number, payload: unknown): void {
  res.writeHead(statusCode, { "content-type": "application/json" });
  res.end(JSON.stringify(payload));
}

function createGitHubHandler(): (req: IncomingMessage, res: ServerResponse) => void {
  return (req, res) => {
    const url = new URL(req.url ?? "/", "http://127.0.0.1");
    const origin = `http://${req.headers.host}`;

    if (url.pathname === "/users/testuser") {
      json(res, 200, {
        created_at: "2020-01-01T00:00:00.000Z",
        public_repos: 42,
        public_gists: 3,
      });
      return;
    }

    if (url.pathname === "/users/malformed") {
      json(res, 200, { public_repos: 42 });
      return;
    }

    if (url.pathname === "/users/testuser/gists") {
      json(
        res,
        200,
        Array.from({ length: 99 }, (_, index) => ({
          id: `g-${index}`,
        })),
      );
      return;
    }

    if (url.pathname === "/users/emptystar") {
      json(res, 200, {
        created_at: "2020-01-01T00:00:00.000Z",
        public_repos: 0,
        public_gists: 0,
      });
      return;
    }

    if (url.pathname === "/repos/testuser/testrepo") {
      json(res, 200, {
        id: 123,
        created_at: "2021-01-01T00:00:00.000Z",
        updated_at: "2025-01-01T00:00:00.000Z",
      });
      return;
    }

    if (url.pathname === "/repos/testuser/repo_name") {
      json(res, 200, {
        id: 124,
        created_at: "2021-01-01T00:00:00.000Z",
        updated_at: "2025-01-01T00:00:00.000Z",
      });
      return;
    }

    if (url.pathname === "/repos/testuser/storage-fail") {
      json(res, 200, { id: 456 });
      return;
    }

    if (url.pathname === "/repos/testuser/missing") {
      json(res, 404, { message: "Not Found" });
      return;
    }

    if (url.pathname === "/repos/testuser/testrepo/contributors") {
      json(res, 200, [
        {
          type: "User",
          avatar_url: `${origin}/avatars/user.png`,
          html_url: "https://github.com/testuser",
        },
        {
          type: "Bot",
          avatar_url: `${origin}/avatars/bot.png`,
          html_url: "https://github.com/apps/bot-user",
        },
      ]);
      return;
    }

    if (url.pathname === "/repos/testuser/empty/contributors") {
      json(res, 200, []);
      return;
    }

    if (url.pathname === "/repos/testuser/invalid-contributors/contributors") {
      json(res, 200, [{ avatar_url: 123, html_url: null }]);
      return;
    }

    if (url.pathname === "/users/testuser/starred") {
      json(res, 200, [
        {
          full_name: "owner/repo-one",
          html_url: "https://github.com/owner/repo-one",
          stargazers_count: 1250,
          updated_at: "2025-01-02T00:00:00.000Z",
          language: "JavaScript",
        },
        {
          full_name: "owner/repo-two",
          html_url: "https://github.com/owner/repo-two",
          stargazers_count: 8,
          updated_at: "2025-01-03T00:00:00.000Z",
          language: "TypeScript",
        },
      ]);
      return;
    }

    if (url.pathname === "/users/emptystar/starred") {
      json(res, 200, []);
      return;
    }

    if (url.pathname === "/users/invalid-stars/starred") {
      json(res, 200, [{ full_name: "owner/bad" }]);
      return;
    }

    if (url.pathname === "/search/commits") {
      json(res, 200, { total_count: 17 });
      return;
    }

    if (url.pathname === "/avatars/user.png" || url.pathname === "/avatars/bot.png") {
      res.writeHead(200, { "content-type": "image/png" });
      res.end(ONE_PIXEL_PNG);
      return;
    }

    json(res, 404, { message: `Unhandled fake GitHub route: ${url.pathname}` });
  };
}

function createFakeVisitsStore(): VisitsStore {
  const repoCounters = new Map<string, number>();

  return {
    async increment(user: string, repo: string): Promise<number> {
      if (repo === "storage-fail") {
        throw new Error("mocked mongo write failure");
      }

      const key = `${user}/${repo}`;
      const current = repoCounters.get(key) ?? 0;
      const next = current + 1;
      repoCounters.set(key, next);

      return next;
    },
  };
}

describe("endpoint integration", () => {
  let githubServer: http.Server;
  let appServer: http.Server;
  let visitsStore: VisitsStore;
  let appOrigin = "";
  let originalGitHubBaseUrl: string | undefined;
  let originalAccessToken: string | undefined;
  let originalLogLevel: string | undefined;

  before(async () => {
    githubServer = await startServer(createGitHubHandler());
    visitsStore = createFakeVisitsStore();

    originalGitHubBaseUrl = process.env.GITHUB_API_BASE_URL;
    originalAccessToken = process.env.GITHUB_ACCESS_TOKEN;
    originalLogLevel = process.env.LOG_LEVEL;

    process.env.GITHUB_API_BASE_URL = serverOrigin(githubServer);
    process.env.GITHUB_ACCESS_TOKEN = "";
    process.env.LOG_LEVEL = "silent";

    const { default: createApp } = await import("../src/app");
    const app = createApp({ visitsStore });

    appServer = await startServer(app);
    appOrigin = serverOrigin(appServer);
  });

  after(async () => {
    await closeServer(appServer);
    await closeServer(githubServer);

    if (originalGitHubBaseUrl === undefined) {
      delete process.env.GITHUB_API_BASE_URL;
    } else {
      process.env.GITHUB_API_BASE_URL = originalGitHubBaseUrl;
    }

    if (originalAccessToken === undefined) {
      delete process.env.GITHUB_ACCESS_TOKEN;
    } else {
      process.env.GITHUB_ACCESS_TOKEN = originalAccessToken;
    }

    if (originalLogLevel === undefined) {
      delete process.env.LOG_LEVEL;
    } else {
      process.env.LOG_LEVEL = originalLogLevel;
    }
  });

  async function request(pathname: string): Promise<Response> {
    return fetch(`${appOrigin}${pathname}`, { redirect: "manual" });
  }

  async function readResponse(response: Response): Promise<{ status: number; location: string | null; contentType: string; body: string }> {
    const body = await response.text();

    return {
      status: response.status,
      location: response.headers.get("location"),
      contentType: response.headers.get("content-type") || "",
      body,
    };
  }

  function assertBadgeRedirect(location: string | null, { label, color }: { label: string; color: string }): asserts location is string {
    assert.ok(location, "location header should be set");
    assert.match(location, /^https:\/\/img\.shields\.io\/badge\//);
    assert.match(location, new RegExp(`/badge/${encodeBadgeSegment(label)}-`));
    assert.match(location, new RegExp(`-${color}(?:$|\\?)`));
  }

  test("GET /health returns OK", async () => {
    const response = await request("/health");
    const result = await readResponse(response);

    assert.equal(result.status, 200);
    assert.equal(result.body, "OK");
  });

  test("GET /openapi.json returns OpenAPI document", async () => {
    const response = await request("/openapi.json");
    const contentType = response.headers.get("content-type") || "";
    const body = (await response.json()) as {
      openapi?: string;
      paths?: Record<string, { get?: { description?: string; responses?: Record<string, unknown> } }>;
    };

    assert.equal(response.status, 200);
    assert.match(contentType, /application\/json/);
    assert.equal(body.openapi, "3.1.0");
    assert.ok(body.paths);
    assert.ok(body.paths["/health"]);
    assert.ok(body.paths["/visits/{user}/{repo}"]);

    const yearsGet = body.paths["/years/{user}"]?.get;
    assert.ok(yearsGet);
    assert.ok(yearsGet.responses?.["302"]);
    assert.ok(yearsGet.responses?.["200"]);
    assert.match(yearsGet.description ?? "", /follow redirects/i);
  });

  test("GET /docs serves Swagger UI", async () => {
    const response = await request("/docs");
    const result = await readResponse(response);

    assert.equal(result.status, 200);
    assert.equal(result.location, null);
    assert.match(result.contentType, /text\/html/);
    assert.match(result.body, /id="swagger-ui"/);
  });

  test("GET /docs/swagger-ui-init.js includes SVG preview plugin without helper references", async () => {
    const response = await request("/docs/swagger-ui-init.js");
    const result = await readResponse(response);

    assert.equal(result.status, 200);
    assert.match(result.contentType, /application\/javascript/);
    assert.match(result.body, /svgResponsePreviewPlugin/);
    assert.doesNotMatch(result.body, /__name/);
  });

  test("GET /years/:user redirects to shields badge", async () => {
    const response = await request("/years/testuser");
    const result = await readResponse(response);

    assert.equal(result.status, 302);
    assertBadgeRedirect(result.location, { label: "Years", color: "brightgreen" });
  });

  test("GET /repos/:user redirects to repo-count badge", async () => {
    const response = await request("/repos/testuser");
    const result = await readResponse(response);

    assert.equal(result.status, 302);
    assertBadgeRedirect(result.location, { label: "Repos", color: "brightgreen" });
    assert.match(result.location, /-42-brightgreen/);
  });

  test("GET /repos/:user with only color query has clean options", async () => {
    const response = await request("/repos/testuser?color=blue");
    const result = await readResponse(response);

    assert.equal(result.status, 302);
    assertBadgeRedirect(result.location, { label: "Repos", color: "blue" });
    assert.doesNotMatch(result.location, /\?$/);
    assert.doesNotMatch(result.location, /\?&/);
  });

  test("GET /gists/:user redirects to gist-count badge", async () => {
    const response = await request("/gists/testuser");
    const result = await readResponse(response);

    assert.equal(result.status, 302);
    assertBadgeRedirect(result.location, { label: "Gists", color: "brightgreen" });
    assert.match(result.location, /-3-brightgreen/);
  });

  test("GET /created/:user/:repo redirects to created badge", async () => {
    const response = await request("/created/testuser/testrepo");
    const result = await readResponse(response);

    assert.equal(result.status, 302);
    assertBadgeRedirect(result.location, { label: "Created", color: "brightgreen" });
  });

  test("GET /created/:user/:repo accepts repository names with underscores", async () => {
    const response = await request("/created/testuser/repo_name");
    const result = await readResponse(response);

    assert.equal(result.status, 302);
    assertBadgeRedirect(result.location, { label: "Created", color: "brightgreen" });
  });

  test("GET /updated/:user/:repo redirects to updated badge", async () => {
    const response = await request("/updated/testuser/testrepo");
    const result = await readResponse(response);

    assert.equal(result.status, 302);
    assertBadgeRedirect(result.location, { label: "Updated", color: "brightgreen" });
  });

  test("GET /commits/:periodicity/:user redirects to commits badge", async () => {
    const response = await request("/commits/daily/testuser?color=blue&style=flat");
    const result = await readResponse(response);

    assert.equal(result.status, 302);
    assertBadgeRedirect(result.location, { label: "Commits today", color: "blue" });
    assert.match(result.location, /style=flat/);
  });

  test("GET /contributors/:user/:repo returns SVG", async () => {
    const response = await request("/contributors/testuser/testrepo?bots=false&size=20&padding=2&perRow=2");
    const result = await readResponse(response);

    assert.equal(result.status, 200);
    assert.match(result.contentType, /image\/svg\+xml/);
    assert.match(result.body, /<svg/);
    assert.match(result.body, /github\.com\/testuser/);
    assert.doesNotMatch(result.body, /apps\/bot-user/);
  });

  test("GET /contributors/:user/:repo handles empty contributor lists", async () => {
    const response = await request("/contributors/testuser/empty");
    const result = await readResponse(response);

    assert.equal(result.status, 200);
    assert.match(result.contentType, /image\/svg\+xml/);
    assert.match(result.body, /width="1"/);
    assert.match(result.body, /height="1"/);
  });

  test("GET /contributors/:user/:repo validates contributor payload shape", async () => {
    const response = await request("/contributors/testuser/invalid-contributors");
    const result = await readResponse(response);

    assert.equal(result.status, 502);
    assert.equal(result.body, "Upstream Service Error");
  });

  test("GET /last-stars/:user returns SVG", async () => {
    const response = await request("/last-stars/testuser?count=2&padding=10&perRow=1");
    const result = await readResponse(response);

    assert.equal(result.status, 200);
    assert.match(result.contentType, /image\/svg\+xml/);
    assert.match(result.body, /<svg/);
    assert.match(result.body, /owner\/repo-one/);
    assert.match(result.body, /owner\/repo-two/);
  });

  test("GET /last-stars/:user handles empty starred repositories", async () => {
    const response = await request("/last-stars/emptystar");
    const result = await readResponse(response);

    assert.equal(result.status, 200);
    assert.match(result.contentType, /image\/svg\+xml/);
    assert.match(result.body, /width="1"/);
    assert.match(result.body, /height="1"/);
  });

  test("GET /last-stars/:user validates starred repository payload shape", async () => {
    const response = await request("/last-stars/invalid-stars");
    const result = await readResponse(response);

    assert.equal(result.status, 502);
    assert.equal(result.body, "Upstream Service Error");
  });

  test("GET /last-stars/:user rejects partially numeric query values", async () => {
    const response = await request("/last-stars/testuser?count=2abc");
    const result = await readResponse(response);

    assert.equal(result.status, 400);
    assert.equal(result.body, "Invalid count");
  });

  test("GET /visits/:user/:repo returns not-found badge for missing repo", async () => {
    const response = await request("/visits/testuser/missing");
    const result = await readResponse(response);

    assert.equal(result.status, 302);
    assertBadgeRedirect(result.location, { label: "Visits", color: "brightgreen" });
    assert.match(result.location, /Repo%20not%20found/);
  });

  test("GET /visits/:user/:repo increments counter and redirects", async () => {
    const firstResponse = await request("/visits/testuser/testrepo");
    const firstResult = await readResponse(firstResponse);

    assert.equal(firstResult.status, 302);
    assertBadgeRedirect(firstResult.location, { label: "Visits", color: "brightgreen" });
    assert.match(firstResult.location, /-1-brightgreen/);

    const secondResponse = await request("/visits/testuser/testrepo");
    const secondResult = await readResponse(secondResponse);

    assert.equal(secondResult.status, 302);
    assertBadgeRedirect(secondResult.location, { label: "Visits", color: "brightgreen" });
    assert.match(secondResult.location, /-2-brightgreen/);
  });

  test("GET /visits/:user/:repo returns 503 when storage is unavailable", async () => {
    const response = await request("/visits/testuser/storage-fail");
    const result = await readResponse(response);

    assert.equal(result.status, 503);
    assert.equal(result.body, "Service Unavailable");
  });

  test("invalid route params return 400 with an explicit response", async () => {
    const response = await request("/years/invalid_user!");
    const result = await readResponse(response);

    assert.equal(result.status, 400);
    assert.equal(result.body, "Invalid user parameter");
  });

  test("invalid upstream payload returns 502 with an explicit response", async () => {
    const response = await request("/years/malformed");
    const result = await readResponse(response);

    assert.equal(result.status, 502);
    assert.equal(result.body, "Upstream Service Error");
  });
});
