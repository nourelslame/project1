/**
 * File: controllers/companyController.js
 * Purpose: Handles operations related to the company profile and candidates.
 */

const Company = require('../models/Company');
const InternshipOffer = require('../models/InternshipOffer');
const Application = require('../models/Application');
const Admin = require('../models/Admin');
const sendNotification = require('../utils/sendNotification');

/**
 * Get the current company's profile.
 */
const getProfile = async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user.id }).populate('userId', '-passwordHash');
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company profile not found.' });
    }
    return res.status(200).json({ success: true, data: company });
  } catch (error) {
    console.error(`Get Company Profile Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error retrieving company profile.' });
  }
};

/**
 * Update the current company's profile.
 */
const updateProfile = async (req, res) => {
  try {
    const updatedCompany = await Company.findOneAndUpdate(
      { userId: req.user.id },
      { $set: req.body },
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
 * Get all offers posted by the current company.
 */
const getMyOffers = async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user.id });
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found.' });
    }

    const offers = await InternshipOffer.find({ companyId: company._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: offers });
  } catch (error) {
    console.error(`Get My Offers Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error retrieving offers.' });
  }
};

/**
 * Get applicants for a specific offer posted by the company.
 */
const getCandidates = async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user.id });
    const offer = await InternshipOffer.findOne({ _id: req.params.offerId, companyId: company._id });
    
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found or unauthorized.' });
    }

    const applications = await Application.find({ offerId: offer._id }).populate('studentId');
    return res.status(200).json({ success: true, data: applications });
  } catch (error) {
    console.error(`Get Candidates Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error retrieving candidates.' });
  }
};

/**
 * Accept a candidate, updating the application status and notifying relevant users.
 */
const acceptCandidate = async (req, res) => {
  try {
    const { appId } = req.params;
    const application = await Application.findById(appId).populate('studentId').populate('offerId');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    // Update status to ACCEPTED
    application.status = 'ACCEPTED';
    await application.save();

    // Notify the student
    await sendNotification(
      application.studentId.userId, 
      `Congratulations! Your application for "${application.offerId.title}" has been accepted by the company.`, 
      'CANDIDATE_ACCEPTED'
    );

    // Notify the admins
    const admins = await Admin.find();
    for (let admin of admins) {
      await sendNotification(
        admin.userId,
        `Student ${application.studentId.firstName} has been accepted. Validation required.`,
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
 * Refuse a candidate, updating the application status and notifying the student.
 */
const refuseCandidate = async (req, res) => {
  try {
    const { appId } = req.params;
    const application = await Application.findById(appId).populate('studentId').populate('offerId');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    // Update status to REFUSED
    application.status = 'REFUSED';
    await application.save();

    // Notify the student
    await sendNotification(
      application.studentId.userId, 
      `Unfortunately, your application for "${application.offerId.title}" has been refused.`, 
      'NEW_APPLICATION' // Could use another enum, but keeping simple based on provided enums
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
  getMyOffers,
  getCandidates,
  acceptCandidate,
  refuseCandidate
};
