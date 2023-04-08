const getContext = require("../../helpers/getContext");
const fetch = require("node-fetch");
const fromNow = require("../../helpers/fromNow");
const githubHeaders = require("../../helpers/githubHeaders");

module.exports = async (req, res) => {
  const { user, repo, options } = getContext(req);

  const response = await fetch(`https://api.github.com/repos/${user}/${repo}`, { headers: githubHeaders() }).then((res) => res.json());

  if (!response?.created_at) {
    // ERROR
    console.error(`ERR: ${JSON.stringify(response)} `);
  }

  res.redirect(`https://img.shields.io/badge/Created-${fromNow(response.created_at)}-brightgreen${options}`);
};
