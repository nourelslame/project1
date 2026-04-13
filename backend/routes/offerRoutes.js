/**
 * File: routes/offerRoutes.js
 * Purpose: Routing for internship offers.
 * Public routes: viewing offers. Protected routes: creating, updating, deleting (COMPANY only).
 */

const express = require('express');
const router = express.Router();
const { 
  getAllOffers, 
  getOfferDetails, 
  createOffer, 
  updateOffer, 
  deleteOffer 
} = require('../controllers/offerController');
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');

// Public routes for viewing offers
router.get('/', getAllOffers);
router.get('/:id', getOfferDetails);

// Protected routes (COMPANY only)
router.use(auth);
router.use(roles('COMPANY'));

router.post('/', createOffer);
router.put('/:id', updateOffer);
router.delete('/:id', deleteOffer);

module.exports = router;
