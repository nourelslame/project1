/**
 * File: controllers/applicationController.js
 * Purpose: Handles operations related to applications made by students.
 */

const Application = require('../models/Application');
const InternshipOffer = require('../models/InternshipOffer');
const Student = require('../models/Student');
const Admin = require('../models/Admin');
const sendNotification = require('../utils/sendNotification');

/**
 * Apply to an internship offer (Student only).
 */
const applyToOffer = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    const offerId = req.params.offerId;
    const offer = await InternshipOffer.findById(offerId).populate('companyId');
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found.' });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({ studentId: student._id, offerId: offer._id });
    if (existingApplication) {
      return res.status(400).json({ success: false, message: 'You have already applied to this offer.' });
    }

    // Create the application
    const newApplication = new Application({
      studentId: student._id,
      offerId: offer._id,
      status: 'PENDING'
    });

    const savedApplication = await newApplication.save();

    // Increment applicants count
    offer.applicants += 1;
    await offer.save();

    // Notify the company
    await sendNotification(
      offer.companyId.userId,
      `A new student (${student.firstName} ${student.lastName}) has applied to your offer "${offer.title}".`,
      'NEW_APPLICATION'
    );

    // Notify admins (optional per instructions, to keep them aware)
    const admins = await Admin.find();
    for (let admin of admins) {
      // It says type VALIDATION_REQUIRED but that's usually after accepted. We'll use NEW_APPLICATION or VALIDATION_REQUIRED as per prompt. The prompt says "type: VALIDATION_REQUIRED (optional)".
      await sendNotification(admin.userId, `New application submitted for "${offer.title}".`, 'VALIDATION_REQUIRED');
    }

    return res.status(201).json({ success: true, data: savedApplication });
  } catch (error) {
    console.error(`Apply To Offer Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error while applying.' });
  }
};

/**
 * Cancel a pending application (Student only).
 */
const cancelApplication = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    const application = await Application.findOne({ _id: req.params.id, studentId: student._id });
    
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    // Only allow cancelling if still PENDING
    if (application.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: 'Can only cancel pending applications.' });
    }

    await Application.findByIdAndDelete(req.params.id);

    // Decrement applicants count on the offer
    const offer = await InternshipOffer.findById(application.offerId);
    if (offer && offer.applicants > 0) {
      offer.applicants -= 1;
      await offer.save();
    }

    return res.status(200).json({ success: true, message: 'Application cancelled successfully.' });
  } catch (error) {
    console.error(`Cancel Application Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error while cancelling application.' });
  }
};

module.exports = {
  applyToOffer,
  cancelApplication
};
