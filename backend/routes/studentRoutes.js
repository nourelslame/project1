/**
 * File: routes/studentRoutes.js
 * Purpose: Routing for student-specific operations.
 * Added: agreement listing and secure PDF download for the student themselves.
 */

const express = require('express');
const router  = express.Router();
const {
  getProfile,
  updateProfile,
  getApplications,
  getMyAgreements,
  downloadMyAgreement,
  searchOffers,
} = require('../controllers/studentController');
const auth  = require('../middleware/auth');
const roles = require('../middleware/roles');

// All routes require authentication and STUDENT role
router.use(auth);
router.use(roles('STUDENT'));

// GET and PUT /api/student/profile
router.route('/profile')
  .get(getProfile)
  .put(updateProfile);

// GET /api/student/applications  — with agreement info attached for VALIDATED ones
router.get('/applications', getApplications);

// GET /api/student/offers  — search internship offers
router.get('/offers', searchOffers);

// GET /api/student/agreements  — list all of the student's validated agreements
router.get('/agreements', getMyAgreements);

// GET /api/student/agreements/:agreementId/download  — download own PDF
router.get('/agreements/:agreementId/download', downloadMyAgreement);

module.exports = router;