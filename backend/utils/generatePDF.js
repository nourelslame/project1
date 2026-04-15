/**
 * File: utils/generatePDF.js
 * Purpose: Generates the "Convention de Stage" PDF that matches the official
 *          Algerian university format (as shown in the reference image).
 *
 * Layout:
 *   - Header with university logo area + title "CONVENTION DE STAGE ENTRE"
 *   - Two-column box: University info (left) | Company info (right)
 *   - "DONNÉES RELATIVES À L'ÉTUDIANT" bordered section
 *   - Footer: signatures + date + visa
 */

const PDFDocument = require('pdfkit');
const fs          = require('fs');
const path        = require('path');

/**
 * Draws a horizontal line across the page.
 */
function hLine(doc, y, x1 = 50, x2 = 545) {
  doc.moveTo(x1, y).lineTo(x2, y).stroke();
}

/**
 * Draws a rectangle border.
 */
function rect(doc, x, y, w, h) {
  doc.rect(x, y, w, h).stroke();
}

/**
 * Generates the Convention de Stage PDF.
 *
 * @param {Object} data
 * @param {string} data.appId
 * @param {string} data.firstName
 * @param {string} data.lastName
 * @param {string} data.university         - e.g. "Université Sétif 1 — Ferhat Abbas"
 * @param {string} data.faculty            - Faculté
 * @param {string} data.department         - Département
 * @param {string} data.studentId          - Carte étudiant n°
 * @param {string} data.phone              - Téléphone étudiant
 * @param {string} data.level              - e.g. "L3"
 * @param {string} data.specialty          - e.g. "Informatique — TI"
 * @param {string} data.companyName
 * @param {string} data.companyAddress     - Adresse entreprise
 * @param {string} data.companyRepresentative - Représentant de l'entreprise
 * @param {string} data.companyPhone
 * @param {string} data.companyFax
 * @param {string} data.offerTitle         - Thème du stage
 * @param {string} data.supervisorName     - Responsable pédagogique
 * @param {number} data.duration           - en mois
 * @param {string} data.startDate          - formatted string
 * @param {string} data.endDate            - formatted string
 * @param {string} data.city               - Ville pour "Fait à ..."
 * @returns {Promise<string>} relative path to the generated PDF
 */
