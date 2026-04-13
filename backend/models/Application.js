/**
 * File: models/Application.js
 * Purpose: Defines an application submitted by a student for an internship offer.
 */

const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  offerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InternshipOffer',
    required: true,
  },
  status: {
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'REFUSED', 'VALIDATED'],
    default: 'PENDING',
  },
}, { timestamps: true }); // automatically adds appliedAt (createdAt) and updatedAt

module.exports = mongoose.model('Application', applicationSchema);
