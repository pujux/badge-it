const getContext = require("../../helpers/getContext");
const fetch = require("node-fetch");

module.exports = async (req, res) => {
  const { user, options } = getContext(req);

  const response = await fetch(`https://api.github.com/users/${user}/gists`).then((res) => res.json());

  if (!Array.isArray(response) || response?.length === 0) {
    // ERROR
  }

  res.redirect(`https://img.shields.io/badge/Repos-${response.length}-brightgreen${options}`);
};
