import compression from "compression";
import express, { type Express, type Request, type Response } from "express";

import errorHandler from "./middleware/errorHandler";
import createRouter from "./routes";
import { createMongoVisitsStore } from "./services/mongoVisitsStore";

import type { VisitsStore } from "./services/visitsStore";

interface AppDependencies {
  visitsStore?: VisitsStore;
}

function resolveTrustProxySetting(rawValue: string | undefined): boolean | number | string | string[] {
  if (rawValue === undefined) {
    return true;
  }

  let value = rawValue.trim();

  if (value.includes(",")) {
    value = value.split(",").at(0)?.trim() ?? "false";
  }

  if (value.length === 0 || value === "false") {
    return false;
  }

  if (value === "true") {
    return true;
  }

  if (/^\d+$/.test(value)) {
    return Number.parseInt(value, 10);
  }

  return value;
}

export default function createApp({ visitsStore = createMongoVisitsStore() }: AppDependencies = {}): Express {
  const app = express();

  app.set("trust proxy", resolveTrustProxySetting(process.env.TRUST_PROXY));
  app.use(compression());

  app.use(createRouter({ visitsStore }));

  app.use((_req: Request, res: Response) => {
    res.redirect("https://pufler.dev/badge-it");
  });

  app.use(errorHandler);

  return app;
}
