/**
 * File: server.js
 * Purpose: Entry point for the backend server.
 * Sets up Express, connects to MongoDB, registers all routes, and starts the server.
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express application
const app = express();

// --- Middleware ---
// Allow cross-origin requests from the React frontend
app.use(cors({ origin: 'http://localhost:5173' }));

// Parse incoming JSON requests
app.use(express.json());

// Serve generated PDFs statically from the uploads folder
app.use('/uploads', express.static('uploads'));

// --- Routes ---
// Registering all API routes
app.use('/api/auth',          require('./routes/authRoutes'));
app.use('/api/student',       require('./routes/studentRoutes'));
app.use('/api/company',       require('./routes/companyRoutes'));
app.use('/api/offers',        require('./routes/offerRoutes'));
app.use('/api/applications',  require('./routes/applicationRoutes'));
app.use('/api/admin',         require('./routes/adminRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/documents',     require('./routes/documentRoutes'));

// Basic health check endpoint
app.get('/', (req, res) => res.send('Stag.io API is running'));

// --- Server Start ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
