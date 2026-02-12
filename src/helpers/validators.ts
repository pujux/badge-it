import createHttpError from "./httpError";

const githubUsernameRegex = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/;
const githubRepoNameRegex = /^[A-Za-z0-9._-]{1,100}$/;
const colorRegex = /^[A-Za-z0-9_-]{1,30}$/;
const integerStringRegex = /^-?\d+$/;

interface ParseBoundedIntOptions {
  min: number;
  max: number;
  defaultValue: number;
}

export function assertGitHubUsername(value: string | undefined): asserts value is string {
  if (typeof value !== "string" || !githubUsernameRegex.test(value)) {
    throw createHttpError(400, "Invalid user parameter");
  }
}

export function assertGitHubRepoName(value: string | undefined): asserts value is string {
  if (typeof value !== "string" || !githubRepoNameRegex.test(value)) {
    throw createHttpError(400, "Invalid repo parameter");
  }
}

export function assertColor(value: string | undefined): asserts value is string {
  if (typeof value !== "string" || !colorRegex.test(value)) {
    throw createHttpError(400, "Invalid color parameter");
  }
}

export function parseBoundedInt(rawValue: string | undefined, fieldName: string, { min, max, defaultValue }: ParseBoundedIntOptions): number {
  const sourceValue = rawValue ?? String(defaultValue);
  const normalized = sourceValue.trim();

  if (!integerStringRegex.test(normalized)) {
    throw createHttpError(400, `Invalid ${fieldName}`);
  }

  const value = Number(normalized);

  if (!Number.isInteger(value) || value < min || value > max) {
    throw createHttpError(400, `Invalid ${fieldName}`);
  }

  return value;
}

export function assertOneOf<T extends string>(value: string | undefined, fieldName: string, allowedValues: readonly T[]): asserts value is T {
  if (!value || !allowedValues.includes(value as T)) {
    throw createHttpError(400, `Invalid ${fieldName} parameter`);
  }
}
