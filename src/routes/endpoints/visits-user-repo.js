const getContext = require("../../helpers/getContext");
const fetch = require("node-fetch");
const { MongoClient } = require("mongodb");
const githubHeaders = require("../../helpers/githubHeaders");

const client = new MongoClient(process.env.DATABASE_URI ?? "mongodb://localhost:27017/badge-it", { useUnifiedTopology: true, useNewUrlParser: true });
client.connect().then(() => console.info("Connected to MongoDB"));

module.exports = async (req, res) => {
  const { user, repo, options } = getContext(req);

  // Make a request to the GitHub API to get the repo's data
  const response = await fetch(`https://api.github.com/repos/${user}/${repo}`, { headers: githubHeaders() }).then((res) => res.json());

  if (!response?.id) {
    // ERROR
    console.error(`ERR: ${JSON.stringify(response)} `);
  }

  try {
    // Increment the visit counter by 1
    const data = await client
      .db()
      .collection("repo-visits")
      .findOneAndUpdate({ user, repo }, { $inc: { counter: 1 } }, { returnDocument: "after", upsert: true });

    if (!data.ok) {
      // ERROR
      console.error(`DB-ERR: ${JSON.stringify(data)} `);
    }

    res.redirect(`https://img.shields.io/badge/Visits-${data.value.counter}-brightgreen${options}`);
  } catch (error) {
    // ERROR
    res.status(500).send(error);
  }
};
