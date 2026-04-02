/**
 * errorHandler.js
 *
 * Central Express error-handling middleware.
 * Add as the LAST middleware in src/index.js.
 *
 * Catches errors thrown from controllers and returns a consistent JSON shape:
 *   { code, message, details? }
 */

function errorHandler(err, req, res, _next) {
  const status = err.status || 500
  const message = err.message || 'Internal server error'

  // Log in development so developers can see stack traces
  if (process.env.NODE_ENV !== 'production') {
    console.error('[errorHandler]', req.method, req.path, err)
  }

  res.status(status).json({
    code: status,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  })
}

module.exports = errorHandler
