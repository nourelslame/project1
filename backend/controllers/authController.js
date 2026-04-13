/**
 * File: controllers/authController.js
 * Purpose: Handles user registration and login endpoints.
 */

const User = require('../models/User');
const Student = require('../models/Student');
const Company = require('../models/Company');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');

/**
 * Register a new user and create their specific profile.
 */
const registerUser = async (req, res) => {
  try {
    const { email, password, role, name, ...roleSpecificFields } = req.body;

    // Optional basic manual validation
    if (!email || !password || !role || !name) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields (email, password, role, name).' });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
    }
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email.' });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists.' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create the base user
    const user = await User.create({
      email,
      passwordHash,
      name,
      role
    });

    // Create the role-specific profile based on the role
    if (role === 'STUDENT') {
      await Student.create({ userId: user._id, firstName: name, ...roleSpecificFields });
    } else if (role === 'COMPANY') {
      await Company.create({ userId: user._id, name: name, ...roleSpecificFields });
    } else if (role === 'ADMIN') {
      await Admin.create({ userId: user._id, fullName: name, ...roleSpecificFields });
    } else {
      // If role is invalid, remove the created user and return error
      await User.findByIdAndDelete(user._id);
      return res.status(400).json({ success: false, message: 'Invalid role provided.' });
    }

    // Generate JWT token
    const token = generateToken(user._id, user.email, user.role);

    // Remove passwordHash from the response using destructuring
    const { passwordHash: _, ...userWithoutPassword } = user.toObject();

    return res.status(201).json({
      success: true,
      data: {
        token,
        user: userWithoutPassword
      }
    });
  } catch (error) {
    console.error(`Register Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

/**
 * Login an existing user.
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Manual validation
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Generate JWT token
    const token = generateToken(user._id, user.email, user.role);

    // Provide user without password
    const { passwordHash: _, ...userWithoutPassword } = user.toObject();

    return res.status(200).json({
      success: true,
      data: {
        token,
        user: userWithoutPassword
      }
    });

  } catch (error) {
    console.error(`Login Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

module.exports = {
  registerUser,
  loginUser
};
