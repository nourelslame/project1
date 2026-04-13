/**
 * File: models/Admin.js
 * Purpose: Defines the admin profile extending the User model.
 */

const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fullName: { type: String },
  department: { type: String },
});

module.exports = mongoose.model('Admin', adminSchema);
