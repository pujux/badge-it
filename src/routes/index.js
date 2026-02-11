const express = require("express");
const asyncHandler = require("../helpers/asyncHandler");
const router = express.Router();

router.use((req, _, next) => {
  console.info(`REQ: ${req.ip} ${req.method} ${req.url} `);
  next();
});

router.use("/health", (_, res) => res.send("OK"));

router.get("/visits/:user/:repo", asyncHandler(require("./endpoints/visits-user-repo")));

router.get("/years/:user", asyncHandler(require("./endpoints/years-user")));

router.get("/repos/:user", asyncHandler(require("./endpoints/repos-user")));

router.get("/gists/:user", asyncHandler(require("./endpoints/gists-user")));

router.get("/updated/:user/:repo", asyncHandler(require("./endpoints/updated-user-repo")));

router.get("/created/:user/:repo", asyncHandler(require("./endpoints/created-user-repo")));

router.get("/commits/:periodicity/:user", asyncHandler(require("./endpoints/commits-periodicity-user")));

router.get("/contributors/:user/:repo", asyncHandler(require("./endpoints/contributors-user-repo")));

router.get("/last-stars/:user", asyncHandler(require("./endpoints/last-stars-user.js")));

module.exports = router;
