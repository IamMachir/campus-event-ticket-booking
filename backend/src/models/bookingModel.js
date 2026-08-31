const db = require('../config/db');

async function createBooking({ eventId, userId, ticketCode }) {
  const [result] = await db.query(
    'INSERT INTO bookings (event_id, user_id, ticket_code) VALUES (?, ?, ?)',
    [eventId, userId, ticketCode]
  );
  return result.insertId;
}

async function getBookingsByUser(userId) {
  const [rows] = await db.query(
    `SELECT b.*, e.title, e.start_time, e.location
     FROM bookings b
     JOIN events e ON b.event_id = e.id
     WHERE b.user_id = ?
     ORDER BY b.booked_at DESC`,
    [userId]
  );
  return rows;
}

async function findByTicketCode(ticketCode) {
  const [rows] = await db.query('SELECT * FROM bookings WHERE ticket_code = ?', [ticketCode]);
  return rows[0] || null;
}

async function markCheckedIn(ticketCode) {
  await db.query(
    "UPDATE bookings SET status = 'checked_in', checked_in_at = NOW() WHERE ticket_code = ?",
    [ticketCode]
  );
}

module.exports = { createBooking, getBookingsByUser, findByTicketCode, markCheckedIn };
