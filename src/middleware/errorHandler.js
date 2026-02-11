function errorHandler(err, req, res, next) {
  console.error(`REQ-ERR: ${req.ip} ${req.method} ${req.originalUrl} ${err?.message ?? "Unknown error"}`);

  if (res.headersSent) {
    return next(err);
  }

  const statusCode = Number.isInteger(err?.statusCode) ? err.statusCode : 500;
  res.status(statusCode).send(statusCode >= 500 ? "Internal Server Error" : "Bad Request");
}

module.exports = errorHandler;
