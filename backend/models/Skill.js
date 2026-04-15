/**
 * File: models/Skill.js
 * Purpose: Stores the platform-wide catalog of technical skills.
 * Managed by admin, read by students and companies.
 */

const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,   // no duplicate skill names
    trim: true,
  },
  category: {
    type: String,
    enum: ['Frontend', 'Backend', 'Mobile', 'DevOps', 'Database', 'Language', 'Other'],
    default: 'Other',
  },
}, { timestamps: true });

module.exports = mongoose.model('Skill', skillSchema);