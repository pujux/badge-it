const pino = require("pino");

const loggerOptions = {
  level: process.env.LOG_LEVEL ?? "info",
};

loggerOptions.transport = {
  target: "pino-pretty",
  options: {
    colorize: true,
    translateTime: "SYS:standard",
    ignore: "pid,hostname",
    singleLine: true,
  },
};

module.exports = pino(loggerOptions);
