import compression from "compression";
import express, { type Express, type Request, type Response } from "express";

import errorHandler from "./middleware/errorHandler";
import createRouter from "./routes";
import { createMongoVisitsStore } from "./services/mongoVisitsStore";

import type { VisitsStore } from "./services/visitsStore";

interface AppDependencies {
  visitsStore?: VisitsStore;
}

export default function createApp({ visitsStore = createMongoVisitsStore() }: AppDependencies = {}): Express {
  const app = express();

  app.set("trust proxy", true);
  app.use(compression());

  app.use(createRouter({ visitsStore }));

  app.use((_req: Request, res: Response) => {
    res.redirect("https://pufler.dev/badge-it");
  });

  app.use(errorHandler);

  return app;
}
