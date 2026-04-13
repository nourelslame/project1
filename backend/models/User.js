/**
 * File: models/User.js
 * Purpose: Defines the base User schema used for authentication and core identification.
 * Other specific user types (Student, Company, Admin) will reference this model.
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
}, { timestamps: true }); // automatically adds createdAt and updatedAt

module.exports = mongoose.model('User', userSchema);
