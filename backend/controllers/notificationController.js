/**
 * File: controllers/notificationController.js
 * Purpose: Handles fetching and marking notifications as read.
 */

const Notification = require('../models/Notification');

/**
 * Get all notifications for the current authenticated user.
 */
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipientId: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    console.error(`Get Notifications Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error retrieving notifications.' });
  }
};

/**
 * Mark a single notification as read.
 */
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipientId: req.user.id },
      { $set: { isRead: true } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    return res.status(200).json({ success: true, data: notification });
  } catch (error) {
    console.error(`Mark Notification Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error marking notification.' });
  }
};

/**
 * Mark all notifications as read for the current user.
 */
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipientId: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );

    return res.status(200).json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    console.error(`Mark All Notifications Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error marking all notifications.' });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead
};
