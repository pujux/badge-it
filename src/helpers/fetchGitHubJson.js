const githubHeaders = require("./githubHeaders");
const createHttpError = require("./httpError");

const GITHUB_API_BASE_URL = "https://api.github.com";
const DEFAULT_TIMEOUT_MS = 8000;

function withTimeout(promise, timeoutMs, message) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(createHttpError(504, message)), timeoutMs);

    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

async function fetchGitHubJson(path, options = {}) {
  const { headers = {}, timeoutMs = DEFAULT_TIMEOUT_MS } = options;
  const url = `${GITHUB_API_BASE_URL}${path}`;

  let response;
  try {
    response = await withTimeout(fetch(url, { headers: { ...githubHeaders(), ...headers } }), timeoutMs, `GitHub request timed out for ${path}`);
  } catch (error) {
    if (error?.statusCode) {
      throw error;
    }
    throw createHttpError(502, `GitHub request failed for ${path}`, error?.message);
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw createHttpError(502, `GitHub returned non-JSON content for ${path}`);
  }

  if (!response.ok) {
    const rateLimited = response.status === 403 && response.headers.get("x-ratelimit-remaining") === "0";
    const statusCode = rateLimited ? 429 : response.status === 404 ? 404 : 502;
    const message = rateLimited
      ? "GitHub API rate limit exceeded"
      : typeof payload?.message === "string"
      ? `GitHub API error: ${payload.message}`
      : `GitHub API request failed with status ${response.status}`;

    throw createHttpError(statusCode, message, payload);
  }

  return payload;
}

module.exports = fetchGitHubJson;
