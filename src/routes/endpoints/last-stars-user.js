const getContext = require("../../helpers/getContext");
const fetch = require("node-fetch");
const githubHeaders = require("../../helpers/githubHeaders");
const generateLastStarSvg = require("../../helpers/generateLastStarSvg");

module.exports = async (req, res) => {
  const { user } = getContext(req);

  const [count, gap, perRow] = [parseInt(req.query.count ?? 6), parseInt(req.query.gap ?? 15), parseInt(req.query.perRow ?? 2)];

  // Make a request to the GitHub API to get the repo's data
  const response = await fetch(`https://api.github.com/users/${user}/starred?sort=created&per_page=${count}`, { headers: githubHeaders() }).then(
    (res) => res.json()
  );

  if (!Array.isArray(response)) {
    // ERROR
    console.error(`ERR: ${JSON.stringify(response)}`);
  }

  res.contentType("image/svg+xml").send(await generateLastStarSvg(response, gap, perRow));
};
