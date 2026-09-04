const express = require('express');
const router = express.Router();
const { bookEvent, myBookings, cancelMyBooking, checkIn } = require('../controllers/bookingController');
const { requireAuth, requireRole } = require('../middleware/auth');
const { handleValidation, bookingRules } = require('../middleware/validation');

router.post('/', requireAuth, bookingRules, handleValidation, bookEvent);
router.get('/me', requireAuth, myBookings);
router.post('/:id/cancel', requireAuth, cancelMyBooking);
router.post('/check-in', requireAuth, requireRole('organizer', 'admin'), checkIn);

module.exports = router;
