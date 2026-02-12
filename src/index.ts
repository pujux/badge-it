import createApp from "./app";
import logger from "./helpers/logger";

async function bootstrap(): Promise<void> {
  if (process.env.NODE_ENV !== "production") {
    const dotenv = await import("dotenv");
    dotenv.config();
  }

  const port = Number(process.env.APP_PORT ?? 10001);
  const app = createApp();

  app.listen(port, () => {
    logger.info({ port }, "Server is running");
  });
}

void bootstrap().catch((error: unknown) => {
  logger.error({ err: error }, "Failed to start server");
  process.exit(1);
});
