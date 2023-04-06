const getContext = require("../../helpers/getContext");
const fetch = require("node-fetch");
const fromNow = require("../../helpers/fromNow");

module.exports = async (req, res) => {
  const { user, repo, options } = getContext(req);

  const response = await fetch(`https://api.github.com/repos/${user}/${repo}`).then((res) => res.json());

  if (!response?.created_at) {
    // ERROR
  }

  res.redirect(`https://img.shields.io/badge/Created-${fromNow(response.created_at)}-brightgreen${options}`);
};
