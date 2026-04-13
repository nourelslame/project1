/**
 * File: middleware/roles.js
 * Purpose: Middleware for role-based access control (RBAC).
 * It restricts endpoint access based on the logged-in user's role.
 */

/**
 * Returns a middleware function that checks if the request user role is allowed.
 * Usage: roles('STUDENT') or roles('ADMIN', 'COMPANY')
 * 
 * @param  {...string} allowedRoles - The roles permitted to access the route.
 * @returns {Function} Express middleware function
 */
const roles = (...allowedRoles) => {
  return (req, res, next) => {
    // Check if req.user exists (set by authMiddleware)
    if (!req.user || !req.user.role) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }

    // Check if the user's role is included in the allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden: You lack the required permissions.' });
    }

    // Proceed if the role is allowed
    next();
  };
};

module.exports = roles;
