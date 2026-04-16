/**
 * File: routes/companyRoutes.js
 * Added: POST /api/company/logo — upload company logo image
 */

const express = require('express');
const router  = express.Router();
const {
  getProfile,
  updateProfile,
  uploadLogo,
  getMyOffers,
  getCandidates,
  acceptCandidate,
  refuseCandidate,
} = require('../controllers/companyController');
const auth   = require('../middleware/auth');
const roles  = require('../middleware/roles');
const upload = require('../middleware/upload');

// All routes require authentication and COMPANY role
router.use(auth);
router.use(roles('COMPANY'));

// GET and PUT /api/company/profile  (text fields)
router.route('/profile')
  .get(getProfile)
  .put(updateProfile);

// POST /api/company/logo  (multipart/form-data — field name: "logo")
router.post('/logo', upload.single('logo'), uploadLogo);

// GET /api/company/offers
router.get('/offers', getMyOffers);

// GET /api/company/candidates/:offerId
router.get('/candidates/:offerId', getCandidates);

// PUT /api/company/candidates/:appId/accept
router.put('/candidates/:appId/accept', acceptCandidate);

// PUT /api/company/candidates/:appId/refuse
router.put('/candidates/:appId/refuse', refuseCandidate);

module.exports = router;