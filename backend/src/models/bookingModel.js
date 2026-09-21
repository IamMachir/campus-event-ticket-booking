const db = require('../config/db');
const { getCampusNow, getCampusTomorrowBounds } = require('../utils/campusTime');

async function createBooking({ eventId, userId, ticketCode }) {
  const [result] = await db.query('INSERT INTO bookings (event_id, user_id, ticket_code) VALUES (?, ?, ?)', [eventId, userId, ticketCode]);
  return result.insertId;
}
async function getBookingsByUser(userId) {
  const [rows] = await db.query('SELECT b.*, e.title, e.start_time, e.location FROM bookings b JOIN events e ON b.event_id = e.id WHERE b.user_id = ? ORDER BY b.booked_at DESC', [userId]);
  return rows;
}

// Includes e.organizer_id so the controller can verify the scanning organizer
// actually owns the event this ticket belongs to.
async function findByTicketCode(ticketCode) {
  const [rows] = await db.query(
    `SELECT b.*, e.title AS event_title, e.start_time, e.location, e.organizer_id,
            u.full_name AS attendee_name
     FROM bookings b
     JOIN events e ON b.event_id = e.id
     JOIN users u ON b.user_id = u.id
     WHERE b.ticket_code = ?`,
    [ticketCode]
  );
  return rows[0] || null;
}
async function findById(id) { const [rows] = await db.query('SELECT * FROM bookings WHERE id = ?', [id]); return rows[0] || null; }
async function cancelBooking(id) { await db.query("UPDATE bookings SET status = 'cancelled' WHERE id = ?", [id]); }
async function markCheckedIn(ticketCode) {
  const [result] = await db.query("UPDATE bookings SET status = 'checked_in', checked_in_at = NOW() WHERE ticket_code = ? AND status = 'booked'", [ticketCode]);
  return result.affectedRows;
}

// Mark all 'booked' tickets whose event day has fully passed as 'expired'.
// An event day is considered passed once the campus-local calendar day of the
// event's start_time is entirely in the past (i.e. "today" is at least the day
// after the event day). Returns the list of expired bookings (with user + event
// info) so the caller can send expiry notifications.
async function expirePastDayBookings(date = new Date()) {
  const { start: tomorrowStart } = getCampusTomorrowBounds(date);
  const [rows] = await db.query(
    `SELECT b.id, b.user_id, b.event_id, e.title AS event_title, e.start_time
     FROM bookings b
     JOIN events e ON b.event_id = e.id
     WHERE b.status = 'booked' AND e.start_time < ?`,
    [tomorrowStart]
  );
  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.id);
  const placeholders = ids.map(() => '?').join(', ');
  await db.query(`UPDATE bookings SET status = 'expired' WHERE id IN (${placeholders})`, ids);
  return rows;
}

// Send a "1 day left" reminder for 'booked' tickets whose event is tomorrow.
// Returns the list of bookings that qualify so the caller can create
// notifications (deduped by the notification model).
async function getBookingsExpiringTomorrow(date = new Date()) {
  const { start: tomorrowStart, end: dayAfterTomorrowStart } = getCampusTomorrowBounds(date);
  const [rows] = await db.query(
    `SELECT b.id, b.user_id, b.event_id, e.title AS event_title, e.start_time
     FROM bookings b
     JOIN events e ON b.event_id = e.id
     WHERE b.status = 'booked' AND e.start_time >= ? AND e.start_time < ?`,
    [tomorrowStart, dayAfterTomorrowStart]
  );
  return rows;
}

module.exports = {
  createBooking,
  getBookingsByUser,
  findByTicketCode,
  findById,
  cancelBooking,
  markCheckedIn,
  expirePastDayBookings,
  getBookingsExpiringTomorrow,
};
