const getContext = require("../../helpers/getContext");
const fetch = require("node-fetch");
const startOf = require("../../helpers/startOf");
const githubHeaders = require("../../helpers/githubHeaders");

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
  const response = await fetch(`https://api.github.com/search/commits?q=author:${user}+author-date%3A>=${startOf(periodicityMap[periodicity])}`, {
    headers: githubHeaders(),
  }).then((res) => res.json());

  if (!response?.total_count) {
    console.error(`ERR: ${JSON.stringify(response)} `);
  }

  const badgeText =
    periodicity === "all" ? "All commits" : periodicity === "daily" ? "Commits%20today" : `Commits%20this%20${periodicityMap[periodicity]}`;

  res.redirect(`https://img.shields.io/badge/${badgeText}-${response.total_count}-${color}${options}`);
};
