const db = require('../config/db');

// A student is notified once even when they both booked and saved an event.
async function getEventAudience(eventId) {
  const [rows] = await db.query(
    `SELECT DISTINCT candidates.user_id
     FROM (
       SELECT b.user_id
       FROM bookings b
       WHERE b.event_id = ? AND b.status IN ('booked', 'checked_in')
       UNION
       SELECT f.user_id
       FROM favorites f
       WHERE f.event_id = ?
     ) candidates
     JOIN users u ON u.id = candidates.user_id
     WHERE u.role = 'student'`,
    [eventId, eventId],
  );
  return rows.map((row) => row.user_id);
}

module.exports = { getEventAudience };