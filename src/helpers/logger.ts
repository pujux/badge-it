import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";
const shouldUsePretty = process.env.LOG_PRETTY !== undefined ? process.env.LOG_PRETTY !== "false" : !isProduction;

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
