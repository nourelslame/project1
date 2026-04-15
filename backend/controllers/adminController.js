/**
 * File: controllers/adminController.js
 * Purpose: Handles admin dashboard operations.
 * Skills and wilayas are now stored in MongoDB (not in-memory).
 */

const Application         = require('../models/Application');
const InternshipAgreement = require('../models/InternshipAgreement');
const Student             = require('../models/Student');
const Company             = require('../models/Company');
const InternshipOffer     = require('../models/InternshipOffer');
const User                = require('../models/User');
const Skill               = require('../models/Skill');
const Wilaya              = require('../models/Wilaya');
const sendNotification    = require('../utils/sendNotification');
const generatePDF         = require('../utils/generatePDF');

/* ─────────────────────────────────────────────────────────────────────────────
   PENDING / VALIDATE / REJECT
───────────────────────────────────────────────────────────────────────────── */

/** Get all ACCEPTED applications awaiting admin validation. */
const getPendingApplications = async (req, res) => {
  try {
    const applications = await Application.find({ status: 'ACCEPTED' })
      .populate('studentId')
      .populate({ path: 'offerId', populate: { path: 'companyId' } });
    return res.status(200).json({ success: true, data: applications });
  } catch (error) {
    console.error(`Get Pending Apps Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error retrieving pending applications.' });
  }
};

/** Validate an application → generate PDF → notify student & company. */
/**
 * File: controllers/adminController.js  (partial — validateApplication only)
 * Replace the validateApplication function with this version.
 * It passes all required fields to generatePDF to match the official format.
 */

const validateApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.appId)
      .populate({ path: 'studentId', populate: { path: 'userId' } })
      .populate({ path: 'offerId',   populate: { path: 'companyId', populate: { path: 'userId' } } });

    if (!application || application.status !== 'ACCEPTED') {
      return res.status(400).json({
        success: false,
        message: 'Application not found or not in ACCEPTED state.',
      });
    }

    application.status = 'VALIDATED';
    await application.save();

    const student = application.studentId;
    const offer   = application.offerId;
    const company = offer.companyId;

    // ── Build PDF data — maps every field to the official Convention de Stage layout ──
    const pdfData = {
      appId: application._id.toString(),

      // Student fields
      firstName:       student.firstName   || '',
      lastName:        student.lastName    || '',
      faculty:         student.university  || 'Université Sétif 1',   // maps to Faculté
      department:      student.department  || student.specialty || '',
      studentId:       '',                                            // carte étudiant — not stored
      socialSecurity:  '',                                            // not stored
      phone:           student.phone       || '',
      level:           student.level       || '',
      specialty:       student.specialty   || '',

      // University fields
      university:        student.university  || 'Université Sétif 1 — Ferhat Abbas',
      universityPhone:   '+213 36 62 45 79',
      universityAddress: 'Cité Maâbouda, Sétif, Algérie',

      // Company fields
      companyName:            company.name     || '',
      companyAddress:         company.wilaya   || '',
      companyRepresentative:  req.body.companyRepresentative || company.name || '',
      companyPhone:           company.phone    || '',
      companyFax:             '',

      // Internship fields
      offerTitle:      offer.title        || '',
      supervisorName:  req.body.supervisorName || 'Responsable Pédagogique',
      duration:        offer.duration     || '',
      startDate:       offer.startDate
                         ? new Date(offer.startDate).toLocaleDateString('fr-FR')
                         : '',
      endDate:         offer.deadline
                         ? new Date(offer.deadline).toLocaleDateString('fr-FR')
                         : '',
      city:            company.wilaya || 'Sétif',
    };

    const pdfPath = await generatePDF(pdfData);

    const agreement = new InternshipAgreement({
      studentId:      student._id,
      companyId:      company._id,
      applicationId:  application._id,
      pdfPath,
      universityName: pdfData.university,
      supervisorName: pdfData.supervisorName,
      startDate:      offer.startDate,
      endDate:        offer.deadline,
    });
    await agreement.save();

    // Notify student
    await sendNotification(
      student.userId._id,
      `Votre convention de stage pour "${offer.title}" a été validée et est prête à télécharger !`,
      'AGREEMENT_GENERATED'
    );
    // Notify company
    await sendNotification(
      company.userId._id,
      `La convention de stage de ${student.firstName} ${student.lastName} pour "${offer.title}" a été générée.`,
      'AGREEMENT_GENERATED'
    );

    return res.status(200).json({ success: true, data: { agreement, pdfPath } });
  } catch (error) {
    console.error(`Validate Application Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error validating application.',
    });
  }
};

