const getContext = require("../../helpers/getContext");
const fetchGitHubJson = require("../../helpers/fetchGitHubJson");
const createHttpError = require("../../helpers/httpError");
const { assertGitHubIdentifier } = require("../../helpers/validators");

module.exports = async (req, res) => {
  const { user, color, options } = getContext(req);
  assertGitHubIdentifier(user, "user");

  // Get the GitHub profile information for the specified user.
  const response = await fetchGitHubJson(`/users/${user}`);

  if (typeof response?.public_repos !== "number") {
    throw createHttpError(502, "GitHub returned invalid repository count");
  }

  res.redirect(`https://img.shields.io/badge/Repos-${response.public_repos}-${color}${options}`);
};
