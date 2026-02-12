const getContext = require("../../helpers/getContext");
const fetchGitHubJson = require("../../helpers/fetchGitHubJson");
const fromNow = require("../../helpers/fromNow");
const createHttpError = require("../../helpers/httpError");

module.exports = async (req, res) => {
  const { user, repo, color, options } = getContext(req);

  // Make a request to the GitHub API to get the repo's data
  const response = await fetchGitHubJson(`/repos/${user}/${repo}`);

  if (!response?.created_at) {
    throw createHttpError(502, "GitHub returned invalid repository creation date");
  }

  res.redirect(`https://img.shields.io/badge/Created-${fromNow(response.created_at)}-${color}${options}`);
};
