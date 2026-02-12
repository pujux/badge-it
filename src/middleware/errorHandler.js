function errorHandler(err, req, res, next) {
  console.error(`REQ-ERR: ${req.ip} ${req.method} ${req.originalUrl} ${err?.message ?? "Unknown error"}`);

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
