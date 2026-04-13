/**
 * File: utils/generatePDF.js
 * Purpose: Generates the "Convention de Stage" PDF using pdfkit and saves it to the uploads folder.
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generates an Internship Agreement PDF.
 * 
 * @param {Object} data - Information required to populate the PDF
 * @param {string} data.appId - The Application ID, used for naming the file
 * @param {string} data.firstName - Student's first name
 * @param {string} data.lastName - Student's last name
 * @param {string} data.level - Student's degree level
 * @param {string} data.specialty - Student's specialty
 * @param {string} data.companyName - Company's name
 * @param {string} data.offerTitle - Internship offer title
 * @param {number} data.duration - Internship duration in months
 * @param {string} data.startDate - Start date formatted string
 * @param {string} data.endDate - End date formatted string
 * @param {string} data.supervisorName - Supervisor's name
 * @param {string} data.universityName - University name
 * @returns {Promise<string>} - The relative path to the generated PDF
 */
const generatePDF = (data) => {
  return new Promise((resolve, reject) => {
    try {
      // Create the uploads and uploads/agreements directories if they do not exist
      const dirPath = path.join(__dirname, '..', 'uploads', 'agreements');
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      const fileName = `agreement-${data.appId}.pdf`;
      const pdfPath = path.join(dirPath, fileName);

      // Create a new PDF document instance
      const doc = new PDFDocument({ margin: 50 });

      // Pipe the document to a file stream
      const stream = fs.createWriteStream(pdfPath);
      doc.pipe(stream);

      // --- Draw header ---
      doc.fontSize(12).text("REPUBLIQUE ALGERIENNE", { align: 'center' });
      doc.text("MINISTERE DE L'ENSEIGNEMENT SUPERIEUR", { align: 'center' });
      doc.moveDown(1);
      doc.fontSize(14).text(data.universityName, { align: 'center' });
      
      doc.moveDown(2);
      doc.fontSize(18).text("CONVENTION DE STAGE", { align: 'center', underline: true });
      doc.moveDown(3);

      // --- Draw body ---
      doc.fontSize(12);
      const leftMargin = 100;
      doc.text(`ETUDIANT:    ${data.firstName} ${data.lastName}`, leftMargin);
      doc.moveDown(0.5);
      doc.text(`NIVEAU:      ${data.level} - ${data.specialty}`, leftMargin);
      doc.moveDown(0.5);
      doc.text(`ENTREPRISE:  ${data.companyName}`, leftMargin);
      doc.moveDown(0.5);
      doc.text(`SUJET:       ${data.offerTitle}`, leftMargin);
      doc.moveDown(0.5);
      doc.text(`DUREE:       ${data.duration} mois`, leftMargin);
      doc.moveDown(0.5);
      doc.text(`DEBUT:       ${data.startDate}`, leftMargin);
      doc.moveDown(0.5);
      doc.text(`FIN:         ${data.endDate}`, leftMargin);
      doc.moveDown(0.5);
      doc.text(`ENCADREUR:   ${data.supervisorName || 'N/A'}`, leftMargin);
      
      doc.moveDown(4);

      // --- Draw signatures section ---
      doc.text("Signature Étudiant", 80, doc.y, { continued: true });
      doc.text("Signature Entreprise", 0, doc.y, { align: 'right' });
      doc.moveDown(3);
      doc.text("Cachet Université", { align: 'center' });

      // Finalize the PDF and end the stream
      doc.end();

      // Resolve the Promise when the write stream finishes
      stream.on('finish', () => {
        resolve(`uploads/agreements/${fileName}`);
      });

      stream.on('error', (err) => {
        reject(err);
      });

    } catch (err) {
      reject(err);
    }
  });
};

module.exports = generatePDF;
