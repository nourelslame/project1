/**
 * File: controllers/documentController.js
 * Purpose: Handles fetching and downloading generated PDF agreements.
 */

const InternshipAgreement = require('../models/InternshipAgreement');
const path = require('path');
const fs = require('fs');

/**
 * Preview agreement data (returns JSON about the agreement).
 */
const previewAgreement = async (req, res) => {
  try {
    const agreement = await InternshipAgreement.findOne({ applicationId: req.params.appId })
      .populate('studentId')
      .populate('companyId');

    if (!agreement) {
      return res.status(404).json({ success: false, message: 'Agreement not found.' });
    }

    return res.status(200).json({ success: true, data: agreement });
  } catch (error) {
    console.error(`Preview Agreement Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error retrieving agreement data.' });
  }
};

/**
 * Download the generated PDF agreement.
 */
const downloadAgreement = async (req, res) => {
  try {
    const agreement = await InternshipAgreement.findOne({ applicationId: req.params.appId });

    if (!agreement || !agreement.pdfPath) {
      return res.status(404).json({ success: false, message: 'PDF not found or not yet generated.' });
    }

    // Construct the absolute path to the PDF file
    const absolutePath = path.join(__dirname, '..', agreement.pdfPath);

    if (fs.existsSync(absolutePath)) {
      return res.download(absolutePath); // Express helper to prompt download
    } else {
      return res.status(404).json({ success: false, message: 'File no longer exists on server.' });
    }
  } catch (error) {
    console.error(`Download Agreement Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error downloading agreement.' });
  }
};

module.exports = {
  previewAgreement,
  downloadAgreement
};
