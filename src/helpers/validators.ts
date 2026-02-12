import createHttpError from "./httpError";

const githubIdentifierRegex = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37})$/;
const colorRegex = /^[A-Za-z0-9_-]{1,30}$/;

interface ParseBoundedIntOptions {
  min: number;
  max: number;
  defaultValue: number;
}

export function assertGitHubIdentifier(value: string | undefined, fieldName: string): asserts value is string {
  if (typeof value !== "string" || !githubIdentifierRegex.test(value)) {
    throw createHttpError(400, `Invalid ${fieldName}`);
  }
}

export function assertColor(value: string | undefined): asserts value is string {
  if (typeof value !== "string" || !colorRegex.test(value)) {
    throw createHttpError(400, "Invalid color parameter");
  }
}

export function parseBoundedInt(rawValue: string | undefined, fieldName: string, { min, max, defaultValue }: ParseBoundedIntOptions): number {
  const value = Number.parseInt(rawValue ?? String(defaultValue), 10);

  if (!Number.isFinite(value) || value < min || value > max) {
    throw createHttpError(400, `Invalid ${fieldName}`);
  }

  return value;
}

export function assertOneOf<T extends string>(value: string | undefined, fieldName: string, allowedValues: readonly T[]): asserts value is T {
  if (!value || !allowedValues.includes(value as T)) {
    throw createHttpError(400, `Invalid ${fieldName} parameter`);
  }
}
