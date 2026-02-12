import type { Server as HttpServer } from "node:http";

import createApp from "./app";
import logger from "./helpers/logger";
import { createMongoVisitsStore } from "./services/mongoVisitsStore";

function closeServer(server: HttpServer): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

async function bootstrap(): Promise<void> {
  if (process.env.NODE_ENV !== "production") {
    const dotenv = await import("dotenv");
    dotenv.config();
  }

  const port = Number(process.env.APP_PORT ?? 10001);
  const visitsStore = createMongoVisitsStore();
  const app = createApp({ visitsStore });
  const server = app.listen(port, () => {
    logger.info({ port }, "Server is running");
  });
  let shuttingDown = false;

  const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;
    logger.info({ signal }, "Shutting down server");

    const forceExitTimer = setTimeout(() => {
      logger.error({ signal }, "Shutdown timed out, forcing exit");
      process.exit(1);
    }, 10000);
    forceExitTimer.unref();

    try {
      await closeServer(server);
      await visitsStore.close?.();
      logger.info({ signal }, "Shutdown complete");
      process.exit(0);
    } catch (error: unknown) {
      logger.error({ err: error, signal }, "Shutdown failed");
      process.exit(1);
    } finally {
      clearTimeout(forceExitTimer);
    }
  };

  process.once("SIGTERM", () => {
    void shutdown("SIGTERM");
  });
  process.once("SIGINT", () => {
    void shutdown("SIGINT");
  });
}

void bootstrap().catch((error: unknown) => {
  logger.error({ err: error }, "Failed to start server");
  process.exit(1);
});
