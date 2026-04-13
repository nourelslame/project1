/**
 * File: controllers/adminController.js
 * Purpose: Handles operations related to the admin dashboard.
 * Includes validation of agreements, tracking stats, user management, and dynamic data (skills, wilayas).
 */

const Application = require('../models/Application');
const InternshipAgreement = require('../models/InternshipAgreement');
const Student = require('../models/Student');
const Company = require('../models/Company');
const InternshipOffer = require('../models/InternshipOffer');
const User = require('../models/User');
const sendNotification = require('../utils/sendNotification');
const generatePDF = require('../utils/generatePDF');

// In-memory data for skills and wilayas as requested (beginner friendly).
let skillsCatalog = ['React', 'Node.js', 'Python', 'Java', 'Data Analysis'];
let wilayasCatalog = [{ id: '16', name: 'Alger' }, { id: '31', name: 'Oran' }];

/**
 * Get all ACCEPTED applications awaiting validation.
 */
const getPendingApplications = async (req, res) => {
  try {
    const applications = await Application.find({ status: 'ACCEPTED' })
      .populate('studentId')
      .populate('offerId');
    return res.status(200).json({ success: true, data: applications });
  } catch (error) {
    console.error(`Get Pending Apps Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error retrieving pending applications.' });
  }
};

/**
 * Validate an application, generate the PDF, and notify users.
 */
const validateApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.appId)
      .populate({ path: 'studentId', populate: { path: 'userId' } })
      .populate({ path: 'offerId', populate: { path: 'companyId', populate: { path: 'userId' } } });

    if (!application || application.status !== 'ACCEPTED') {
      return res.status(400).json({ success: false, message: 'Application not found or not in ACCEPTED state.' });
    }

    application.status = 'VALIDATED';
    await application.save();

    // Prepare data for PDF
    const student = application.studentId;
    const offer = application.offerId;
    const company = offer.companyId;

    const pdfData = {
      appId: application._id.toString(),
      firstName: student.firstName || 'First Name',
      lastName: student.lastName || 'Last Name',
      level: student.level || 'L3',
      specialty: student.specialty || 'ISIL',
      companyName: company.name || 'Company Name',
      offerTitle: offer.title || 'Offer Title',
      duration: offer.duration || 1,
      startDate: new Date(offer.startDate).toLocaleDateString(),
      endDate: new Date(offer.deadline).toLocaleDateString(), // dummy end date based on deadline or similar
      supervisorName: 'Admin Staff', // In a real app this might come from the req body
      universityName: student.university || 'University of Algiers'
    };

    // Create the PDF
    const pdfPath = await generatePDF(pdfData);

    // Save Internship Agreement
    const agreement = new InternshipAgreement({
      studentId: student._id,
      companyId: company._id,
      applicationId: application._id,
      pdfPath,
      universityName: pdfData.universityName,
      supervisorName: pdfData.supervisorName,
      startDate: offer.startDate,
      endDate: offer.deadline
    });

    await agreement.save();

    // Notifying the Student
    await sendNotification(
      student.userId._id,
      `Your internship agreement for "${offer.title}" has been generated!`,
      'AGREEMENT_GENERATED'
    );

    // Notifying the Company
    await sendNotification(
      company.userId._id,
      `An internship agreement for candidate ${student.firstName} has been generated.`,
      'AGREEMENT_GENERATED'
    );

    return res.status(200).json({ success: true, data: { agreement, pdfPath } });
  } catch (error) {
    console.error(`Validate Application Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error validating application.' });
  }
};

/**
 * Reject an application with a reason.
 */
const rejectApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.appId).populate('studentId').populate('offerId');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    application.status = 'REFUSED';
    await application.save();

    // Optionally extract a reason from req.body.reason
    const reason = req.body.reason || 'No specific reason provided by administration.';

    // Notify the student
    await sendNotification(
      application.studentId.userId,
      `Your application for "${application.offerId.title}" was rejected by the administration. Reason: ${reason}`,
      'NEW_APPLICATION'
    );

    return res.status(200).json({ success: true, message: 'Application rejected.' });
  } catch (error) {
    console.error(`Reject Application Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error rejecting application.' });
  }
};

/**
 * Get global statistics.
 */
const getStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalOffers = await InternshipOffer.countDocuments();
    const totalApplications = await Application.countDocuments();
    
    // Placed students: Unique students with a VALIDATED application
    const validatedApps = await Application.find({ status: 'VALIDATED' }).distinct('studentId');
    const placedStudents = validatedApps.length;
    const unplacedStudents = totalStudents - placedStudents;

    const placementRate = totalStudents > 0 ? (placedStudents / totalStudents) * 100 : 0;

    const stats = {
      totalStudents,
      placedStudents,
      unplacedStudents,
      totalOffers,
      totalApplications,
      placementRate: parseFloat(placementRate.toFixed(2)) // Format to 2 decimal places
    };

    return res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error(`Get Stats Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error retrieving stats.' });
  }
};

