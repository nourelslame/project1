/**
 * File: routes/catalogRoutes.js
 * Purpose: PUBLIC routes — anyone (student, company, or unauthenticated) can
 *          read the list of available skills and wilayas.
 *          Used by: search filters, offer creation form, student CV skills picker.
 */

const express = require('express');
const router  = express.Router();
const Skill   = require('../models/Skill');
const Wilaya  = require('../models/Wilaya');

/**
 * GET /api/catalog/skills
 * Returns all skills sorted by category then name.
 * Response: { success: true, data: [ { _id, name, category }, ... ] }
 */
router.get('/skills', async (req, res) => {
  try {
    const skills = await Skill.find().sort({ category: 1, name: 1 });
    return res.status(200).json({ success: true, data: skills });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching skills.' });
  }
});

/**
 * GET /api/catalog/wilayas
 * Returns all wilayas sorted by code.
 * Response: { success: true, data: [ { _id, code, name }, ... ] }
 */
router.get('/wilayas', async (req, res) => {
  try {
    const wilayas = await Wilaya.find().sort({ code: 1 });
    return res.status(200).json({ success: true, data: wilayas });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching wilayas.' });
  }
});

module.exports = router;