import express, { type NextFunction, type Request, type Response } from "express";
import swaggerUi from "swagger-ui-express";

import openApiDocument from "../docs/openapi";
import asyncHandler from "../helpers/asyncHandler";
import logger from "../helpers/logger";
import { cacheControlPolicy, withCacheControl } from "../middleware/cacheControl";
import createInMemoryRateLimit from "../middleware/inMemoryRateLimit";
import commitsPeriodicityUser from "./endpoints/commits-periodicity-user";
import contributorsUserRepo from "./endpoints/contributors-user-repo";
import createdUserRepo from "./endpoints/created-user-repo";
import gistsUser from "./endpoints/gists-user";
import lastStarsUser from "./endpoints/last-stars-user";
import reposUser from "./endpoints/repos-user";
import updatedUserRepo from "./endpoints/updated-user-repo";
import createVisitsUserRepoHandler from "./endpoints/visits-user-repo";
import yearsUser from "./endpoints/years-user";

import type { VisitsStore } from "../services/visitsStore";
import { svgResponsePreviewPlugin } from "../docs/svgResponsePreviewPlugin";

interface RouterDependencies {
  visitsStore: VisitsStore;
}

interface ParseEnvIntOptions {
  min: number;
  max: number;
}

function parseEnvInt(name: string, defaultValue: number, { min, max }: ParseEnvIntOptions): number {
  const rawValue = process.env[name];

  if (!rawValue) {
    return defaultValue;
  }

  const parsedValue = Number.parseInt(rawValue, 10);

  if (!Number.isInteger(parsedValue) || parsedValue < min || parsedValue > max) {
    return defaultValue;
  }

  return parsedValue;
}

const rateLimitWindowMs = parseEnvInt("RATE_LIMIT_WINDOW_MS", 60_000, { min: 1_000, max: 3_600_000 });
const serviceRateLimitMax = parseEnvInt("RATE_LIMIT_MAX", 1_500, { min: 1, max: 100_000 });
const rateLimitMaxEntries = parseEnvInt("RATE_LIMIT_MAX_ENTRIES", 20_000, { min: 1_000, max: 1_000_000 });

const serviceRateLimit = createInMemoryRateLimit({
  windowMs: rateLimitWindowMs,
  maxRequests: serviceRateLimitMax,
  maxEntries: rateLimitMaxEntries,
});

const swaggerUiOptions: swaggerUi.SwaggerUiOptions = {
  customSiteTitle: "Badge-It API Docs",
  swaggerOptions: {
    plugins: [svgResponsePreviewPlugin],
  },
};

const swaggerUiHtml = swaggerUi.generateHTML(openApiDocument, swaggerUiOptions).replace("<head>", '<head>\n  <base href="/docs/">');
const swaggerUiAssets = swaggerUi.serveFiles(openApiDocument, swaggerUiOptions);

export default function createRouter({ visitsStore }: RouterDependencies) {
  const router = express.Router();

  router.use((req: Request, res: Response, next: NextFunction) => {
    const startedAt = process.hrtime.bigint();

    res.on("finish", () => {
      const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
      logger.info(
        {
          ip: req.ip,
          method: req.method,
          url: req.originalUrl,
          statusCode: res.statusCode,
          durationMs: Number(durationMs.toFixed(1)),
        },
        "Request handled",
      );
    });

    next();
  });

  router.use(serviceRateLimit);

  router.get("/health", withCacheControl(cacheControlPolicy.noStore), (_req: Request, res: Response) => res.send("OK"));
  router.get("/openapi.json", withCacheControl(cacheControlPolicy.docs), (_req: Request, res: Response) => res.json(openApiDocument));

  router.get(/^\/docs\/?$/, withCacheControl(cacheControlPolicy.docs), (_req, res) => res.type("html").send(swaggerUiHtml));
  router.use("/docs", withCacheControl(cacheControlPolicy.docs), swaggerUiAssets);

  router.get(
    "/visits/:user/:repo",
    withCacheControl(cacheControlPolicy.visitsRedirect),
    asyncHandler(createVisitsUserRepoHandler({ visitsStore })),
  );
  router.get("/years/:user", withCacheControl(cacheControlPolicy.badgeRedirect), asyncHandler(yearsUser));
  router.get("/repos/:user", withCacheControl(cacheControlPolicy.badgeRedirect), asyncHandler(reposUser));
  router.get("/gists/:user", withCacheControl(cacheControlPolicy.badgeRedirect), asyncHandler(gistsUser));
  router.get("/updated/:user/:repo", withCacheControl(cacheControlPolicy.badgeRedirect), asyncHandler(updatedUserRepo));
  router.get("/created/:user/:repo", withCacheControl(cacheControlPolicy.badgeRedirect), asyncHandler(createdUserRepo));
  router.get(
    "/commits/:periodicity/:user",
    withCacheControl(cacheControlPolicy.commitsRedirect),
    asyncHandler(commitsPeriodicityUser),
  );
  router.get(
    "/contributors/:user/:repo",
    withCacheControl(cacheControlPolicy.contributorsSvg),
    asyncHandler(contributorsUserRepo),
  );
  router.get(
    "/last-stars/:user",
    withCacheControl(cacheControlPolicy.lastStarsSvg),
    asyncHandler(lastStarsUser),
  );

  return router;
}
