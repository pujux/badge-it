import type { ErrorRequestHandler } from "express";

import logger from "../helpers/logger";

import type { HttpError } from "../types/http";

const statusMessageMap: Record<number, string> = {
  500: "Internal Server Error",
  502: "Upstream Service Error",
  503: "Service Unavailable",
  504: "Upstream Timeout",
};

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
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

  const typedError = err as HttpError;
  const statusCode = Number.isInteger(typedError.statusCode) ? typedError.statusCode : 500;
  const message = statusCode >= 500 ? statusMessageMap[statusCode] ?? statusMessageMap[500] : typedError.message ?? "Request failed";

  res.status(statusCode).send(message);
};

export default errorHandler;
