const getContext = require("../../helpers/getContext");
const fetchGitHubJson = require("../../helpers/fetchGitHubJson");
const createHttpError = require("../../helpers/httpError");

module.exports = async (req, res) => {
  const { user, color, options } = getContext(req);

  // Get the GitHub profile information for the specified user.
  const response = await fetchGitHubJson(`/users/${user}`);

  if (!response?.created_at) {
    throw createHttpError(502, "GitHub returned invalid user payload");
  }

  // Get the number of years since the GitHub user created their account.
  const years = Math.floor((Date.now() - +new Date(response.created_at)) / 31536e6);

  res.redirect(`https://img.shields.io/badge/Years-${years}-${color}${options}`);
};
