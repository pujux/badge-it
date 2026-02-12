const express = require("express");
const asyncHandler = require("../helpers/asyncHandler");
const logger = require("../helpers/logger");
const router = express.Router();

router.use((req, res, next) => {
  const startedAt = process.hrtime.bigint();
  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
    logger.info(
      {
        ip: req.ip,
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        durationMs: Number(durationMs.toFixed(1)),
      },
      "Request handled"
    );
  });

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