/** Reject an application with a reason. */
const rejectApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.appId)
      .populate({ path: 'studentId', populate: { path: 'userId' } })
      .populate('offerId');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    application.status = 'REFUSED';
    await application.save();

    const reason = req.body.reason || 'No specific reason provided.';
    await sendNotification(
      application.studentId.userId._id,
      `Your application for "${application.offerId.title}" was rejected. Reason: ${reason}`,
      'CANDIDATE_ACCEPTED'
    );

    return res.status(200).json({ success: true, message: 'Application rejected.' });
  } catch (error) {
    console.error(`Reject Application Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error rejecting application.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   STATS
───────────────────────────────────────────────────────────────────────────── */

/** Get platform statistics. */
const getStats = async (req, res) => {
  try {
    const totalStudents      = await Student.countDocuments();
    const totalOffers        = await InternshipOffer.countDocuments();
    const totalApplications  = await Application.countDocuments();
    const placedStudentIds   = await Application.find({ status: 'VALIDATED' }).distinct('studentId');
    const placedStudents     = placedStudentIds.length;
    const unplacedStudents   = totalStudents - placedStudents;
    const placementRate      = totalStudents > 0 ? parseFloat(((placedStudents / totalStudents) * 100).toFixed(2)) : 0;

    return res.status(200).json({
      success: true,
      data: { totalStudents, placedStudents, unplacedStudents, totalOffers, totalApplications, placementRate },
    });
  } catch (error) {
    console.error(`Get Stats Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error retrieving stats.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   USER MANAGEMENT
───────────────────────────────────────────────────────────────────────────── */

const getStudents    = async (req, res) => {
  try {
    const students = await Student.find().populate('userId', '-passwordHash');
    return res.status(200).json({ success: true, data: students });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error retrieving students.' });
  }
};

const getCompanies   = async (req, res) => {
  try {
    const companies = await Company.find().populate('userId', '-passwordHash');
    return res.status(200).json({ success: true, data: companies });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error retrieving companies.' });
  }
};

const toggleBanUser  = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    // Toggle isBanned field (add to User schema if needed)
    user.isBanned = !user.isBanned;
    await user.save();
    return res.status(200).json({ success: true, message: `User ${user.isBanned ? 'banned' : 'unbanned'}.`, isBanned: user.isBanned });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error banning user.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   VALIDATED AGREEMENTS
───────────────────────────────────────────────────────────────────────────── */

const getValidatedApplications = async (req, res) => {
  try {
    const agreements = await InternshipAgreement.find()
      .populate('studentId')
      .populate('companyId')
      .populate({ path: 'applicationId', populate: { path: 'offerId' } })
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: agreements });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error retrieving agreements.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   SKILLS CRUD  — now persisted in MongoDB
───────────────────────────────────────────────────────────────────────────── */

/** Get all skills from the database. */
const getSkills = async (req, res) => {
  try {
    const skills = await Skill.find().sort({ category: 1, name: 1 });
    return res.status(200).json({ success: true, data: skills });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error retrieving skills.' });
  }
};

/** Add a new skill. */
const addSkill = async (req, res) => {
  try {
    const { name, category } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Skill name is required.' });
    }

    // Check for duplicate (case-insensitive)
    const exists = await Skill.findOne({ name: { $regex: `^${name.trim()}$`, $options: 'i' } });
    if (exists) {
      return res.status(400).json({ success: false, message: 'This skill already exists.' });
    }

    const skill = await Skill.create({
      name:     name.trim(),
      category: category || 'Other',
    });

    // Return the full updated list
    const all = await Skill.find().sort({ category: 1, name: 1 });
    return res.status(201).json({ success: true, data: all });
  } catch (error) {
    console.error(`Add Skill Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error adding skill.' });
  }
};

/** Delete a skill by its MongoDB _id. */
const removeSkill = async (req, res) => {
  try {
    await Skill.findByIdAndDelete(req.params.id);
    const all = await Skill.find().sort({ category: 1, name: 1 });
    return res.status(200).json({ success: true, data: all });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error removing skill.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   WILAYAS CRUD  — now persisted in MongoDB
───────────────────────────────────────────────────────────────────────────── */

/** Get all wilayas from the database. */
const getWilayas = async (req, res) => {
  try {
    const wilayas = await Wilaya.find().sort({ code: 1 });
    return res.status(200).json({ success: true, data: wilayas });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error retrieving wilayas.' });
  }
};

/** Add a new wilaya. */
const addWilaya = async (req, res) => {
  try {
    const { code, name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Wilaya name is required.' });
    }

    const exists = await Wilaya.findOne({
      $or: [
        { name: { $regex: `^${name.trim()}$`, $options: 'i' } },
        ...(code ? [{ code: code.trim() }] : []),
      ],
    });
    if (exists) {
      return res.status(400).json({ success: false, message: 'This wilaya already exists.' });
    }

    await Wilaya.create({ code: code?.trim() || '', name: name.trim() });

    const all = await Wilaya.find().sort({ code: 1 });
    return res.status(201).json({ success: true, data: all });
  } catch (error) {
    console.error(`Add Wilaya Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error adding wilaya.' });
  }
};

/** Delete a wilaya by its MongoDB _id. */
const removeWilaya = async (req, res) => {
  try {
    await Wilaya.findByIdAndDelete(req.params.id);
    const all = await Wilaya.find().sort({ code: 1 });
    return res.status(200).json({ success: true, data: all });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error removing wilaya.' });
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
  getValidatedApplications,
  getSkills,
  addSkill,
  removeSkill,
  getWilayas,
  addWilaya,
  removeWilaya,
};