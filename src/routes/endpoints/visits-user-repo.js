const getContext = require("../../helpers/getContext");
const fetchGitHubJson = require("../../helpers/fetchGitHubJson");
const createHttpError = require("../../helpers/httpError");
const { MongoClient } = require("mongodb");

let client;
client = new MongoClient(process.env.DATABASE_URI ?? "mongodb://localhost:27017/badge-it", { useUnifiedTopology: true, useNewUrlParser: true });
client
  .connect()
  .then(() => console.info("Connected to MongoDB"))
  .catch((err) => console.error(`MONGO-CONN-ERR: ${JSON.stringify(err)}`));

module.exports = async (req, res) => {
  const { user, repo, color, options } = getContext(req);

  let response;
  try {
    response = await fetchGitHubJson(`/repos/${user}/${repo}`);
  } catch (error) {
    if (error?.statusCode === 404) {
      res.redirect(`https://img.shields.io/badge/Visits-Repo%20not%20found-${color}${options}`);
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

  if (!data.ok || typeof data?.value?.counter !== "number") {
    throw createHttpError(503, "Visit counter storage returned invalid response");
  }

  res.redirect(`https://img.shields.io/badge/Visits-${data.value.counter}-${color}${options}`);
};
