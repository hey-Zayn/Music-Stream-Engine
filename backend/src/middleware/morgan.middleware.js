const morgan = require('morgan');
const crypto = require('crypto');
const Logger = require('../lib/logger');

// ─────────────────────────────────────────────
//  Morgan → Winston stream
//  All HTTP logs flow through Winston so everything
//  stays in one unified logging system.
// ─────────────────────────────────────────────
const stream = {
  write: (message) => {
    // Morgan adds a trailing newline — trim it before passing to Winston
    Logger.http(message.trim());
  },
};

// ─────────────────────────────────────────────
//  Custom Morgan token: request ID
//  Adds a unique ID to every request so you can
//  trace a full request lifecycle in the logs.
// ─────────────────────────────────────────────
morgan.token('request-id', (req) => req.requestId || '-');

// ─────────────────────────────────────────────
//  Custom Morgan token: safe URL
//  Strips query params that may contain tokens
//  e.g. /api/auth?token=xxx → /api/auth?token=[REDACTED]
// ─────────────────────────────────────────────
morgan.token('safe-url', (req) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const sensitiveParams = ['token', 'key', 'secret', 'password', 'apikey'];
    sensitiveParams.forEach((param) => {
      if (url.searchParams.has(param)) {
        url.searchParams.set(param, '[REDACTED]');
      }
    });
    return url.pathname + (url.search || '');
  } catch {
    return req.url;
  }
});

// ─────────────────────────────────────────────
//  Morgan format
//  :request-id  — unique request ID
//  :method      — HTTP method
//  :safe-url    — URL with sensitive params redacted
//  :status      — response status code
//  :res[content-length] — response size
//  :response-time ms    — how long the request took
// ─────────────────────────────────────────────
const morganFormat =
  ':request-id :method :safe-url :status :res[content-length] - :response-time ms';

// ─────────────────────────────────────────────
//  Skip function
//  Avoids logging noise from health-check routes
// ─────────────────────────────────────────────
const skip = (req) => {
  const noisyRoutes = ['/', '/favicon.ico'];
  return req.method === 'GET' && noisyRoutes.includes(req.url);
};

// ─────────────────────────────────────────────
//  Request ID middleware
//  Assigns a unique ID to each request.
//  Also sends it back as a response header
//  so clients can reference it in bug reports.
// ─────────────────────────────────────────────
const requestIdMiddleware = (req, res, next) => {
  req.requestId = crypto.randomUUID();
  res.setHeader('X-Request-Id', req.requestId);
  next();
};

// ─────────────────────────────────────────────
//  Exported middleware stack
//  Mount both in index.js: app.use(morganMiddleware)
// ─────────────────────────────────────────────
const httpLogger = morgan(morganFormat, { stream, skip });

module.exports = { requestIdMiddleware, httpLogger };
