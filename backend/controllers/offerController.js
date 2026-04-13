/**
 * File: controllers/offerController.js
 * Purpose: Handles CRUD operations for internship offers.
 */

const InternshipOffer = require('../models/InternshipOffer');
const Company = require('../models/Company');

/**
 * Get all open internship offers (with some basic filtering).
 */
const getAllOffers = async (req, res) => {
  try {
    const { wilaya, type } = req.query;
    let query = { status: 'OPEN' };

    if (wilaya) query.wilaya = wilaya;
    if (type) query.type = type;

    const offers = await InternshipOffer.find(query).populate('companyId').sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: offers });
  } catch (error) {
    console.error(`Get All Offers Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error retrieving offers.' });
  }
};

/**
 * Get details of a specific internship offer.
 */
const getOfferDetails = async (req, res) => {
  try {
    const offer = await InternshipOffer.findById(req.params.id).populate('companyId');
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found.' });
    }
    return res.status(200).json({ success: true, data: offer });
  } catch (error) {
    console.error(`Get Offer Details Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error retrieving offer details.' });
  }
};

/**
 * Create a new internship offer (Company only).
 */
const createOffer = async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user.id });
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found.' });
    }

    const newOffer = new InternshipOffer({
      companyId: company._id,
      ...req.body
    });

    const savedOffer = await newOffer.save();
    return res.status(201).json({ success: true, data: savedOffer });
  } catch (error) {
    console.error(`Create Offer Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error creating offer.' });
  }
};

/**
 * Update an existing internship offer (Company only).
 */
const updateOffer = async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user.id });
    
    // Ensure the offer belongs to the requesting company
    const offer = await InternshipOffer.findOneAndUpdate(
      { _id: req.params.id, companyId: company._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found or unauthorized.' });
    }

    return res.status(200).json({ success: true, data: offer });
  } catch (error) {
    console.error(`Update Offer Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error updating offer.' });
  }
};

/**
 * Delete an internship offer (Company only).
 */
const deleteOffer = async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user.id });
    
    // Ensure the offer belongs to the requesting company
    const offer = await InternshipOffer.findOneAndDelete({ _id: req.params.id, companyId: company._id });

    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found or unauthorized.' });
    }

    return res.status(200).json({ success: true, message: 'Offer deleted successfully.' });
  } catch (error) {
    console.error(`Delete Offer Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error deleting offer.' });
  }
};

module.exports = {
  getAllOffers,
  getOfferDetails,
  createOffer,
  updateOffer,
  deleteOffer
};
