/**
 * File: models/InternshipOffer.js
 * Purpose: Defines an internship offer posted by a company.
 */

const mongoose = require('mongoose');

const internshipOfferSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  requiredSkills: [{ type: String }],
  type: {
    type: String,
    enum: ['TECHNICAL', 'RESEARCH', 'COMMERCIAL', 'OTHER'],
    required: true,
  },
  wilaya: { type: String, required: true },
  duration: { type: Number, required: true }, // duration in months
  startDate: { type: Date, required: true },
  deadline: { type: Date, required: true },
  status: {
    type: String,
    enum: ['OPEN', 'CLOSED', 'ARCHIVED'],
    default: 'OPEN',
  },
  slots: { type: Number, default: 1 },
  applicants: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('InternshipOffer', internshipOfferSchema);
