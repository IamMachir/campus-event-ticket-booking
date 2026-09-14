const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Express middleware enforcing JWT-based authentication.
 *
 * Expects an `Authorization: Bearer <token>` header. On success, attaches
 * the decoded token payload ({ id, email, role }) to req.user for
 * downstream handlers and requireRole() to use.
 *
 * Security note: signature verification via jwt.verify() ensures the token
 * hasn't been tampered with and matches the server's JWT_SECRET; expired
 * tokens are also rejected here.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Express middleware factory enforcing role-based access control (RBAC).
 * Must run after requireAuth, since it depends on req.user being set.
 *
 * @param {...string} roles - allowed roles (e.g. 'organizer', 'admin')
 * @returns {import('express').RequestHandler}
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
