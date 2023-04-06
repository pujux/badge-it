const getContext = require("../../helpers/getContext");
const fetch = require("node-fetch");
const fromNow = require("../../helpers/fromNow");

module.exports = async (req, res) => {
  const { user, repo, options } = getContext(req);

  const response = await fetch(`https://api.github.com/repos/${user}/${repo}`).then((res) => res.json());

  if (!response?.updated_at) {
    // ERROR
  }

  res.redirect(`https://img.shields.io/badge/Updated-${fromNow(response.updated_at)}-brightgreen${options}`);
};
