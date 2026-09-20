const QRCode = require('qrcode');
const pool = require('../config/db');
const { getBookingsByUser, findByTicketCode, findById, cancelBooking, markCheckedIn } = require('../models/bookingModel');
const { decrementSeatsBooked } = require('../models/eventModel');
const { findUserById } = require('../models/userModel');
const { createNotification } = require('../models/notificationModel');
const { generateTicketCode } = require('../utils/ticket');
const { sendBookingConfirmation } = require('../utils/email');

async function bookEvent(req, res) {
  const conn = await pool.getConnection();
  try {
    const { eventId } = req.body; await conn.beginTransaction();
    const [events] = await conn.query('SELECT * FROM events WHERE id = ? FOR UPDATE', [eventId]); const event = events[0];
    if (!event) { await conn.rollback(); return res.status(404).json({ error: 'Event not found' }); }
    if (event.seats_booked >= event.capacity) { await conn.rollback(); return res.status(400).json({ error: 'Event is fully booked' }); }
    const [existing] = await conn.query('SELECT id FROM bookings WHERE event_id = ? AND user_id = ? AND status != ? FOR UPDATE', [eventId, req.user.id, 'cancelled']);
    if (existing.length > 0) { await conn.rollback(); return res.status(409).json({ error: 'You already have a booking for this event' }); }
    const ticketCode = generateTicketCode();
    await conn.query('INSERT INTO bookings (event_id, user_id, ticket_code) VALUES (?, ?, ?)', [eventId, req.user.id, ticketCode]);
    await conn.query('UPDATE events SET seats_booked = seats_booked + 1 WHERE id = ?', [eventId]); await conn.commit();
    const qrDataUrl = await QRCode.toDataURL(ticketCode, { errorCorrectionLevel: 'M', margin: 2, width: 320 });
    try { await createNotification({ userId: req.user.id, type: 'booking', title: 'Ticket confirmed', message: 'Your ticket for ' + event.title + ' is ready. Keep the QR code handy for entry.', eventId }); } catch (notificationError) { console.error('Booking notification failed:', notificationError.message); }
    findUserById(req.user.id).then((user) => user && sendBookingConfirmation({ toEmail: user.email, toName: user.full_name, eventTitle: event.title, eventStartTime: event.start_time, ticketCode })).catch((err) => console.error('Booking confirmation email failed:', err.message));
    res.status(201).json({ bookingId: null, ticketCode, qrCode: qrDataUrl });
  } catch (err) { await conn.rollback(); res.status(500).json({ error: 'Booking failed', details: err.message }); } finally { conn.release(); }
}

async function myBookings(req, res) {
  try { const bookings = await getBookingsByUser(req.user.id); await Promise.all(bookings.map(async (booking) => { booking.qr_code = await QRCode.toDataURL(booking.ticket_code, { errorCorrectionLevel: 'M', margin: 2, width: 320 }); })); res.json(bookings); } catch (err) { res.status(500).json({ error: 'Failed to fetch bookings', details: err.message }); }
}

async function cancelMyBooking(req, res) {
  try { const booking = await findById(req.params.id); if (!booking) return res.status(404).json({ error: 'Booking not found' }); if (booking.user_id !== req.user.id) return res.status(403).json({ error: 'You can only cancel your own bookings' }); if (booking.status === 'cancelled') return res.status(400).json({ error: 'Booking is already cancelled' }); await cancelBooking(booking.id); await decrementSeatsBooked(booking.event_id); res.json({ message: 'Booking cancelled' }); } catch (err) { res.status(500).json({ error: 'Failed to cancel booking', details: err.message }); }
}

function bookingSummary(booking) { return { id: booking.id, ticket_code: booking.ticket_code, status: booking.status, event_id: booking.event_id, event_title: booking.event_title, start_time: booking.start_time, location: booking.location, attendee_name: booking.attendee_name, checked_in_at: booking.checked_in_at }; }
async function validateTicket(req, res) {
  try { const ticketCode = req.body.ticketCode?.trim(); if (!ticketCode) return res.status(400).json({ error: 'Ticket code is required' }); const booking = await findByTicketCode(ticketCode);
    if (!booking) return res.status(404).json({ error: 'Ticket not found. This QR code is not valid.' });
    if (booking.status === 'checked_in') return res.status(409).json({ error: 'This ticket has already been used and cannot be scanned again.', fraud: true, booking: bookingSummary(booking) });
    if (booking.status === 'cancelled') return res.status(409).json({ error: 'This ticket was cancelled and is not valid for entry.', fraud: true, booking: bookingSummary(booking) });
    res.json({ valid: true, message: 'Valid ticket', booking: bookingSummary(booking) });
  } catch (err) { res.status(500).json({ error: 'Ticket validation failed', details: err.message }); }
}
async function checkIn(req, res) {
  try { const ticketCode = req.body.ticketCode?.trim(); if (!ticketCode) return res.status(400).json({ error: 'Ticket code is required' }); const booking = await findByTicketCode(ticketCode);
    if (!booking) return res.status(404).json({ error: 'Ticket not found. This QR code is not valid.' });
    if (booking.status === 'checked_in') return res.status(409).json({ error: 'This ticket has already been used and cannot be scanned again.', fraud: true, booking: bookingSummary(booking) });
    if (booking.status === 'cancelled') return res.status(409).json({ error: 'This ticket was cancelled and is not valid for entry.', fraud: true, booking: bookingSummary(booking) });
    const changed = await markCheckedIn(ticketCode); if (!changed) return res.status(409).json({ error: 'This ticket was just checked in by another scanner.', fraud: true });
    const checkedInBooking = await findByTicketCode(ticketCode); res.json({ valid: true, message: 'Checked in successfully', ticketCode, booking: bookingSummary(checkedInBooking) });
  } catch (err) { res.status(500).json({ error: 'Check-in failed', details: err.message }); }
}
module.exports = { bookEvent, myBookings, cancelMyBooking, validateTicket, checkIn };
