import express, { type NextFunction, type Request, type Response } from "express";
import swaggerUi from "swagger-ui-express";

import openApiDocument from "../docs/openapi";
import asyncHandler from "../helpers/asyncHandler";
import logger from "../helpers/logger";
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

  router.get("/health", (_req: Request, res: Response) => res.send("OK"));
  router.get("/openapi.json", (_req: Request, res: Response) => res.json(openApiDocument));

  router.get(/^\/docs\/?$/, (_req, res) => res.type("html").send(swaggerUiHtml));
  router.use("/docs", swaggerUiAssets);

  router.get("/visits/:user/:repo", asyncHandler(createVisitsUserRepoHandler({ visitsStore })));
  router.get("/years/:user", asyncHandler(yearsUser));
  router.get("/repos/:user", asyncHandler(reposUser));
  router.get("/gists/:user", asyncHandler(gistsUser));
  router.get("/updated/:user/:repo", asyncHandler(updatedUserRepo));
  router.get("/created/:user/:repo", asyncHandler(createdUserRepo));
  router.get("/commits/:periodicity/:user", asyncHandler(commitsPeriodicityUser));
  router.get("/contributors/:user/:repo", asyncHandler(contributorsUserRepo));
  router.get("/last-stars/:user", asyncHandler(lastStarsUser));

  return router;
}