const generatePDF = (data) => {
  return new Promise((resolve, reject) => {
    try {
      // ── Ensure output directory exists ──
      const dirPath = path.join(__dirname, '..', 'uploads', 'agreements');
      if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });

      const fileName = `agreement-${data.appId}.pdf`;
      const pdfPath  = path.join(dirPath, fileName);

      // ── Create document — A4, 50pt margins ──
      const doc    = new PDFDocument({ size: 'A4', margin: 50 });
      const stream = fs.createWriteStream(pdfPath);
      doc.pipe(stream);

      // ── Helpers ──
      const PAGE_W  = 595.28;
      const L       = 50;          // left margin
      const R       = 545;         // right margin
      const COL_W   = (R - L);     // usable width

      // Filled dotted line for fields
      const dotLine = (len = 200) => '.'.repeat(Math.floor(len / 3.5));

      // ══════════════════════════════════════════════════════
      // SECTION 1 — Title header
      // ══════════════════════════════════════════════════════

      // University name top-center (small, above title)
      doc
        .font('Helvetica')
        .fontSize(9)
        .text(data.university || 'UNIVERSITE CONSTANTINE2 — ABD HAMID MEHRI', L, 50, {
          align: 'center', width: COL_W,
        });

      doc.moveDown(0.3);

      // "CONVENTION DE STAGE" big bold title
      doc
        .font('Helvetica-Bold')
        .fontSize(20)
        .text('CONVENTION DE STAGE', L, doc.y, { align: 'center', width: COL_W, underline: true });

      doc.moveDown(0.2);

      doc
        .font('Helvetica-Bold')
        .fontSize(14)
        .text('ENTRE', L, doc.y, { align: 'center', width: COL_W });

      doc.moveDown(0.8);

      // ══════════════════════════════════════════════════════
      // SECTION 2 — Two-column box (University | ET | Company)
      // ══════════════════════════════════════════════════════

      const BOX_TOP    = doc.y;
      const BOX_H      = 110;
      const LEFT_W     = 210;
      const RIGHT_W    = 210;
      const MID_W      = COL_W - LEFT_W - RIGHT_W;          // "ET" column
      const LEFT_X     = L;
      const MID_X      = L + LEFT_W;
      const RIGHT_X    = L + LEFT_W + MID_W;

      // Draw the outer box
      rect(doc, LEFT_X, BOX_TOP, COL_W, BOX_H);

      // Vertical dividers
      doc.moveTo(MID_X,   BOX_TOP).lineTo(MID_X,   BOX_TOP + BOX_H).stroke();
      doc.moveTo(RIGHT_X, BOX_TOP).lineTo(RIGHT_X, BOX_TOP + BOX_H).stroke();

      // — LEFT: University block —
      doc.font('Helvetica-Bold').fontSize(8)
        .text(data.university || 'L\'UNIVERSITE CONSTANTINE 2', LEFT_X + 5, BOX_TOP + 6, {
          width: LEFT_W - 10, align: 'center',
        });

      doc.font('Helvetica').fontSize(7.5)
        .text('Représentée par :', LEFT_X + 5, BOX_TOP + 24, { width: LEFT_W - 10 })
        .text('Monsieur le Vice-Recteur chargé des', LEFT_X + 5, doc.y + 2, { width: LEFT_W - 10 })
        .text('relations extérieures, ci-après désignée', LEFT_X + 5, doc.y + 1, { width: LEFT_W - 10 })
        .text('université', LEFT_X + 5, doc.y + 1, { width: LEFT_W - 10 });

      const univAddr = data.universityAddress || 'ALI MANDJELI, CONSTANTINE, Algérie';
      doc.font('Helvetica').fontSize(7)
        .text(`Tél : ${data.universityPhone || '+213 36 62 45 79'}`, LEFT_X + 5, doc.y + 4, { width: LEFT_W - 10 });

      // — MID: "ET" —
      doc.font('Helvetica-Bold').fontSize(16)
        .text('ET', MID_X, BOX_TOP + BOX_H / 2 - 10, {
          width: MID_W, align: 'center',
        });

      // — RIGHT: Company block —
      doc.font('Helvetica').fontSize(8)
        .text('L\'entreprise (nom et adresse)', RIGHT_X + 5, BOX_TOP + 6, {
          width: RIGHT_W - 10, align: 'center',
        });

      doc.font('Helvetica').fontSize(8)
        .text(data.companyName || dotLine(40), RIGHT_X + 5, BOX_TOP + 20, { width: RIGHT_W - 10 })
        .text(data.companyAddress || dotLine(40), RIGHT_X + 5, doc.y + 2, { width: RIGHT_W - 10 });

      doc.font('Helvetica').fontSize(8)
        .text('Représentée par :', RIGHT_X + 5, BOX_TOP + 55, { width: RIGHT_W - 10 })
        .text(`Monsieur ${data.companyRepresentative || dotLine(25)}`, RIGHT_X + 5, doc.y + 2, { width: RIGHT_W - 10 })
        .text(dotLine(40), RIGHT_X + 5, doc.y + 4, { width: RIGHT_W - 10 })
        .text(dotLine(40), RIGHT_X + 5, doc.y + 2, { width: RIGHT_W - 10 });

      doc.font('Helvetica').fontSize(7.5)
        .text(`Tél : ${data.companyPhone || dotLine(15)}     Fax : ${data.companyFax || dotLine(15)}`,
          RIGHT_X + 5, BOX_TOP + BOX_H - 18, { width: RIGHT_W - 10 });

      // ══════════════════════════════════════════════════════
      // SECTION 3 — "DONNÉES RELATIVES À L'ÉTUDIANT"
      // ══════════════════════════════════════════════════════

      const DATA_TOP = BOX_TOP + BOX_H + 16;
      const DATA_H   = 230;

      rect(doc, L, DATA_TOP, COL_W, DATA_H);

      // Section title bar (bold, centered, underlined inside the box)
      doc.font('Helvetica-Bold').fontSize(11)
        .text("DONNÉES RELATIVES À L'ÉTUDIANT", L, DATA_TOP + 8, {
          width: COL_W, align: 'center', underline: true,
        });

      // ── Field rows ──
      const FY = DATA_TOP + 30;  // first field Y
      const LS = 17;             // line spacing

      const fields = [
        ['Nom et prénom',          `${data.firstName} ${data.lastName}`],
        ['Faculté',                data.faculty      || data.university || ''],
        ['Département',            data.department   || ''],
        ['Carte d\'étudiant n°',   data.studentId    || '',    'N° Sécurité Sociale', data.socialSecurity || ''],
        ['Tél',                    data.phone        || ''],
        ['Diplôme préparé',        `${data.level || ''} — ${data.specialty || ''}`],
        ['Thème du stage',         data.offerTitle   || ''],
        ['Responsable pédagogique', data.supervisorName || ''],
        ['Durée du stage',         `${data.duration || ''} mois`],
        ['Date de début du stage', data.startDate    || '',    'Date de fin du stage', data.endDate || ''],
      ];

      fields.forEach((row, i) => {
        const y = FY + i * LS;

        if (row.length === 4) {
          // Two-column row (e.g. carte étudiant | N° sécu  /  début | fin)
          doc.font('Helvetica-Bold').fontSize(8.5)
            .text(`${row[0]} :`, L + 4, y, { continued: true })
            .font('Helvetica').text(` ${row[1]}`, { continued: false });

          doc.font('Helvetica-Bold').fontSize(8.5)
            .text(`${row[2]} :`, L + COL_W / 2, y, { continued: true })
            .font('Helvetica').text(` ${row[3]}`);
        } else {
          doc.font('Helvetica-Bold').fontSize(8.5)
            .text(`${row[0]} :`, L + 4, y, { continued: true })
            .font('Helvetica').text(` ${row[1] || ''}`, { continued: false });
        }
      });

      // Bottom note inside the box
      doc.font('Helvetica').fontSize(7.5).fillColor('#333333')
        .text(
          'Etablie en 02 exemplaires originaux : 1 exemplaire pour l\'université et 01 exemplaire pour l\'entreprise',
          L + 4, DATA_TOP + DATA_H - 16, { width: COL_W - 8 }
        );
      doc.fillColor('black');

      // ══════════════════════════════════════════════════════
      // SECTION 4 — Footer
      // ══════════════════════════════════════════════════════

      const FOOT_Y = DATA_TOP + DATA_H + 14;

      // "Fait à ... le ..."
      doc.font('Helvetica').fontSize(10)
        .text(
          `Fait à ${data.city || 'Sétif'} le : ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}`,
          L + COL_W / 2, FOOT_Y, { width: COL_W / 2, align: 'right' }
        );

      // "Visa du chef de département"
      doc.font('Helvetica-Bold').fontSize(10)
        .text('Visa du chef de département :', L, FOOT_Y + 24)
        .moveTo(L, FOOT_Y + 40).lineTo(L + 200, FOOT_Y + 40).stroke();

      // Signatures bottom row
      const SIG_Y = FOOT_Y + 80;

      doc.font('Helvetica-Bold').fontSize(10)
        .text('Pour l\'entreprise', L, SIG_Y);

      // Signature line under "Pour l'entreprise"
      doc.moveTo(L, SIG_Y + 14).lineTo(L + 170, SIG_Y + 14).stroke();

      doc.font('Helvetica-Bold').fontSize(10)
        .text('Pour l\'université', R - 170, SIG_Y, { width: 170, align: 'right' });

      // Signature line under "Pour l'université"
      doc.moveTo(R - 170, SIG_Y + 14).lineTo(R, SIG_Y + 14).stroke();

      // ══════════════════════════════════════════════════════
      // Finalize
      // ══════════════════════════════════════════════════════
      doc.end();

      stream.on('finish', () => resolve(`uploads/agreements/${fileName}`));
      stream.on('error',  (err) => reject(err));

    } catch (err) {
      reject(err);
    }
  });
};

module.exports = generatePDF;