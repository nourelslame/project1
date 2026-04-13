/**
 * File: routes/companyRoutes.js
 * Purpose: Routing for company-specific operations.
 */

const express = require('express');
const router = express.Router();
const { 
  getProfile, 
  updateProfile, 
  getMyOffers, 
  getCandidates, 
  acceptCandidate, 
  refuseCandidate 
} = require('../controllers/companyController');
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');

// All routes below require authentication and COMPANY role
router.use(auth);
router.use(roles('COMPANY'));

// GET and PUT /api/company/profile
router.route('/profile')
  .get(getProfile)
  .put(updateProfile);

// GET /api/company/offers
router.get('/offers', getMyOffers);

// GET /api/company/candidates/:offerId
router.get('/candidates/:offerId', getCandidates);

// PUT /api/company/candidates/:appId/accept
router.put('/candidates/:appId/accept', acceptCandidate);

// PUT /api/company/candidates/:appId/refuse
router.put('/candidates/:appId/refuse', refuseCandidate);

module.exports = router;
