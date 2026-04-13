/**
 * File: routes/notificationRoutes.js
 * Purpose: Routing for notification operations.
 * Allows any authenticated user to view and manage their notifications.
 */

const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, markAllAsRead } = require('../controllers/notificationController');
const auth = require('../middleware/auth');

// All routes require basic authentication
router.use(auth);

// GET /api/notifications
router.get('/', getNotifications);

// PUT /api/notifications/read-all
router.put('/read-all', markAllAsRead);

// PUT /api/notifications/:id/read
router.put('/:id/read', markAsRead);

module.exports = router;
