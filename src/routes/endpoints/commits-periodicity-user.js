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
  const { periodicity, user, options } = getContext(req);

  const response = await fetch(`https://api.github.com/search/commits?q=author:${user}+author-date%3A>=${startOf(periodicityMap[periodicity])}`, {
    headers: githubHeaders(),
  }).then((res) => res.json());

  if (!response?.total_count) {
    // ERROR
    console.error(`ERR: ${JSON.stringify(response)} `);
  }

  res.redirect(
    `https://img.shields.io/badge/${
      periodicity === "all" ? "All commits" : periodicity === "daily" ? "Commits%20today" : `Commits%20this%20${periodicityMap[periodicity]}`
    }-${response.total_count}-brightgreen${options}`
  );
};
