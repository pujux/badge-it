const getContext = require("../../helpers/getContext");
const fetch = require("node-fetch");

module.exports = async (req, res) => {
  const { user, options } = getContext(req);

  const response = await fetch(`https://api.github.com/users/${user}`).then((res) => res.json());

  if (!response?.public_repos) {
    // ERROR
  }

  res.redirect(`https://img.shields.io/badge/Repos-${response.public_repos}-brightgreen${options}`);
};
