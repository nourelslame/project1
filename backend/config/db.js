/**
 * File: config/db.js
 * Purpose: This file handles the connection to the MongoDB database using Mongoose.
 * It reads the database URI from the environment variables and establishes the connection.
 */

const mongoose = require('mongoose');

/**
 * Connects to the MongoDB database.
 * Uses the connection string provided in the MONGO_URI environment variable.
 */
const connectDB = async () => {
  try {
    // Attempt to connect to the database
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // Log the error and exit the process if connection fails
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
