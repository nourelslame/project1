/**
 * File: routes/applicationRoutes.js
 * Purpose: Routing for applications.
 * Protected routes for students to apply and cancel their applications.
 */

const express = require('express');
const router = express.Router();
const { applyToOffer, cancelApplication } = require('../controllers/applicationController');
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');

// All routes require authentication and STUDENT role
router.use(auth);
router.use(roles('STUDENT'));

// POST /api/applications/:offerId
router.post('/:offerId', applyToOffer);

// DELETE /api/applications/:id
router.delete('/:id', cancelApplication);

module.exports = router;
