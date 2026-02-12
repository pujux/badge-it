const getContext = require("../../helpers/getContext");
const fetchGitHubJson = require("../../helpers/fetchGitHubJson");
const startOf = require("../../helpers/startOf");
const createHttpError = require("../../helpers/httpError");

const periodicityMap = {
  daily: "day",
  weekly: "week",
  monthly: "month",
  yearly: "year",
  all: null,
};

module.exports = async (req, res) => {
  const { user, periodicity, color, options } = getContext(req);

  // Fetch commits from GitHub
  const response = await fetchGitHubJson(`/search/commits?q=author:${user}+author-date%3A>=${startOf(periodicityMap[periodicity])}`);

  if (typeof response?.total_count !== "number") {
    throw createHttpError(502, "GitHub returned invalid commit count payload");
  }

  const badgeText =
    periodicity === "all" ? "All commits" : periodicity === "daily" ? "Commits%20today" : `Commits%20this%20${periodicityMap[periodicity]}`;

  res.redirect(`https://img.shields.io/badge/${badgeText}-${response.total_count}-${color}${options}`);
};
