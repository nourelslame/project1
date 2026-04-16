/**
 * File: controllers/companyController.js
 * Purpose: Company profile operations + logo upload.
 * Added: uploadLogo — handles multipart/form-data file upload.
 */

const Company      = require('../models/Company');
const InternshipOffer = require('../models/InternshipOffer');
const Application  = require('../models/Application');
const Admin        = require('../models/Admin');
const sendNotification = require('../utils/sendNotification');
const path         = require('path');
const fs           = require('fs');

/**
 * Get the current company's profile.
 */
const getProfile = async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user.id }).populate('userId', '-passwordHash');
    if (!company) return res.status(404).json({ success: false, message: 'Company profile not found.' });
    return res.status(200).json({ success: true, data: company });
  } catch (error) {
    console.error(`Get Company Profile Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error retrieving company profile.' });
  }
};

/**
 * Update the current company's profile (text fields only).
 */
const updateProfile = async (req, res) => {
  try {
    // Ignore any logo field sent via JSON — logo is handled by uploadLogo
    const { logo, ...safeFields } = req.body;

    const updatedCompany = await Company.findOneAndUpdate(
      { userId: req.user.id },
      { $set: safeFields },
      { new: true, runValidators: true }
    );
    if (!updatedCompany) {
      return res.status(404).json({ success: false, message: 'Company profile not found.' });
    }
    return res.status(200).json({ success: true, data: updatedCompany });
  } catch (error) {
    console.error(`Update Company Profile Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error updating company profile.' });
  }
};

/**
 * Upload (or replace) the company logo.
 * Route: POST /api/company/logo   — multipart/form-data, field name: "logo"
 * Handled by multer middleware before this function runs.
 */
const uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    // Build the public URL path that the frontend will use
    const logoUrl = `/uploads/logos/${req.file.filename}`;

    // Find the company and delete the old logo file if it exists
    const company = await Company.findOne({ userId: req.user.id });
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found.' });
    }

    if (company.logo) {
      // Delete old logo from disk (ignore errors — file might already be gone)
      const oldPath = path.join(__dirname, '..', company.logo);
      if (fs.existsSync(oldPath)) {
        try { fs.unlinkSync(oldPath); } catch { /* ignore */ }
      }
    }

    // Save the new logo path
    company.logo = logoUrl;
    await company.save();

    return res.status(200).json({
      success: true,
      data:    { logo: logoUrl },
      message: 'Logo uploaded successfully.',
    });
  } catch (error) {
    console.error(`Upload Logo Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error uploading logo.' });
  }
};

/**
 * Get all offers posted by the current company.
 */
const getMyOffers = async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user.id });
    if (!company) return res.status(404).json({ success: false, message: 'Company not found.' });
    const offers = await InternshipOffer.find({ companyId: company._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: offers });
  } catch (error) {
    console.error(`Get My Offers Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error retrieving offers.' });
  }
};

/**
 * Get applicants for a specific offer.
 */
const getCandidates = async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user.id });
    const offer   = await InternshipOffer.findOne({ _id: req.params.offerId, companyId: company._id });
    if (!offer) return res.status(404).json({ success: false, message: 'Offer not found or unauthorized.' });

    const applications = await Application.find({ offerId: offer._id }).populate('studentId');
    return res.status(200).json({ success: true, data: applications });
  } catch (error) {
    console.error(`Get Candidates Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error retrieving candidates.' });
  }
};

/**
 * Accept a candidate.
 */
const acceptCandidate = async (req, res) => {
  try {
    const application = await Application.findById(req.params.appId)
      .populate('studentId')
      .populate('offerId');
    if (!application) return res.status(404).json({ success: false, message: 'Application not found.' });

    application.status = 'ACCEPTED';
    await application.save();

    await sendNotification(
      application.studentId.userId,
      `Congratulations! Your application for "${application.offerId.title}" has been accepted by the company.`,
      'CANDIDATE_ACCEPTED'
    );

    const admins = await Admin.find();
    for (const admin of admins) {
      await sendNotification(
        admin.userId,
        `${application.studentId.firstName} has been accepted for "${application.offerId.title}". Validation required.`,
        'VALIDATION_REQUIRED'
      );
    }

    return res.status(200).json({ success: true, data: application });
  } catch (error) {
    console.error(`Accept Candidate Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error accepting candidate.' });
  }
};

/**
 * Refuse a candidate.
 */
const refuseCandidate = async (req, res) => {
  try {
    const application = await Application.findById(req.params.appId)
      .populate('studentId')
      .populate('offerId');
    if (!application) return res.status(404).json({ success: false, message: 'Application not found.' });

    application.status = 'REFUSED';
    await application.save();

    await sendNotification(
      application.studentId.userId,
      `Unfortunately, your application for "${application.offerId.title}" has been refused.`,
      'NEW_APPLICATION'
    );

    return res.status(200).json({ success: true, data: application });
  } catch (error) {
    console.error(`Refuse Candidate Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error refusing candidate.' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadLogo,
  getMyOffers,
  getCandidates,
  acceptCandidate,
  refuseCandidate,
};