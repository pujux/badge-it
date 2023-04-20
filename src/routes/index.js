const express = require("express");
const router = express.Router();

router.use((req, _, next) => {
  console.info(`REQ: ${req.ip} ${req.method} ${req.url} `);
  next();
});

router.use("/health", (_, res) => res.send("OK"));

router.get("/visits/:user/:repo", require("./endpoints/visits-user-repo"));

router.get("/years/:user", require("./endpoints/years-user"));

router.get("/repos/:user", require("./endpoints/repos-user"));

router.get("/gists/:user", require("./endpoints/gists-user"));

router.get("/updated/:user/:repo", require("./endpoints/updated-user-repo"));

router.get("/created/:user/:repo", require("./endpoints/created-user-repo"));

router.get("/commits/:periodicity/:user", require("./endpoints/commits-periodicity-user"));

router.get("/contributors/:user/:repo", require("./endpoints/contributors-user-repo"));

router.get("/last-stars/:user", require("./endpoints/last-stars-user.js"));

module.exports = router;
