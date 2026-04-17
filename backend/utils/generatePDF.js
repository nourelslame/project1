/**
 * File: utils/generatePDF.js
 * Purpose: Generates the official "Convention de Stage" PDF.
 * - Includes the university logo (Université Abdelhamid Mehri Constantine 2)
 * - Uses all real student/company/offer data from the database
 * - Matches the official Algerian university format
 *
 * IMPORTANT: Place the file "university-logo.png" in the "assets/" folder
 * at the root of your backend project:
 *   backend/
 *   └── assets/
 *       └── university-logo.png
 */

const PDFDocument = require('pdfkit');
const fs          = require('fs');
const path        = require('path');

// Path to the university logo — put the PNG file here
const LOGO_PATH = path.join(__dirname, '..', 'assets', 'university-logo.png');

/**
 * Draw a horizontal line
 */
function hLine(doc, y, x1 = 50, x2 = 545) {
  doc.save().moveTo(x1, y).lineTo(x2, y).stroke().restore();
}

/**
 * Draw a rectangle border
 */
function drawRect(doc, x, y, w, h) {
  doc.save().rect(x, y, w, h).stroke().restore();
}

/**
 * Generates the Convention de Stage PDF.
 *
 * @param {Object} data
 * @param {string} data.appId
 * @param {string} data.firstName          - Student first name
 * @param {string} data.lastName           - Student last name
 * @param {string} data.university         - University name
 * @param {string} data.faculty            - Faculté / University (maps to Faculté field)
 * @param {string} data.department         - Département
 * @param {string} data.studentCardId      - Carte d'étudiant n°
 * @param {string} data.phone              - Student phone
 * @param {string} data.level              - Academic level (L3, M1, M2...)
 * @param {string} data.specialty          - Specialty / Program
 * @param {string} data.companyName        - Company name
 * @param {string} data.companyAddress     - Company address / wilaya
 * @param {string} data.companyRepresentative - Person representing the company
 * @param {string} data.companyPhone       - Company phone
 * @param {string} data.offerTitle         - Internship theme / title
 * @param {string} data.supervisorName     - Responsable pédagogique
 * @param {number} data.duration           - Duration in months
 * @param {string} data.startDate          - Start date (formatted)
 * @param {string} data.endDate            - End date (formatted)
 * @param {string} data.city               - City for "Fait à..."
 * @returns {Promise<string>} relative path to the generated PDF
 */
