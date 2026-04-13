/**
 * File: models/Company.js
 * Purpose: Defines the company profile extending the User model.
 */

const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: { type: String },
  description: { type: String },
  logo: { type: String },
  location: { type: String },
  wilaya: { type: String },
  website: { type: String },
  email: { type: String },
  phone: { type: String },
  linkedin: { type: String },
});

module.exports = mongoose.model('Company', companySchema);
