const express = require('express');
const router = express.Router();
const { listEvents, getEvent, addEvent, editEvent, removeEvent } = require('../controllers/eventController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/', listEvents);
router.get('/:id', getEvent);
router.post('/', requireAuth, requireRole('organizer', 'admin'), addEvent);
router.put('/:id', requireAuth, requireRole('organizer', 'admin'), editEvent);
router.delete('/:id', requireAuth, requireRole('organizer', 'admin'), removeEvent);

module.exports = router;
