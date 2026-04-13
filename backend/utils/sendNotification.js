/**
 * File: utils/sendNotification.js
 * Purpose: Helper function to create notifications for users in the database.
 */

const Notification = require('../models/Notification');

/**
 * Creates a notification record for a specific user.
 * 
 * @param {string} recipientId - The User ID who will receive the notification
 * @param {string} message - The notification text/message
 * @param {string} type - The notification type (e.g., NEW_APPLICATION, CANDIDATE_ACCEPTED)
 * @returns {Promise<Object>} - The saved notification document
 */
const sendNotification = async (recipientId, message, type) => {
  try {
    const newNotification = new Notification({
      recipientId,
      message,
      type
    });
    
    // Save the notification to the database
    const savedNotification = await newNotification.save();
    return savedNotification;
  } catch (error) {
    console.error(`❌ Error creating notification for user ${recipientId}: ${error.message}`);
    // We throw the error so the calling controller can handle it if needed
    throw error;
  }
};

module.exports = sendNotification;
