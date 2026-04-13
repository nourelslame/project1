/**
 * File: models/Student.js
 * Purpose: Defines the student profile extending the User model.
 */

const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  firstName: { type: String },
  lastName: { type: String },
  university: { type: String },
  department: { type: String },
  year: { type: Number },
  githubLink: { type: String },
  portfolioLink: { type: String },
  skills: [{ type: String }],
  wilaya: { type: String },
  bio: { type: String },
  address: { type: String },
  phone: { type: String },
  level: { type: String },
  specialty: { type: String },
  profilePhoto: { type: String },
});

module.exports = mongoose.model('Student', studentSchema);
