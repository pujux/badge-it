const getContext = require("../../helpers/getContext");
const fetchGitHubJson = require("../../helpers/fetchGitHubJson");
const fromNow = require("../../helpers/fromNow");
const createHttpError = require("../../helpers/httpError");
const redirectBadge = require("../../helpers/redirectBadge");
const { assertGitHubIdentifier } = require("../../helpers/validators");

module.exports = async (req, res) => {
  const { user, repo, color, options } = getContext(req);
  assertGitHubIdentifier(user, "user");
  assertGitHubIdentifier(repo, "repo");

  // Make a request to the GitHub API to get the repo's data
  const response = await fetchGitHubJson(`/repos/${user}/${repo}`);

  if (!response?.created_at) {
    throw createHttpError(502, "GitHub returned invalid repository creation date");
  }

  redirectBadge(res, { label: "Created", message: fromNow(response.created_at), color, options });
};
