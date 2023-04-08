module.exports = () => {
  return {
    "User-Agent": "pujux/badge-it",
    accept: "application/vnd.github.v3+json",
    Authorization: process.env.GITHUB_ACCESS_TOKEN ? "Bearer " + process.env.GITHUB_ACCESS_TOKEN : "",
  };
};
