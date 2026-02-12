function createHttpError(statusCode, message, details) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.details = details;
  return error;
}

module.exports = createHttpError;
