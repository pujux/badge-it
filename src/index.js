const createApp = require("./app");
const logger = require("./helpers/logger");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const port = process.env.APP_PORT ?? 10001;
const app = createApp();

app.listen(port, () => logger.info({ port }, "Server is running"));
