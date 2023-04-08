const getContext = require("../../helpers/getContext");
const fetch = require("node-fetch");
const githubHeaders = require("../../helpers/githubHeaders");

module.exports = async (req, res) => {
  const { user, options } = getContext(req);

  const response = await fetch(`https://api.github.com/users/${user}`, { headers: githubHeaders() }).then((res) => res.json());

  if (!response?.created_at) {
    // ERROR
    console.error(`ERR: ${JSON.stringify(response)} `);
  }

  const years = Math.floor((Date.now() - +new Date(response.created_at)) / 31536e6);

  res.redirect(`https://img.shields.io/badge/Years-${years}-brightgreen${options}`);
};
