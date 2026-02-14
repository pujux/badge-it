import type { RequestHandler } from "express";

export const cacheControlPolicy = {
  noStore: "no-store",
  docs: "public, max-age=300, s-maxage=300",
  badgeRedirect: "public, max-age=0, s-maxage=300, stale-while-revalidate=600",
  commitsRedirect: "public, max-age=0, s-maxage=120, stale-while-revalidate=300",
  visitsRedirect: "no-store",
  contributorsSvg: "public, max-age=0, s-maxage=300, stale-while-revalidate=600",
  lastStarsSvg: "public, max-age=0, s-maxage=300, stale-while-revalidate=600",
} as const;

export function withCacheControl(value: string): RequestHandler {
  return (_req, res, next): void => {
    res.setHeader("Cache-Control", value);
    next();
  };
}
