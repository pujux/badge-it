const createHttpError = require("./httpError");

const githubIdentifierRegex = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37})$/;
const colorRegex = /^[A-Za-z0-9_-]{1,30}$/;

function assertGitHubIdentifier(value, fieldName) {
  if (typeof value !== "string" || !githubIdentifierRegex.test(value)) {
    throw createHttpError(400, `Invalid ${fieldName}`);
  }
}

function assertColor(value) {
  if (typeof value !== "string" || !colorRegex.test(value)) {
    throw createHttpError(400, "Invalid color parameter");
  }
}

function parseBoundedInt(rawValue, fieldName, { min, max, defaultValue }) {
  const value = Number.parseInt(rawValue ?? defaultValue, 10);
  if (!Number.isFinite(value) || value < min || value > max) {
    throw createHttpError(400, `Invalid ${fieldName}`);
  }
  return value;
}

function assertOneOf(value, fieldName, allowedValues) {
  if (!allowedValues.includes(value)) {
    throw createHttpError(400, `Invalid ${fieldName} parameter`);
  }
}

module.exports = {
  assertGitHubIdentifier,
  assertColor,
  parseBoundedInt,
  assertOneOf,
};
