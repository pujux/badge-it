import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";
const prettyRequested = process.env.LOG_PRETTY !== undefined ? process.env.LOG_PRETTY !== "false" : !isProduction;

function hasPrettyTransport(): boolean {
  try {
    require.resolve("pino-pretty");
    return true;
  } catch {
    return false;
  }
}

const shouldUsePretty = prettyRequested && hasPrettyTransport();

const loggerOptions: pino.LoggerOptions = {
  level: process.env.LOG_LEVEL ?? "info",
};

if (shouldUsePretty) {
  loggerOptions.transport = {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "SYS:standard",
      ignore: "pid,hostname",
      singleLine: true,
    },
  };
}

const logger = pino(loggerOptions);

export default logger;
