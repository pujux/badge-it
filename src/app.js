const compression = require("compression");
const express = require("express");
const errorHandler = require("./middleware/errorHandler");

function createApp() {
  const app = express();

  app.set("trust proxy", true);
  app.use(compression());

  app.use(require("./routes"));

  app.use((_, res) => res.redirect("https://pufler.dev/badge-it"));

  app.use(errorHandler);

  return app;
}

module.exports = createApp;
