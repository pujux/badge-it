const getContext = require("../../helpers/getContext");
const fetchGitHubJson = require("../../helpers/fetchGitHubJson");
const generateLastStarSvg = require("../../helpers/generateLastStarSvg");
const createHttpError = require("../../helpers/httpError");

module.exports = async (req, res) => {
  const { user } = getContext(req);

  const [count, gap, perRow] = [parseInt(req.query.count ?? 6), parseInt(req.query.gap ?? 15), parseInt(req.query.perRow ?? 2)];

  // Make a request to the GitHub API to get the repo's data
  const response = await fetchGitHubJson(`/users/${user}/starred?sort=created&per_page=${count}`);

  if (!Array.isArray(response)) {
    throw createHttpError(502, "GitHub returned invalid starred repository payload");
  }

  res.contentType("image/svg+xml").send(await generateLastStarSvg(response, gap, perRow));
};