const generatePDF = (data) => {
  return new Promise((resolve, reject) => {
    try {
      // ── Ensure output directory ──────────────────────────────────────────
      const dirPath = path.join(__dirname, '..', 'uploads', 'agreements');
      if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });

      const fileName = `agreement-${data.appId}.pdf`;
      const pdfPath  = path.join(dirPath, fileName);

      // ── Create A4 document ───────────────────────────────────────────────
      const doc    = new PDFDocument({ size: 'A4', margin: 0 });
      const stream = fs.createWriteStream(pdfPath);
      doc.pipe(stream);

      // Page constants
      const L      = 45;    // left margin
      const R      = 550;   // right margin
      const W      = R - L; // usable width = 505

      // ════════════════════════════════════════════════════════════════════
      // HEADER — Logo + University name + Ministry info
      // ════════════════════════════════════════════════════════════════════
      const HEADER_Y = 30;

      // ── University logo (left side) ──
      const logoExists = fs.existsSync(LOGO_PATH);
      if (logoExists) {
        doc.image(LOGO_PATH, L, HEADER_Y, { width: 70, height: 70 });
      }

      // ── Ministry + University text (center) ──
      doc
        .font('Helvetica')
        .fontSize(8)
        .text('الجمهورية الجزائرية الديمقراطية الشعبية', L + 75, HEADER_Y + 2, { width: W - 75, align: 'center' })
        .text("République Algérienne Démocratique et Populaire", L + 75, doc.y + 1, { width: W - 75, align: 'center' })
        .moveDown(0.2)
        .text("وزارة التعليم العالي والبحث العلمي", L + 75, doc.y, { width: W - 75, align: 'center' })
        .text("Ministère de l'Enseignement Supérieur et de la Recherche Scientifique", L + 75, doc.y + 1, { width: W - 75, align: 'center' })
        .moveDown(0.3);

      // ── University name ──
      doc
        .font('Helvetica-Bold')
        .fontSize(9)
        .text('جامعة عبد الحميد مهري — قسنطينة 2', L + 75, doc.y, { width: W - 75, align: 'center' })
        .text("Université Abdelhamid Mehri — Constantine 2", L + 75, doc.y + 2, { width: W - 75, align: 'center' });

      // ── Horizontal line under header ──
      const LINE1_Y = HEADER_Y + 78;
      hLine(doc, LINE1_Y, L, R);
      hLine(doc, LINE1_Y + 2, L, R);

      // ════════════════════════════════════════════════════════════════════
      // TITLE
      // ════════════════════════════════════════════════════════════════════
      const TITLE_Y = LINE1_Y + 10;

      doc
        .font('Helvetica-Bold')
        .fontSize(16)
        .text('CONVENTION DE STAGE', L, TITLE_Y, { width: W, align: 'center', underline: true });

      doc
        .font('Helvetica-Bold')
        .fontSize(12)
        .text('ENTRE', L, TITLE_Y + 22, { width: W, align: 'center' });

      // ════════════════════════════════════════════════════════════════════
      // TWO-COLUMN BOX — University | ET | Company
      // ════════════════════════════════════════════════════════════════════
      const BOX_TOP = TITLE_Y + 42;
      const BOX_H   = 115;
      const COL_L_W = 195;   // left column width
      const COL_M_W = 45;    // middle "ET" column
      const COL_R_W = W - COL_L_W - COL_M_W; // right column

      const COL_L_X = L;
      const COL_M_X = L + COL_L_W;
      const COL_R_X = COL_M_X + COL_M_W;

      // Outer box
      drawRect(doc, L, BOX_TOP, W, BOX_H);
      // Dividers
      doc.save().moveTo(COL_M_X, BOX_TOP).lineTo(COL_M_X, BOX_TOP + BOX_H).stroke().restore();
      doc.save().moveTo(COL_R_X, BOX_TOP).lineTo(COL_R_X, BOX_TOP + BOX_H).stroke().restore();

      // ── LEFT: University block ──
      doc
        .font('Helvetica-Bold').fontSize(7.5)
        .text("L'UNIVERSITÉ", COL_L_X + 4, BOX_TOP + 5, { width: COL_L_W - 8, align: 'center' })
        .font('Helvetica-Bold').fontSize(8)
        .text('ABDELHAMID MEHRI — CONSTANTINE 2', COL_L_X + 4, doc.y + 1, { width: COL_L_W - 8, align: 'center' });

      doc
        .font('Helvetica').fontSize(7.5)
        .text('Représentée par :', COL_L_X + 4, doc.y + 5, { width: COL_L_W - 8 })
        .text('Monsieur le Vice-Recteur chargé des', COL_L_X + 4, doc.y + 2, { width: COL_L_W - 8 })
        .text("relations extérieures, ci-après désignée université", COL_L_X + 4, doc.y + 1, { width: COL_L_W - 8 })
        .moveDown(0.3)
        .text('Site : Nouvelle ville Ali Mendjeli, Constantine — Algérie', COL_L_X + 4, doc.y, { width: COL_L_W - 8 })
        .text('Tél/Fax : +00 213 031 82 45 79', COL_L_X + 4, doc.y + 1, { width: COL_L_W - 8 });

      // ── MIDDLE: ET ──
      doc
        .font('Helvetica-Bold').fontSize(14)
        .text('ET', COL_M_X, BOX_TOP + BOX_H / 2 - 8, { width: COL_M_W, align: 'center' });

      // ── RIGHT: Company block ──
      const dots = (n) => ' ' + '.'.repeat(n);

      doc
        .font('Helvetica').fontSize(8)
        .text("L'entreprise (nom et adresse)", COL_R_X + 4, BOX_TOP + 5, { width: COL_R_W - 8, align: 'center' });

      doc
        .font('Helvetica').fontSize(8)
        .text(data.companyName || dots(30), COL_R_X + 4, BOX_TOP + 18, { width: COL_R_W - 8 })
        .text(data.companyAddress || dots(30), COL_R_X + 4, doc.y + 2, { width: COL_R_W - 8 })
        .moveDown(0.4)
        .font('Helvetica-Bold').fontSize(7.5)
        .text('Représentée par :', COL_R_X + 4, doc.y, { width: COL_R_W - 8 })
        .font('Helvetica').fontSize(7.5)
        .text(`Monsieur ${data.companyRepresentative || dots(20)}`, COL_R_X + 4, doc.y + 2, { width: COL_R_W - 8 })
        .text(dots(35), COL_R_X + 4, doc.y + 2, { width: COL_R_W - 8 })
        .text(dots(35), COL_R_X + 4, doc.y + 2, { width: COL_R_W - 8 });

      doc
        .font('Helvetica').fontSize(7.5)
        .text(
          `Tél : ${data.companyPhone || dots(12)}    Fax : ${data.companyFax || dots(12)}`,
          COL_R_X + 4, BOX_TOP + BOX_H - 15, { width: COL_R_W - 8 }
        );

      // ════════════════════════════════════════════════════════════════════
      // STUDENT DATA BOX
      // ════════════════════════════════════════════════════════════════════
      const DATA_TOP = BOX_TOP + BOX_H + 14;
      const DATA_H   = 220;

      drawRect(doc, L, DATA_TOP, W, DATA_H);

      // Title bar
      doc
        .font('Helvetica-Bold').fontSize(10.5)
        .text("DONNÉES RELATIVES À L'ÉTUDIANT", L, DATA_TOP + 7, {
          width: W, align: 'center', underline: true,
        });

      // ── Field rows ──
      const FY = DATA_TOP + 26;   // first field y
      const LS = 18.5;            // line spacing
      const LX = L + 5;           // field label x

      // Helper: label bold + value normal on same line
      const field = (label, value, y, xOffset = 0) => {
        doc
          .font('Helvetica-Bold').fontSize(8.5)
          .text(`${label} :`, LX + xOffset, y, { continued: true })
          .font('Helvetica').fontSize(8.5)
          .text(`  ${value || ''}`, { continued: false });
      };

      // Row 0: Nom et prénom
      field('Nom et prénom', `${data.lastName || ''} ${data.firstName || ''}`.trim(), FY);

      // Row 1: Faculté
      field('Faculté', data.faculty || data.university || '', FY + LS);

      // Row 2: Département
      field('Département', data.department || data.specialty || '', FY + LS * 2);

      // Row 3: Carte étudiant | N° Sécurité Sociale (two columns)
      field('Carte d\'étudiant n°', data.studentCardId || '', FY + LS * 3);
      field('N° Sécurité Sociale', data.socialSecurity || '', FY + LS * 3, W / 2);

      // Row 4: Tél
      field('Tél', data.phone || '', FY + LS * 4);

      // Row 5: Diplôme préparé
      field('Diplôme préparé', `${data.level || ''} — ${data.specialty || ''}`, FY + LS * 5);

      // Row 6: Thème du stage
      field('Thème du stage', data.offerTitle || '', FY + LS * 6);

      // Row 7: Responsable pédagogique
      field('Responsable pédagogique', data.supervisorName || '', FY + LS * 7);

      // Row 8: Durée du stage
      field('Durée du stage', `${data.duration || ''} mois`, FY + LS * 8);

      // Row 9: Début | Fin (two columns)
      field('Date de début du stage', data.startDate || '', FY + LS * 9);
      field('Date de fin du stage', data.endDate || '', FY + LS * 9, W / 2);

      // Bottom note inside box
      doc
        .font('Helvetica').fontSize(7).fillColor('#444')
        .text(
          "Etablie en 02 exemplaires originaux : 1 exemplaire pour l'université et 01 exemplaire pour l'entreprise",
          L + 4, DATA_TOP + DATA_H - 14, { width: W - 8 }
        );
      doc.fillColor('black');

      // ════════════════════════════════════════════════════════════════════
      // FOOTER
      // ════════════════════════════════════════════════════════════════════
      const FOOT_Y = DATA_TOP + DATA_H + 12;

      // "Fait à … le …"
      const today = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
      doc
        .font('Helvetica').fontSize(9.5)
        .text(`Fait à ${data.city || 'Constantine'} le : ${today}`, L, FOOT_Y, {
          width: W, align: 'right',
        });

      // "Visa du chef de département"
      doc
        .font('Helvetica-Bold').fontSize(9.5)
        .text('Visa du chef de département :', L, FOOT_Y + 20);

      // Visa signature line
      doc.save()
        .moveTo(L, FOOT_Y + 36)
        .lineTo(L + 190, FOOT_Y + 36)
        .stroke()
        .restore();

      // Bottom signatures
      const SIG_Y = FOOT_Y + 75;

      doc
        .font('Helvetica-Bold').fontSize(9.5)
        .text("Pour l'entreprise", L, SIG_Y);

      doc.save()
        .moveTo(L, SIG_Y + 14)
        .lineTo(L + 175, SIG_Y + 14)
        .stroke()
        .restore();

      doc
        .font('Helvetica-Bold').fontSize(9.5)
        .text("Pour l'université", R - 175, SIG_Y, { width: 175, align: 'right' });

      doc.save()
        .moveTo(R - 175, SIG_Y + 14)
        .lineTo(R, SIG_Y + 14)
        .stroke()
        .restore();

      // ════════════════════════════════════════════════════════════════════
      doc.end();
      stream.on('finish', () => resolve(`uploads/agreements/${fileName}`));
      stream.on('error',  (err) => reject(err));

    } catch (err) {
      reject(err);
    }
  });
};

module.exports = generatePDF;