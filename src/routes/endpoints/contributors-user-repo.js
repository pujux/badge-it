const getContext = require("../../helpers/getContext");
const fetchGitHubJson = require("../../helpers/fetchGitHubJson");
const generateContributorSvg = require("../../helpers/generateContributorSvg");
const createHttpError = require("../../helpers/httpError");
const { assertGitHubIdentifier, parseBoundedInt } = require("../../helpers/validators");

module.exports = async (req, res) => {
  const { user, repo } = getContext(req);
  assertGitHubIdentifier(user, "user");
  assertGitHubIdentifier(repo, "repo");

  const size = parseBoundedInt(req.query.size, "size", { min: 16, max: 256, defaultValue: 50 });
  const padding = parseBoundedInt(req.query.padding, "padding", { min: 0, max: 64, defaultValue: 5 });
  const perRow = parseBoundedInt(req.query.perRow, "perRow", { min: 1, max: 50, defaultValue: 10 });

  if (req.query.bots !== undefined && !["true", "false"].includes(String(req.query.bots))) {
    throw createHttpError(400, "Invalid bots parameter");
  }
  const bots = req.query.bots !== "false";

  // Make a request to the GitHub API to get the repo's contributdata
  let response = await fetchGitHubJson(`/repos/${user}/${repo}/contributors`);

  if (!Array.isArray(response)) {
    throw createHttpError(502, "GitHub returned invalid contributors payload");
  }

  if (!bots) {
    // Filter out bots if bots query variable is false
    response = response.filter((contributor) => contributor.type === "User");
  }

  res.contentType("image/svg+xml").send(await generateContributorSvg(response, size, padding, perRow));
};
