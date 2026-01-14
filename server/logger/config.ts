/**
 * Configuração de Logging com Winston
 */

import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";

export const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
} as const;

export type LogLevel = keyof typeof LOG_LEVELS;

const LOG_COLORS = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "blue",
};

winston.addColors(LOG_COLORS);

const isDevelopment = process.env.NODE_ENV !== "production";
const logLevel = (process.env.LOG_LEVEL as LogLevel) || (isDevelopment ? "debug" : "info");
const logsDir = process.env.LOGS_DIR || path.join(process.cwd(), "logs");

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, context, requestId, ...meta }) => {
    let log = `${timestamp} [${level}]`;
    if (requestId) log += ` [${requestId}]`;
    if (context) log += ` [${context}]`;
    log += `: ${message}`;
    const metaKeys = Object.keys(meta);
    if (metaKeys.length > 0) log += ` ${JSON.stringify(meta)}`;
    return log;
  })
);

const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

export const loggerConfig: winston.LoggerOptions = {
  levels: LOG_LEVELS,
  level: logLevel,
  transports: [
    new winston.transports.Console({
      format: consoleFormat,
      level: logLevel,
    }),
    new DailyRotateFile({
      filename: path.join(logsDir, "application-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
      format: fileFormat,
      level: logLevel,
    }),
    new DailyRotateFile({
      filename: path.join(logsDir, "error-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "30d",
      format: fileFormat,
      level: "error",
    }),
  ],
  exitOnError: false,
};

export const LOGGER_CONFIG = {
  levels: LOG_LEVELS,
  level: logLevel,
  logsDir,
  isDevelopment,
} as const;
