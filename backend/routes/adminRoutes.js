/**
 * File: routes/adminRoutes.js
 * Purpose: Admin routes — skills and wilayas now use MongoDB _id for deletion.
 */

const express = require('express');
const router  = express.Router();
const {
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
} = require('../controllers/adminController');
const auth  = require('../middleware/auth');
const roles = require('../middleware/roles');

router.use(auth);
router.use(roles('ADMIN'));

// Views
router.get('/pending',   getPendingApplications);
router.get('/validated', getValidatedApplications);
router.get('/stats',     getStats);
router.get('/users/students',  getStudents);
router.get('/users/companies', getCompanies);

// Validation workflows
router.put('/validate/:appId', validateApplication);
router.put('/reject/:appId',   rejectApplication);

// User management
router.put('/users/:userId/ban', toggleBanUser);

// Skills — delete by MongoDB _id (not by name)
router.get('/skills',       getSkills);
router.post('/skills',      addSkill);
router.delete('/skills/:id', removeSkill);   // :id = MongoDB _id

// Wilayas — delete by MongoDB _id
router.get('/wilayas',        getWilayas);
router.post('/wilayas',       addWilaya);
router.delete('/wilayas/:id', removeWilaya); // :id = MongoDB _id

module.exports = router;