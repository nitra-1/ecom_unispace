/**
 * auth.js – JWT Authentication Middleware
 *
 * Protects admin routes. Customer routes that require the user to be logged in
 * use the same middleware.
 *
 * How it works:
 *   1. Client sends: Authorization: Bearer <token>
 *   2. Middleware verifies the JWT.
 *   3. Decoded payload is attached to req.user for use in controllers.
 *
 * Usage:
 *   router.use(authenticate)          – require any valid token
 *   router.use(requireAdmin)          – require admin role
 */

const jwt = require('jsonwebtoken')

/**
 * authenticate
 * Verifies the JWT in the Authorization header.
 */
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization']
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ code: 401, message: 'Authentication required.' })
  }

  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch {
    return res.status(401).json({ code: 401, message: 'Invalid or expired token.' })
  }
}

/**
 * requireAdmin
 * Must be used AFTER authenticate.
 * Checks that req.user.role === 'admin'.
 */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ code: 403, message: 'Admin access required.' })
  }
  next()
}

module.exports = { authenticate, requireAdmin }
