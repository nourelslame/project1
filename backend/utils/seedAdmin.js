/**
 * File: utils/seedAdmin.js
 * Purpose: Creates the single, hardcoded admin account on first server start.
 *          If the admin already exists it is skipped (idempotent).
 *
 * Credentials (hardcoded — change only here):
 *   Email    : admin@stagio.dz
 *   Password : Admin@12345678
 *   Name     : Admin Stagio
 */

const bcrypt = require('bcryptjs');
const User   = require('../models/User');
const Admin  = require('../models/Admin');

// ── Hardcoded admin credentials ──────────────────────────────────────────────
const ADMIN_EMAIL    = 'admin@gmail.com';
const ADMIN_PASSWORD = '12345678';
const ADMIN_NAME     = 'Admin Stagio';
const ADMIN_DEPT     = 'Internship Office';
// ─────────────────────────────────────────────────────────────────────────────

const seedAdmin = async () => {
  try {
    // Check if admin account already exists
    const existing = await User.findOne({ email: ADMIN_EMAIL, role: 'ADMIN' });
    if (existing) {
      console.log('ℹ️  Admin account already exists — skipping seed');
      return;
    }

    // Hash the password
    const salt         = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, salt);

    // Create base User
    const adminUser = await User.create({
      email:        ADMIN_EMAIL,
      passwordHash,
      name:         ADMIN_NAME,
      role:         'ADMIN',
    });

    // Create Admin profile
    await Admin.create({
      userId:     adminUser._id,
      fullName:   ADMIN_NAME,
      department: ADMIN_DEPT,
    });

    console.log('✅ Admin account seeded:');
    console.log(`   Email    : ${ADMIN_EMAIL}`);
    console.log(`   Password : ${ADMIN_PASSWORD}`);
    console.log('   ⚠️  Change these credentials in utils/seedAdmin.js for production!');
  } catch (err) {
    console.error(`❌ Failed to seed admin: ${err.message}`);
  }
};

module.exports = seedAdmin;