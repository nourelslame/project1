/**
 * File: controllers/studentController.js
 * Purpose: Handles operations related to the student.
 * Operations include viewing and updating their profile, fetching their applications,
 * searching for offers, and downloading their own internship agreement.
 */

const Student = require('../models/Student');
const Application = require('../models/Application');
const InternshipOffer = require('../models/InternshipOffer');
const InternshipAgreement = require('../models/InternshipAgreement');
const path = require('path');
const fs   = require('fs');

/**
 * Get the current student's profile.
 * Uses the user ID from the token (req.user.id).
 */
const getProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.id }).populate('userId', '-passwordHash');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }
    return res.status(200).json({ success: true, data: student });
  } catch (error) {
    console.error(`Get Profile Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error retrieving profile.' });
  }
};

/**
 * Update the current student's profile.
 * Merges the provided fields in the request body with the existing student profile.
 */
const updateProfile = async (req, res) => {
  try {
    const updatedStudent = await Student.findOneAndUpdate(
      { userId: req.user.id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updatedStudent) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }
    return res.status(200).json({ success: true, data: updatedStudent });
  } catch (error) {
    console.error(`Update Profile Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error updating profile.' });
  }
};

/**
 * Get all applications submitted by the current student.
 * Populates the offer + company details and also attaches the agreement _id if it exists.
 */
const getApplications = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    // Fetch applications with offer and company info
    const applications = await Application.find({ studentId: student._id })
      .populate({ path: 'offerId', populate: { path: 'companyId' } })
      .sort({ createdAt: -1 });

    // For each VALIDATED application, also attach the agreement id so the student can download
    const appsWithAgreements = await Promise.all(
      applications.map(async (app) => {
        const plain = app.toObject();
        if (app.status === 'VALIDATED') {
          const agreement = await InternshipAgreement.findOne({ applicationId: app._id });
          if (agreement) {
            plain.agreementId = agreement._id;
            plain.hasPdf      = !!agreement.pdfPath;
          }
        }
        return plain;
      })
    );

    return res.status(200).json({ success: true, data: appsWithAgreements });
  } catch (error) {
    console.error(`Get Applications Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error retrieving applications.' });
  }
};

/**
 * Get all agreements belonging to the current student.
 * Returns agreement metadata + whether the PDF file exists.
 * Route: GET /api/student/agreements
 */
const getMyAgreements = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const agreements = await InternshipAgreement.find({ studentId: student._id })
      .populate('companyId')
      .populate({ path: 'applicationId', populate: { path: 'offerId' } })
      .sort({ createdAt: -1 });

    // Add a hasPdf flag so the frontend knows whether to show the download button
    const result = agreements.map(agr => ({
      ...agr.toObject(),
      hasPdf: !!(agr.pdfPath && fs.existsSync(path.join(__dirname, '..', agr.pdfPath))),
    }));

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error(`Get My Agreements Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error retrieving agreements.' });
  }
};

/**
 * Download the student's own internship agreement PDF.
 * The student can only download their OWN agreement.
 * Route: GET /api/student/agreements/:agreementId/download
 */
const downloadMyAgreement = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    // Security: make sure this agreement belongs to the requesting student
    const agreement = await InternshipAgreement.findOne({
      _id:       req.params.agreementId,
      studentId: student._id,          // ← only their own agreement
    });

    if (!agreement) {
      return res.status(404).json({ success: false, message: 'Agreement not found or access denied.' });
    }

    if (!agreement.pdfPath) {
      return res.status(404).json({ success: false, message: 'PDF has not been generated yet.' });
    }

    const absolutePath = path.join(__dirname, '..', agreement.pdfPath);

    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ success: false, message: 'PDF file no longer exists on the server.' });
    }

    // Send the file as a download
    return res.download(absolutePath, `convention-de-stage-${student.firstName}-${student.lastName}.pdf`);
  } catch (error) {
    console.error(`Download Agreement Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error downloading agreement.' });
  }
};

/**
 * Search for internship offers based on query parameters.
 */
const searchOffers = async (req, res) => {
  try {
    const { keyword, wilaya, skills, type } = req.query;

    let query = { status: 'OPEN' };

    if (keyword) {
      query.$or = [
        { title:       { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
      ];
    }
    if (wilaya) query.wilaya = wilaya;
    if (type)   query.type   = type;
    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim());
      query.requiredSkills = { $in: skillsArray };
    }

    const offers = await InternshipOffer.find(query).populate('companyId').sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: offers });
  } catch (error) {
    console.error(`Search Offers Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error searching internship offers.' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getApplications,
  getMyAgreements,
  downloadMyAgreement,
  searchOffers,
};