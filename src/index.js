const compression = require("compression");
const express = require("express");
const errorHandler = require("./middleware/errorHandler");
const app = express();

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const port = process.env.APP_PORT ?? 10001;

app.set("trust proxy", true);
app.use(compression());

app.use(require("./routes"));

app.use((_, res) => res.redirect("https://pufler.dev/badge-it"));

app.use(errorHandler);

app.listen(port, () => console.info(`Server is running on port ${port}`));
