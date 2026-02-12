const getContext = require("../../helpers/getContext");
const fetchGitHubJson = require("../../helpers/fetchGitHubJson");
const generateLastStarSvg = require("../../helpers/generateLastStarSvg");
const createHttpError = require("../../helpers/httpError");
const { assertGitHubIdentifier, parseBoundedInt } = require("../../helpers/validators");

module.exports = async (req, res) => {
  const { user } = getContext(req);
  assertGitHubIdentifier(user, "user");

  const count = parseBoundedInt(req.query.count, "count", { min: 1, max: 30, defaultValue: 6 });
  const gap = parseBoundedInt(req.query.gap, "gap", { min: 0, max: 80, defaultValue: 15 });
  const perRow = parseBoundedInt(req.query.perRow, "perRow", { min: 1, max: 10, defaultValue: 2 });

  // Make a request to the GitHub API to get the repo's data
  const response = await fetchGitHubJson(`/users/${user}/starred?sort=created&per_page=${count}`);

  if (!Array.isArray(response)) {
    throw createHttpError(502, "GitHub returned invalid starred repository payload");
  }

  res.contentType("image/svg+xml").send(await generateLastStarSvg(response, gap, perRow));
};
