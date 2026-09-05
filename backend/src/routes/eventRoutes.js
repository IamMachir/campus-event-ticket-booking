const express = require('express');
const router = express.Router();
const { listEvents, getEvent, addEvent, editEvent, removeEvent, organizerStats } = require('../controllers/eventController');
const { requireAuth, requireRole } = require('../middleware/auth');
const { handleValidation, eventRules } = require('../middleware/validation');

router.get('/', listEvents);
router.get('/organizer/stats', requireAuth, requireRole('organizer', 'admin'), organizerStats);
router.get('/:id', getEvent);
router.post('/', requireAuth, requireRole('organizer', 'admin'), eventRules, handleValidation, addEvent);
router.put('/:id', requireAuth, requireRole('organizer', 'admin'), eventRules, handleValidation, editEvent);
router.delete('/:id', requireAuth, requireRole('organizer', 'admin'), removeEvent);

module.exports = router;
