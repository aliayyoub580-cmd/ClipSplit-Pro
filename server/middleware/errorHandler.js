/**
 * Centralised error-handling middleware.
 *
 *  notFound     – catch-all 404 for undefined routes
 *  errorHandler – global error handler, strips stack traces in production
 */

/**
 * 404 handler – must be registered after all valid routes.
 */
function notFound(req, res, next) {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

/**
 * Global error handler – must be registered last (4-argument signature).
 *
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // CORS errors surface here
  if (err.message && err.message.startsWith("CORS")) {
    return res.status(403).json({ success: false, error: err.message });
  }

  const statusCode = err.status || err.statusCode || 500;
  const isDev = process.env.NODE_ENV !== "production";

  console.error(`[ERROR] ${statusCode} ${req.method} ${req.originalUrl}`, err);

  res.status(statusCode).json({
    success: false,
    error: err.message || "An unexpected error occurred. Please try again.",
    // Only expose stack trace in development
    ...(isDev && { stack: err.stack }),
  });
}

module.exports = { notFound, errorHandler };
