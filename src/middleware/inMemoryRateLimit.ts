import type { Request, RequestHandler, Response } from "express";

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: Request) => string;
  message?: string;
  maxEntries?: number;
}

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

const DEFAULT_MAX_ENTRIES = 20_000;
const sharedBuckets = new Map<string, RateLimitBucket>();

function defaultKeyGenerator(req: Request): string {
  return req.ip || "unknown";
}

function setRateLimitHeaders(res: Response, maxRequests: number, remaining: number, windowMs: number, resetAt: number): void {
  const resetSeconds = Math.max(0, Math.ceil((resetAt - Date.now()) / 1000));
  const windowSeconds = Math.max(1, Math.ceil(windowMs / 1000));

  res.setHeader("RateLimit-Limit", String(maxRequests));
  res.setHeader("RateLimit-Remaining", String(remaining));
  res.setHeader("RateLimit-Reset", String(resetSeconds));
  res.setHeader("RateLimit-Policy", `${maxRequests};w=${windowSeconds}`);
}

export default function createInMemoryRateLimit({
  windowMs,
  maxRequests,
  keyGenerator = defaultKeyGenerator,
  message = "Too Many Requests",
  maxEntries = DEFAULT_MAX_ENTRIES,
}: RateLimitOptions): RequestHandler {
  const safeWindowMs = Math.max(1, windowMs);
  const safeMaxRequests = Math.max(1, maxRequests);
  const safeMaxEntries = Math.max(1_000, maxEntries);

  const pruneExpiredBuckets = (): void => {
    const now = Date.now();

    for (const [key, bucket] of sharedBuckets.entries()) {
      if (bucket.resetAt <= now) {
        sharedBuckets.delete(key);
      }
    }
  };

  return (req, res, next): void => {
    if (sharedBuckets.size > safeMaxEntries) {
      pruneExpiredBuckets();
    }

    if (sharedBuckets.size > safeMaxEntries) {
      const overflow = sharedBuckets.size - safeMaxEntries;
      let removed = 0;

      for (const key of sharedBuckets.keys()) {
        sharedBuckets.delete(key);
        removed += 1;

        if (removed >= overflow) {
          break;
        }
      }
    }

    const now = Date.now();
    const key = keyGenerator(req);
    const bucket = sharedBuckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      const nextBucket: RateLimitBucket = {
        count: 1,
        resetAt: now + safeWindowMs,
      };
      sharedBuckets.set(key, nextBucket);
      setRateLimitHeaders(res, safeMaxRequests, safeMaxRequests - 1, safeWindowMs, nextBucket.resetAt);
      next();
      return;
    }

    if (bucket.count >= safeMaxRequests) {
      const retryAfterSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
      setRateLimitHeaders(res, safeMaxRequests, 0, safeWindowMs, bucket.resetAt);
      res.setHeader("Retry-After", String(retryAfterSeconds));
      res.setHeader("Cache-Control", "no-store");
      res.status(429).send(message);
      return;
    }

    bucket.count += 1;
    const remaining = Math.max(0, safeMaxRequests - bucket.count);
    setRateLimitHeaders(res, safeMaxRequests, remaining, safeWindowMs, bucket.resetAt);
    next();
  };
}
