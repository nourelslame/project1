/**
 * File: routes/documentRoutes.js
 * Purpose: Routing for generating and retrieving documents/PDFs.
 */

const express = require('express');
const router = express.Router();
const { previewAgreement, downloadAgreement } = require('../controllers/documentController');
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');

// All routes require authentication and ADMIN role
router.use(auth);
router.use(roles('ADMIN'));

// GET /api/documents/agreement/:appId
router.get('/agreement/:appId', previewAgreement);

// GET /api/documents/download/:appId
router.get('/download/:appId', downloadAgreement);

module.exports = router;
