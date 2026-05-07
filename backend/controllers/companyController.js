/**
 * File: controllers/companyController.js
 * Changes:
 *  - getCandidates: returns slot stats (total, accepted, remaining) with applications
 *  - acceptCandidate: blocks acceptance when no slots remain + auto-closes offer
 */

const Company         = require('../models/Company');
const InternshipOffer = require('../models/InternshipOffer');
const Application     = require('../models/Application');
const Admin           = require('../models/Admin');
const sendNotification = require('../utils/sendNotification');
const path            = require('path');
const fs              = require('fs');

/** Get company profile */
const getProfile = async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user.id }).populate('userId', '-passwordHash');
    if (!company) return res.status(404).json({ success: false, message: 'Company profile not found.' });
    return res.status(200).json({ success: true, data: company });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/** Update company profile (text fields only) */
const updateProfile = async (req, res) => {
  try {
    const { logo, ...safeFields } = req.body;
    const updated = await Company.findOneAndUpdate(
      { userId: req.user.id },
      { $set: safeFields },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: 'Company not found.' });
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/** Upload company logo */
const uploadLogo = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });
    const logoUrl = `/uploads/logos/${req.file.filename}`;
    const company = await Company.findOne({ userId: req.user.id });
    if (!company) return res.status(404).json({ success: false, message: 'Company not found.' });
    if (company.logo) {
      const oldPath = path.join(__dirname, '..', company.logo);
      if (fs.existsSync(oldPath)) { try { fs.unlinkSync(oldPath); } catch { } }
    }
    company.logo = logoUrl;
    await company.save();
    return res.status(200).json({ success: true, data: { logo: logoUrl } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error uploading logo.' });
  }
};

/** Get all offers by this company */
const getMyOffers = async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user.id });
    if (!company) return res.status(404).json({ success: false, message: 'Company not found.' });
    const offers = await InternshipOffer.find({ companyId: company._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: offers });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * Get all applicants for a specific offer.
 * Now also returns slot statistics so the frontend can show:
 *   "Slots: 3 total — 2 accepted — 1 remaining"
 */
const getCandidates = async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user.id });
    const offer   = await InternshipOffer.findOne({
      _id:       req.params.offerId,
      companyId: company._id,
    });
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found or unauthorized.' });
    }

    // All applications for this offer (with student profile)
    const applications = await Application.find({ offerId: offer._id })
      .populate('studentId')
      .sort({ createdAt: -1 });

    // ── Count accepted slots ──────────────────────────────────────────────
    const acceptedCount   = applications.filter(a =>
      a.status === 'ACCEPTED' || a.status === 'VALIDATED'
    ).length;
    const remainingSlots  = Math.max(0, offer.slots - acceptedCount);
    const isFull          = remainingSlots === 0;

    return res.status(200).json({
      success: true,
      data:    applications,
      // ← NEW: slot info for the frontend
      slots: {
        total:     offer.slots,      // كم مقعد في المجموع
        accepted:  acceptedCount,    // كم شخص تم قبوله
        remaining: remainingSlots,   // كم مقعد بقى
        isFull,                      // true إذا امتلأت المناصب
      },
    });
  } catch (error) {
    console.error(`Get Candidates Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error retrieving candidates.' });
  }
};

/**
 * Accept a candidate.
 * Guards:
 *  1. Checks remaining slots BEFORE accepting — returns 400 if full
 *  2. Auto-closes the offer when last slot is filled
 */
const acceptCandidate = async (req, res) => {
  try {
    const { appId } = req.params;

    const application = await Application.findById(appId)
      .populate('studentId')
      .populate('offerId');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    const offer = application.offerId;   // InternshipOffer document

    // ── Guard 1: already accepted? ───────────────────────────────────────
    if (application.status === 'ACCEPTED' || application.status === 'VALIDATED') {
      return res.status(400).json({
        success: false,
        message: 'This candidate is already accepted.',
      });
    }

    // ── Guard 2: check remaining slots ───────────────────────────────────
    const acceptedCount = await Application.countDocuments({
      offerId: offer._id,
      status:  { $in: ['ACCEPTED', 'VALIDATED'] },
    });

    const remainingSlots = offer.slots - acceptedCount;

    if (remainingSlots <= 0) {
      return res.status(400).json({
        success: false,
        message: `No slots remaining. This offer has ${offer.slots} slot(s) and all are filled.`,
        slots: {
          total:     offer.slots,
          accepted:  acceptedCount,
          remaining: 0,
          isFull:    true,
        },
      });
    }

    // ── Accept the application ────────────────────────────────────────────
    application.status = 'ACCEPTED';
    await application.save();

    const newAcceptedCount  = acceptedCount + 1;
    const newRemainingSlots = offer.slots - newAcceptedCount;

    // ── Auto-close offer if last slot just filled ─────────────────────────
    if (newRemainingSlots === 0) {
      await InternshipOffer.findByIdAndUpdate(offer._id, { status: 'CLOSED' });
    }

    // ── Notify student ────────────────────────────────────────────────────
    await sendNotification(
      application.studentId.userId,
      `Congratulations! Your application for "${offer.title}" has been accepted by the company.`,
      'CANDIDATE_ACCEPTED'
    );

    // ── Notify admins ─────────────────────────────────────────────────────
    const admins = await Admin.find();
    for (const admin of admins) {
      await sendNotification(
        admin.userId,
        `${application.studentId.firstName} ${application.studentId.lastName} was accepted for "${offer.title}". Validation required.`,
        'VALIDATION_REQUIRED'
      );
    }

    return res.status(200).json({
      success: true,
      data:    application,
      // Return updated slot info so the frontend can refresh immediately
      slots: {
        total:     offer.slots,
        accepted:  newAcceptedCount,
        remaining: newRemainingSlots,
        isFull:    newRemainingSlots === 0,
      },
    });
  } catch (error) {
    console.error(`Accept Candidate Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error accepting candidate.' });
  }
};

/** Refuse a candidate */
const refuseCandidate = async (req, res) => {
  try {
    const application = await Application.findById(req.params.appId)
      .populate('studentId')
      .populate('offerId');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }
    application.status = 'REFUSED';
    await application.save();
    await sendNotification(
      application.studentId.userId,
      `Unfortunately, your application for "${application.offerId.title}" has been refused.`,
      'CANDIDATE_ACCEPTED'
    );
    return res.status(200).json({ success: true, data: application });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error.' });
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