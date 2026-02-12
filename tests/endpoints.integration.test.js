const assert = require("node:assert/strict");
const http = require("node:http");
const Module = require("node:module");
const { after, before, describe, test } = require("node:test");

const ONE_PIXEL_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO8GfRkAAAAASUVORK5CYII=",
  "base64"
);

function encodeBadgeSegment(value) {
  return encodeURIComponent(String(value)).replace(/-/g, "--");
}

function startServer(handler) {
  return new Promise((resolve, reject) => {
    const server = http.createServer(handler);
    server.listen(0, "127.0.0.1", () => resolve(server));
    server.on("error", reject);
  });
}

function closeServer(server) {
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

function serverOrigin(server) {
  const address = server.address();
  return `http://127.0.0.1:${address.port}`;
}

function json(res, statusCode, payload) {
  res.writeHead(statusCode, { "content-type": "application/json" });
  res.end(JSON.stringify(payload));
}

function createGitHubHandler() {
  return (req, res) => {
    const url = new URL(req.url, "http://127.0.0.1");
    const origin = `http://${req.headers.host}`;

    if (url.pathname === "/users/testuser") {
      json(res, 200, {
        created_at: "2020-01-01T00:00:00.000Z",
        public_repos: 42,
      });
      return;
    }

    if (url.pathname === "/users/malformed") {
      json(res, 200, { public_repos: 42 });
      return;
    }

    if (url.pathname === "/users/testuser/gists") {
      json(res, 200, [{ id: "g1" }, { id: "g2" }, { id: "g3" }]);
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

const originalModuleLoad = Module._load;
const repoCounters = new Map();

class FakeMongoClient {
  connect() {
    // Keep unresolved so the module-level "Connected to MongoDB" log is not emitted in tests.
    return new Promise(() => {});
  }

  db() {
    return {
      collection() {
        return {
          async findOneAndUpdate({ user, repo }, update) {
            if (repo === "storage-fail") {
              throw new Error("mocked mongo write failure");
            }

            const key = `${user}/${repo}`;
            const current = repoCounters.get(key) ?? 0;
            const increment = update?.$inc?.counter ?? 0;
            const next = current + increment;
            repoCounters.set(key, next);
            return { counter: next };
          },
        };
      },
    };
  }
}

describe("endpoint integration", () => {
  let githubServer;
  let appServer;
  let appOrigin;
  let originalGitHubBaseUrl;
  let originalDatabaseUri;
  let originalAccessToken;

  before(async () => {
    Module._load = function mockMongoLoad(request, parent, isMain) {
      if (request === "mongodb") {
        return { MongoClient: FakeMongoClient };
      }
      return originalModuleLoad.call(this, request, parent, isMain);
    };

    githubServer = await startServer(createGitHubHandler());

    originalGitHubBaseUrl = process.env.GITHUB_API_BASE_URL;
    originalDatabaseUri = process.env.DATABASE_URI;
    originalAccessToken = process.env.GITHUB_ACCESS_TOKEN;

    process.env.GITHUB_API_BASE_URL = serverOrigin(githubServer);
    process.env.DATABASE_URI = "mongodb://unused-for-tests";
    process.env.GITHUB_ACCESS_TOKEN = "";

    const createApp = require("../src/app");
    const app = createApp();
    appServer = await startServer(app);
    appOrigin = serverOrigin(appServer);
  });

  after(async () => {
    await closeServer(appServer);
    await closeServer(githubServer);
    Module._load = originalModuleLoad;
    repoCounters.clear();

    if (originalGitHubBaseUrl === undefined) {
      delete process.env.GITHUB_API_BASE_URL;
    } else {
      process.env.GITHUB_API_BASE_URL = originalGitHubBaseUrl;
    }

    if (originalDatabaseUri === undefined) {
      delete process.env.DATABASE_URI;
    } else {
      process.env.DATABASE_URI = originalDatabaseUri;
    }

    if (originalAccessToken === undefined) {
      delete process.env.GITHUB_ACCESS_TOKEN;
    } else {
      process.env.GITHUB_ACCESS_TOKEN = originalAccessToken;
    }
  });

  async function request(pathname) {
    return fetch(`${appOrigin}${pathname}`, { redirect: "manual" });
  }

  async function readResponse(response) {
    const body = await response.text();
    return {
      status: response.status,
      location: response.headers.get("location"),
      contentType: response.headers.get("content-type") || "",
      body,
    };
  }

  function assertBadgeRedirect(location, { label, color }) {
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

  test("GET /last-stars/:user returns SVG", async () => {
    const response = await request("/last-stars/testuser?count=2&gap=10&perRow=1");
    const result = await readResponse(response);

    assert.equal(result.status, 200);
    assert.match(result.contentType, /image\/svg\+xml/);
    assert.match(result.body, /<svg/);
    assert.match(result.body, /owner\/repo-one/);
    assert.match(result.body, /owner\/repo-two/);
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
    assert.equal(result.body, "Invalid user");
  });

  test("invalid upstream payload returns 502 with an explicit response", async () => {
    const response = await request("/years/malformed");
    const result = await readResponse(response);

    assert.equal(result.status, 502);
    assert.equal(result.body, "Upstream Service Error");
  });
});
