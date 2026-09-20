const { getEventById } = require('../models/eventModel');
const { getEventRating, getUserRating, upsertRating } = require('../models/ratingModel');
const db = require('../config/db');
async function eventRating(req, res) { try { const event = await getEventById(req.params.eventId); if (!event) return res.status(404).json({ error: 'Event not found' }); res.json(await getEventRating(event.id)); } catch (err) { res.status(500).json({ error: 'Failed to load ratings', details: err.message }); } }
async function myEventRating(req, res) { try { res.json(await getUserRating(req.params.eventId, req.user.id)); } catch (err) { res.status(500).json({ error: 'Failed to load your rating', details: err.message }); } }
async function rateEvent(req, res) {
  try {
    const eventId = Number(req.params.eventId); const rating = Number(req.body.rating); const comment = typeof req.body.comment === 'string' ? req.body.comment.trim().slice(0, 500) : '';
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be a whole number from 1 to 5' });
    const event = await getEventById(eventId); if (!event) return res.status(404).json({ error: 'Event not found' });
    const [bookings] = await db.query("SELECT id FROM bookings WHERE event_id = ? AND user_id = ? AND status != 'cancelled' LIMIT 1", [eventId, req.user.id]);
    if (!bookings.length) return res.status(403).json({ error: 'Book this event before rating it' });
    await upsertRating(eventId, req.user.id, rating, comment);
    res.json({ ...await getEventRating(eventId), userRating: rating, message: 'Rating saved' });
  } catch (err) { res.status(500).json({ error: 'Failed to save rating', details: err.message }); }
}
module.exports = { eventRating, myEventRating, rateEvent };
