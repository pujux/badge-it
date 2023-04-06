const getContext = require("../../helpers/getContext");
const fetch = require("node-fetch");
const generateContributorSvg = require("../../helpers/generateContributorSvg");

module.exports = async (req, res) => {
  const { user, repo } = getContext(req);
  const [size, padding, perRow, bots] = [
    parseInt(req.query.size ?? 50),
    parseInt(req.query.padding ?? 5),
    parseInt(req.query.perRow ?? 10),
    req.query.bots !== "false",
  ];

  let response = await fetch(`https://api.github.com/repos/${user}/${repo}/contributors`).then((res) => res.json());

  if (!Array.isArray(response)) {
    // ERROR
  }

  if (!bots) {
    response = response.filter((contributor) => contributor.type === "User");
  }

  res.contentType("image/svg+xml").send(await generateContributorSvg(response, size, padding, perRow));
};
