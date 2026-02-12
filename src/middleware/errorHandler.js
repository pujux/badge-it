const logger = require("../helpers/logger");

function errorHandler(err, req, res, next) {
  logger.error(
    {
      err,
      ip: req.ip,
      method: req.method,
      url: req.originalUrl,
    },
    "Request failed"
  );

  if (res.headersSent) {
    return next(err);
  }

  const statusCode = Number.isInteger(err?.statusCode) ? err.statusCode : 500;
  const statusMessageMap = {
    500: "Internal Server Error",
    502: "Upstream Service Error",
    503: "Service Unavailable",
    504: "Upstream Timeout",
  };
  const message = statusCode >= 500 ? statusMessageMap[statusCode] ?? statusMessageMap[500] : err?.message ?? "Request failed";
  res.status(statusCode).send(message);
}

module.exports = errorHandler;
