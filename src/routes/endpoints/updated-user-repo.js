const getContext = require("../../helpers/getContext");
const fetch = require("node-fetch");
const fromNow = require("../../helpers/fromNow");
const githubHeaders = require("../../helpers/githubHeaders");

module.exports = async (req, res) => {
  const { user, repo, color, options } = getContext(req);

  // Make a request to the GitHub API to get the repo's data
  const response = await fetch(`https://api.github.com/repos/${user}/${repo}`, { headers: githubHeaders() }).then((res) => res.json());

  if (!response?.updated_at) {
    // ERROR
    console.error(`ERR: ${JSON.stringify(response)}`);
  }

  res.redirect(`https://img.shields.io/badge/Updated-${fromNow(response.updated_at)}-${color}${options}`);
};
