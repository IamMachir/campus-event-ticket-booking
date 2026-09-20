const db = require('../config/db');

async function createBooking({ eventId, userId, ticketCode }) {
  const [result] = await db.query('INSERT INTO bookings (event_id, user_id, ticket_code) VALUES (?, ?, ?)', [eventId, userId, ticketCode]);
  return result.insertId;
}
async function getBookingsByUser(userId) {
  const [rows] = await db.query('SELECT b.*, e.title, e.start_time, e.location FROM bookings b JOIN events e ON b.event_id = e.id WHERE b.user_id = ? ORDER BY b.booked_at DESC', [userId]);
  return rows;
}
async function findByTicketCode(ticketCode) {
  const [rows] = await db.query('SELECT b.*, e.title AS event_title, e.start_time, e.location, u.full_name AS attendee_name FROM bookings b JOIN events e ON b.event_id = e.id JOIN users u ON b.user_id = u.id WHERE b.ticket_code = ?', [ticketCode]);
  return rows[0] || null;
}
async function findById(id) { const [rows] = await db.query('SELECT * FROM bookings WHERE id = ?', [id]); return rows[0] || null; }
async function cancelBooking(id) { await db.query("UPDATE bookings SET status = 'cancelled' WHERE id = ?", [id]); }
async function markCheckedIn(ticketCode) {
  const [result] = await db.query("UPDATE bookings SET status = 'checked_in', checked_in_at = NOW() WHERE ticket_code = ? AND status = 'booked'", [ticketCode]);
  return result.affectedRows;
}
module.exports = { createBooking, getBookingsByUser, findByTicketCode, findById, cancelBooking, markCheckedIn };
