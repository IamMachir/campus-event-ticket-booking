const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { listNotifications, readNotification, readAllNotifications } = require('../controllers/notificationController');
router.use(requireAuth);
router.get('/', listNotifications);
router.patch('/read-all', readAllNotifications);
router.patch('/:id/read', readNotification);
module.exports = router;
