/**
 * File: server.js
 * Purpose: Entry point — connects to MongoDB, seeds catalog, registers all routes.
 */

const express     = require('express');
const cors        = require('cors');
const dotenv      = require('dotenv');
const connectDB   = require('./config/db');
const seedCatalog = require('./utils/seedCatalog');

dotenv.config();

// Connect to MongoDB then seed the catalog with default skills + wilayas
connectDB().then(() => seedCatalog());

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

// ── NEW: public catalog (skills + wilayas readable by everyone) ──
app.use('/api/catalog',       require('./routes/catalogRoutes'));

app.get('/', (req, res) => res.send('Stag.io API is running ✅'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));