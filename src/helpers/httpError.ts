import type { HttpError } from "../types/http";

export default function createHttpError(statusCode: number, message: string, details?: unknown): HttpError {
  const error = new Error(message) as HttpError;
  error.statusCode = statusCode;

  if (details !== undefined) {
    error.details = details;
  }

  return error;
}
