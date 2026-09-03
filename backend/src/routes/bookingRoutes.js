const express = require('express');
const router = express.Router();
const { bookEvent, myBookings, cancelMyBooking, checkIn } = require('../controllers/bookingController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.post('/', requireAuth, bookEvent);
router.get('/me', requireAuth, myBookings);
router.post('/:id/cancel', requireAuth, cancelMyBooking);
router.post('/check-in', requireAuth, requireRole('organizer', 'admin'), checkIn);

module.exports = router;
