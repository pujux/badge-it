import { config as loadEnv } from "dotenv";

import createApp from "./app";
import logger from "./helpers/logger";

if (process.env.NODE_ENV !== "production") {
  loadEnv();
}

const port = Number(process.env.APP_PORT ?? 10001);
const app = createApp();

app.listen(port, () => {
  logger.info({ port }, "Server is running");
});
