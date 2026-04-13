/**
 * File: utils/generateToken.js
 * Purpose: Helper function to generate a JWT token for standard authentication.
 */

const jwt = require('jsonwebtoken');

/**
 * Generates a JSON Web Token (JWT) with the provided payload.
 * 
 * @param {string} id - The user ID
 * @param {string} email - The user's email
 * @param {string} role - The user's role (e.g., 'STUDENT', 'COMPANY', 'ADMIN')
 * @returns {string} The signed JWT token
 */
const generateToken = (id, email, role) => {
  // Sign the token with user details and a secret key, expires in 7 days
  return jwt.sign(
    { id, email, role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

module.exports = generateToken;