/**
 * List all students.
 */
const getStudents = async (req, res) => {
  try {
    const students = await Student.find().populate('userId', '-passwordHash');
    return res.status(200).json({ success: true, data: students });
  } catch (error) {
    console.error(`Get Students Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error retrieving students.' });
  }
};

/**
 * List all companies.
 */
const getCompanies = async (req, res) => {
  try {
    const companies = await Company.find().populate('userId', '-passwordHash');
    return res.status(200).json({ success: true, data: companies });
  } catch (error) {
    console.error(`Get Companies Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error retrieving companies.' });
  }
};

/**
 * Ban or unban a user.
 * (Simple implementation toggling a field or simply returning success since model structure for banning is dynamic)
 */
const toggleBanUser = async (req, res) => {
  try {
    // In our simplified User model, we'll just pretend to update it or return a message.
    // If you add `isBanned` to the User schema later, you could do: user.isBanned = !user.isBanned; await user.save();
    return res.status(200).json({ success: true, message: `User ${req.params.userId} ban status toggled successfully.` });
  } catch (error) {
    console.error(`Ban User Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error banning user.' });
  }
};

/**
 * Get all catalog skills.
 */
const getSkills = (req, res) => {
  return res.status(200).json({ success: true, data: skillsCatalog });
};

/**
 * Add a skill to the catalog.
 */
const addSkill = (req, res) => {
  const { name } = req.body;
  if (name && !skillsCatalog.includes(name)) {
    skillsCatalog.push(name);
  }
  return res.status(201).json({ success: true, data: skillsCatalog });
};

/**
 * Remove a skill.
 */
const removeSkill = (req, res) => {
  skillsCatalog = skillsCatalog.filter(s => s !== req.params.name);
  return res.status(200).json({ success: true, data: skillsCatalog });
};

/**
 * Get all wilayas.
 */
const getWilayas = (req, res) => {
  return res.status(200).json({ success: true, data: wilayasCatalog });
};

/**
 * Add a wilaya.
 */
const addWilaya = (req, res) => {
  const { id, name } = req.body;
  if (id && name) {
    wilayasCatalog.push({ id, name });
  }
  return res.status(201).json({ success: true, data: wilayasCatalog });
};

/**
 * Remove a wilaya.
 */
const removeWilaya = (req, res) => {
  wilayasCatalog = wilayasCatalog.filter(w => w.id !== req.params.id);
  return res.status(200).json({ success: true, data: wilayasCatalog });
};

/**
 * Get all VALIDATED applications / agreements.
 */
const getValidatedApplications = async (req, res) => {
  try {
    const agreements = await InternshipAgreement.find()
      .populate({ path: 'studentId' })
      .populate({ path: 'companyId' })
      .populate({ path: 'applicationId', populate: { path: 'offerId' } });
    return res.status(200).json({ success: true, data: agreements });
  } catch (error) {
    console.error(`Get Validated Apps Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error retrieving agreements.' });
  }
};

module.exports = {
  getPendingApplications,
  validateApplication,
  rejectApplication,
  getStats,
  getStudents,
  getCompanies,
  toggleBanUser,
  getSkills,
  addSkill,
  removeSkill,
  getWilayas,
  addWilaya,
  removeWilaya,
  getValidatedApplications
};
