const getContext = require("../../helpers/getContext");
const fetch = require("node-fetch");
const githubHeaders = require("../../helpers/githubHeaders");

module.exports = async (req, res) => {
  const { user, color, options } = getContext(req);

  // Get the GitHub profile information for the specified user.
  const response = await fetch(`https://api.github.com/users/${user}`, { headers: githubHeaders() }).then((res) => res.json());

  if (!response?.public_repos) {
    // ERROR
    console.error(`ERR: ${JSON.stringify(response)}`);
  }

  res.redirect(`https://img.shields.io/badge/Repos-${response.public_repos}-${color}${options}`);
};
