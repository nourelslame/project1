/**
 * File: middleware/auth.js
 * Purpose: Middleware to verify the JWT token passed in the Authorization header.
 * It decodes the token and attaches the user information (id, email, role) to the request object.
 */

const jwt = require('jsonwebtoken');

/**
 * Middleware function to authenticate requests
 * Returns 401 if token is missing or invalid.
 */
const authMiddleware = (req, res, next) => {
  try {
    // Check if the Authorization header exists and has the "Bearer" scheme
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    // Extract the token from the header
    const token = authHeader.split(' ')[1];

    // Verify the token using the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the decoded user data to the request object
    req.user = decoded;

    // Move to the next middleware or route handler
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }
};

module.exports = authMiddleware;
