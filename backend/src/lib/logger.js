const winston = require('winston');
require('winston-daily-rotate-file');

// ─────────────────────────────────────────────
//  Log level per environment
//  development → debug (all logs)
//  test        → warn  (minimal noise in tests)
//  production  → info  (important events only)
// ─────────────────────────────────────────────
const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const getLevel = () => {
  const env = process.env.NODE_ENV || 'development';
  if (env === 'production') return 'info';
  if (env === 'test') return 'warn';
  return 'debug';
};

const isProduction = process.env.NODE_ENV === 'production';

// ─────────────────────────────────────────────
//  Formats
//  Production  → JSON (parseable by Vercel logs, Datadog, etc.)
//  Development → colorized human-readable console output
// ─────────────────────────────────────────────
const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const devFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return stack
      ? `${timestamp} ${level}: ${message}\n${stack}`
      : `${timestamp} ${level}: ${message}`;
  })
);

winston.addColors({
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
});

// ─────────────────────────────────────────────
//  Transports
//
//  PRODUCTION (Vercel / serverless):
//    → Console ONLY (JSON). No file writes.
//      Vercel captures stdout automatically.
//
//  DEVELOPMENT:
//    → Console (colorized)
//    → Rotating file: logs/error-YYYY-MM-DD.log (errors only)
//    → Rotating file: logs/combined-YYYY-MM-DD.log (all levels)
//      14-day retention, 20MB max per file, gzip archives
// ─────────────────────────────────────────────
const transports = [
  new winston.transports.Console({
    format: isProduction ? jsonFormat : devFormat,
  }),
];

if (!isProduction) {
  transports.push(
    new winston.transports.DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '14d',
      maxSize: '20m',
      zippedArchive: true,
      format: jsonFormat,
    }),
    new winston.transports.DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
      maxSize: '20m',
      zippedArchive: true,
      format: jsonFormat,
    })
  );
}

// ─────────────────────────────────────────────
//  Logger instance
// ─────────────────────────────────────────────
const Logger = winston.createLogger({
  level: getLevel(),
  levels: LOG_LEVELS,
  transports,
  // Prevent unhandled exception crashes from taking down the server
  exitOnError: false,
});

module.exports = Logger;
