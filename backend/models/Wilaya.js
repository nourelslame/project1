/**
 * File: models/Wilaya.js
 * Purpose: Stores the list of Algerian wilayas available on the platform.
 * Managed by admin, read by everyone (students, companies, search filters).
 */

const mongoose = require('mongoose');

const wilayaSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Wilaya', wilayaSchema);