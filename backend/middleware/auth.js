/**
 * File: middleware/auth.js
 * Purpose: Verifies the JWT token and blocks banned users from accessing the API.
 */

const jwt  = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware:
 * 1. Checks the Authorization header for a valid Bearer JWT.
 * 2. Decodes the token and attaches req.user = { id, email, role }.
 * 3. Checks the database to see if the user is banned — returns 403 if so.
 */
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    const token   = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the user still exists and is not banned
    const user = await User.findById(decoded.id).select('isBanned role email');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists.' });
    }
    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact the university administration.',
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }
};

module.exports = authMiddleware;