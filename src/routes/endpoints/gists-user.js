const getContext = require("../../helpers/getContext");
const fetchGitHubJson = require("../../helpers/fetchGitHubJson");
const createHttpError = require("../../helpers/httpError");
const redirectBadge = require("../../helpers/redirectBadge");
const { assertGitHubIdentifier } = require("../../helpers/validators");

module.exports = async (req, res) => {
  const { user, color, options } = getContext(req);
  assertGitHubIdentifier(user, "user");

  // Get the GitHub profile information for the specified user.
  const response = await fetchGitHubJson(`/users/${user}/gists`);

  if (!Array.isArray(response)) {
    throw createHttpError(502, "GitHub returned invalid gists payload");
  }

  redirectBadge(res, { label: "Gists", message: response.length, color, options });
};
