const getContext = require("../../helpers/getContext");
const fetchGitHubJson = require("../../helpers/fetchGitHubJson");
const generateContributorSvg = require("../../helpers/generateContributorSvg");
const createHttpError = require("../../helpers/httpError");

module.exports = async (req, res) => {
  const { user, repo } = getContext(req);
  const [size, padding, perRow, bots] = [
    parseInt(req.query.size ?? 50),
    parseInt(req.query.padding ?? 5),
    parseInt(req.query.perRow ?? 10),
    req.query.bots !== "false",
  ];

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
