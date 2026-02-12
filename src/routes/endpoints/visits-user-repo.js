const getContext = require("../../helpers/getContext");
const fetchGitHubJson = require("../../helpers/fetchGitHubJson");
const createHttpError = require("../../helpers/httpError");
const logger = require("../../helpers/logger");
const redirectBadge = require("../../helpers/redirectBadge");
const { assertGitHubIdentifier } = require("../../helpers/validators");
const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.DATABASE_URI ?? "mongodb://localhost:27017/badge-it");

client
  .connect()
  .then(() => logger.info({ component: "mongodb" }, "Connected to MongoDB"))
  .catch((err) => logger.error({ err, component: "mongodb" }, "Failed to connect to MongoDB"));

module.exports = async (req, res) => {
  const { user, repo, color, options } = getContext(req);
  assertGitHubIdentifier(user, "user");
  assertGitHubIdentifier(repo, "repo");

  let response;
  try {
    response = await fetchGitHubJson(`/repos/${user}/${repo}`);
  } catch (error) {
    if (error?.statusCode === 404) {
      redirectBadge(res, { label: "Visits", message: "Repo not found", color, options });
      return;
    }
    throw error;
  }

  if (!response?.id) {
    throw createHttpError(502, "GitHub returned invalid repository payload");
  }

  let data;
  try {
    data = await client
      .db()
      .collection("repo-visits")
      .findOneAndUpdate({ user, repo }, { $inc: { counter: 1 } }, { returnDocument: "after", upsert: true });
  } catch (error) {
    throw createHttpError(503, "Visit counter storage unavailable", error?.message);
  }

  if (!data || typeof data.counter !== "number") {
    throw createHttpError(503, "Visit counter storage returned invalid response");
  }

  redirectBadge(res, { label: "Visits", message: data.counter, color, options });
};
