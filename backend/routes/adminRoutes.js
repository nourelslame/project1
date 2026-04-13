/**
 * File: routes/adminRoutes.js
 * Purpose: Routing for admin operations.
 * Protected routes requiring the ADMIN role.
 */

const express = require('express');
const router = express.Router();
const { 
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
} = require('../controllers/adminController');
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');

// All routes require authentication and ADMIN role
router.use(auth);
router.use(roles('ADMIN'));

// Administrative views
router.get('/pending', getPendingApplications);
router.get('/validated', getValidatedApplications);
router.get('/stats', getStats);
router.get('/users/students', getStudents);
router.get('/users/companies', getCompanies);

// Application validation workflows
router.put('/validate/:appId', validateApplication);
router.put('/reject/:appId', rejectApplication);

// User management (dummy ban toggle)
router.put('/users/:userId/ban', toggleBanUser);

// Platform configuration: Skills
router.get('/skills', getSkills);
router.post('/skills', addSkill);
router.delete('/skills/:name', removeSkill);

// Platform configuration: Wilayas
router.get('/wilayas', getWilayas);
router.post('/wilayas', addWilaya);
router.delete('/wilayas/:id', removeWilaya);

module.exports = router;
