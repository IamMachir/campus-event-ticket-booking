const QRCode = require('qrcode');
const pool = require('../config/db');
const {
  getBookingsByUser,
  findByTicketCode,
  findById,
  cancelBooking,
  markCheckedIn,
} = require('../models/bookingModel');
const { decrementSeatsBooked } = require('../models/eventModel');
const { findUserById } = require('../models/userModel');
const { generateTicketCode } = require('../utils/ticket');
const { sendBookingConfirmation } = require('../utils/email');

async function bookEvent(req, res) {
  const conn = await pool.getConnection();
  try {
    const { eventId } = req.body;
    await conn.beginTransaction();

    const [events] = await conn.query('SELECT * FROM events WHERE id = ? FOR UPDATE', [eventId]);
    const event = events[0];
    if (!event) { await conn.rollback(); return res.status(404).json({ error: 'Event not found' }); }

    if (event.seats_booked >= event.capacity) {
      await conn.rollback();
      return res.status(400).json({ error: 'Event is fully booked' });
    }

    const [existing] = await conn.query(
      'SELECT id FROM bookings WHERE event_id = ? AND user_id = ? AND status != ? FOR UPDATE',
      [eventId, req.user.id, 'cancelled']
    );
    if (existing.length > 0) {
      await conn.rollback();
      return res.status(409).json({ error: 'You already have a booking for this event' });
    }

    const ticketCode = generateTicketCode();
    await conn.query(
      'INSERT INTO bookings (event_id, user_id, ticket_code) VALUES (?, ?, ?)',
      [eventId, req.user.id, ticketCode]
    );
    await conn.query('UPDATE events SET seats_booked = seats_booked + 1 WHERE id = ?', [eventId]);
    await conn.commit();

    const qrDataUrl = await QRCode.toDataURL(ticketCode);

    findUserById(req.user.id)
      .then((user) => {
        if (!user) return;
        return sendBookingConfirmation({
          toEmail: user.email,
          toName: user.full_name,
          eventTitle: event.title,
          eventStartTime: event.start_time,
          ticketCode,
        });
      })
      .catch((err) => console.error('Booking confirmation email failed:', err.message));

    res.status(201).json({ bookingId: null, ticketCode, qrCode: qrDataUrl });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: 'Booking failed', details: err.message });
  } finally {
    conn.release();
  }
}

async function myBookings(req, res) {
  try {
    const bookings = await getBookingsByUser(req.user.id);
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings', details: err.message });
  }
}

async function cancelMyBooking(req, res) {
  try {
    const booking = await findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.user_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only cancel your own bookings' });
    }
    if (booking.status === 'cancelled') {
      return res.status(400).json({ error: 'Booking is already cancelled' });
    }

    await cancelBooking(booking.id);
    await decrementSeatsBooked(booking.event_id);

    res.json({ message: 'Booking cancelled' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel booking', details: err.message });
  }
}

async function checkIn(req, res) {
  try {
    const { ticketCode } = req.body;
    const booking = await findByTicketCode(ticketCode);

    if (!booking) return res.status(404).json({ error: 'Ticket not found' });
    if (booking.status === 'checked_in') {
      return res.status(400).json({ error: 'Ticket already checked in' });
    }

    await markCheckedIn(ticketCode);
    res.json({ message: 'Checked in successfully', ticketCode });
  } catch (err) {
    res.status(500).json({ error: 'Check-in failed', details: err.message });
  }
}

module.exports = { bookEvent, myBookings, cancelMyBooking, checkIn };
