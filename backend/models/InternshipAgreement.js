/**
 * File: models/InternshipAgreement.js
 * Purpose: Defines a validated internship agreement Document and its PDF path.
 */

const mongoose = require('mongoose');

const internshipAgreementSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true,
  },
  pdfPath: { type: String }, // Path to the generated PDF
  universityName: { type: String, required: true },
  supervisorName: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
}, { timestamps: true }); // automatically adds generatedAt (createdAt) and updatedAt

module.exports = mongoose.model('InternshipAgreement', internshipAgreementSchema);
