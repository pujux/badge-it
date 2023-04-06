const compression = require("compression");
const express = require("express");
const app = express();

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

app.use(compression());

app.use(require("./routes"));

app.use((_, res) => res.redirect("https://pufler.dev/badge-it"));

app.listen(process.env.APP_PORT, () => console.info(`Server is running on port ${process.env.APP_PORT}`));
