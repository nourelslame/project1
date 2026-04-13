/**
 * File: models/Notification.js
 * Purpose: Defines a notification in the system for different events.
 */

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: [
      'NEW_APPLICATION',
      'CANDIDATE_ACCEPTED',
      'VALIDATION_REQUIRED',
      'AGREEMENT_GENERATED',
    ],
    required: true,
  },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
