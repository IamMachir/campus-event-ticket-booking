const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { listNotifications, unreadCount, readNotification, readAllNotifications } = require('../controllers/notificationController');
const {
  getPreferences,
  updatePreferences,
  updateInterests,
} = require('../controllers/notificationPreferenceController');
router.use(requireAuth);
router.get('/', listNotifications);
router.get('/unread-count', unreadCount);
router.get('/preferences', getPreferences);
router.patch('/preferences', updatePreferences);
router.put('/interests', updateInterests);
router.patch('/read-all', readAllNotifications);
router.patch('/:id/read', readNotification);
module.exports = router;
