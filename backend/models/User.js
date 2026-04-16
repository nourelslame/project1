/**
 * File: models/User.js
 * Purpose: Base User schema for authentication.
 * Added: isBanned field so admin can block/unblock accounts.
 */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['STUDENT', 'COMPANY', 'ADMIN'],
    required: true,
  },
  // Admin can set this to true to block the user from logging in
  isBanned: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);