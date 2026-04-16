/**
 * File: controllers/authController.js
 * Purpose: Registration + Login.
 * Added: banned users are rejected at login with a clear message.
 */

const User    = require('../models/User');
const Student = require('../models/Student');
const Company = require('../models/Company');
const Admin   = require('../models/Admin');
const bcrypt  = require('bcryptjs');
const generateToken = require('../utils/generateToken');

/**
 * Register — STUDENT and COMPANY only. ADMIN is blocked.
 */
const registerUser = async (req, res) => {
  try {
    const { email, password, role, name, ...roleSpecificFields } = req.body;

    if (!email || !password || !role || !name) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
    }
    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email.' });
    }

    // Block admin registration
    if (role === 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admin accounts cannot be created through registration.',
      });
    }
    if (!['STUDENT', 'COMPANY'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role. Must be STUDENT or COMPANY.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const salt         = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const user         = await User.create({ email, passwordHash, name, role });

    if (role === 'STUDENT') {
      await Student.create({ userId: user._id, firstName: name, ...roleSpecificFields });
    } else {
      await Company.create({ userId: user._id, name, ...roleSpecificFields });
    }

    const token = generateToken(user._id, user.email, user.role);
    const { passwordHash: _, ...userWithoutPassword } = user.toObject();

    return res.status(201).json({ success: true, data: { token, user: userWithoutPassword } });
  } catch (error) {
    console.error(`Register Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

/**
 * Login — rejects banned users with a clear message before issuing a token.
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Check ban status BEFORE issuing a token
    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact the university administration.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user._id, user.email, user.role);
    const { passwordHash: _, ...userWithoutPassword } = user.toObject();

    return res.status(200).json({ success: true, data: { token, user: userWithoutPassword } });
  } catch (error) {
    console.error(`Login Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

module.exports = { registerUser, loginUser };