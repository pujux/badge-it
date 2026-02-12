const getContext = require("../../helpers/getContext");
const fetchGitHubJson = require("../../helpers/fetchGitHubJson");
const startOf = require("../../helpers/startOf");
const createHttpError = require("../../helpers/httpError");
const redirectBadge = require("../../helpers/redirectBadge");
const { assertGitHubIdentifier, assertOneOf } = require("../../helpers/validators");

const periodicityMap = {
  daily: "day",
  weekly: "week",
  monthly: "month",
  yearly: "year",
  all: null,
};

module.exports = async (req, res) => {
  const { user, periodicity, color, options } = getContext(req);
  assertGitHubIdentifier(user, "user");
  assertOneOf(periodicity, "periodicity", Object.keys(periodicityMap));

  // Fetch commits from GitHub
  const response = await fetchGitHubJson(`/search/commits?q=author:${user}+author-date%3A>=${startOf(periodicityMap[periodicity])}`);

  if (typeof response?.total_count !== "number") {
    throw createHttpError(502, "GitHub returned invalid commit count payload");
  }

  const badgeLabel = periodicity === "all" ? "All commits" : periodicity === "daily" ? "Commits today" : `Commits this ${periodicityMap[periodicity]}`;

  redirectBadge(res, { label: badgeLabel, message: response.total_count, color, options });
};
