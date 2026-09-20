const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { eventRating, myEventRating, rateEvent } = require('../controllers/ratingController');
router.get('/event/:eventId', eventRating);
router.get('/event/:eventId/mine', requireAuth, myEventRating);
router.post('/event/:eventId', requireAuth, rateEvent);
module.exports = router;
