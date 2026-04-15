/**
 * File: server.js
 * Purpose: Entry point — connects to MongoDB, seeds catalog + admin, registers all routes.
 */

const express     = require('express');
const cors        = require('cors');
const dotenv      = require('dotenv');
const connectDB   = require('./config/db');
const seedCatalog = require('./utils/seedCatalog');
const seedAdmin   = require('./utils/seedAdmin');

dotenv.config();

// Connect to MongoDB then seed everything
connectDB().then(async () => {
  await seedCatalog();   // default skills + wilayas
  await seedAdmin();     // single admin account
});

const app = express();

// ── Middleware ──
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// ── Routes ──
app.use('/api/auth',          require('./routes/authRoutes'));
app.use('/api/student',       require('./routes/studentRoutes'));
app.use('/api/company',       require('./routes/companyRoutes'));
app.use('/api/offers',        require('./routes/offerRoutes'));
app.use('/api/applications',  require('./routes/applicationRoutes'));
app.use('/api/admin',         require('./routes/adminRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/documents',     require('./routes/documentRoutes'));
app.use('/api/catalog',       require('./routes/catalogRoutes'));

app.get('/', (req, res) => res.send('Stag.io API is running ✅'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));