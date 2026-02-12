import compression from "compression";
import express, { type Express, type Request, type Response } from "express";

import errorHandler from "./middleware/errorHandler";
import routes from "./routes";

export default function createApp(): Express {
  const app = express();

  app.set("trust proxy", true);
  app.use(compression());

  app.use(routes);

  app.use((_req: Request, res: Response) => {
    res.redirect("https://pufler.dev/badge-it");
  });

  app.use(errorHandler);

  return app;
}
