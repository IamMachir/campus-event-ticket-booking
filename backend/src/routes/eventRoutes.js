const express = require('express');
const router = express.Router();
const { listEvents, getEvent, addEvent } = require('../controllers/eventController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/', listEvents);
router.get('/:id', getEvent);
router.post('/', requireAuth, requireRole('organizer', 'admin'), addEvent);

module.exports = router;
