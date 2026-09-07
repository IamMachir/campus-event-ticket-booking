const QRCode = require('qrcode');
const {
  createBooking,
  getBookingsByUser,
  findByTicketCode,
  findById,
  cancelBooking,
  markCheckedIn,
} = require('../models/bookingModel');
const { getEventById, incrementSeatsBooked, decrementSeatsBooked } = require('../models/eventModel');
const { findUserById } = require('../models/userModel');
const { generateTicketCode } = require('../utils/ticket');
const { sendBookingConfirmation } = require('../utils/email');

/**
 * Books a seat for the authenticated user on the given event.
 *
 * Enforces two business invariants at the application layer:
 * 1. Capacity: rejects the booking once seats_booked >= capacity.
 * 2. No duplicates: a user cannot hold two active (non-cancelled) bookings
 *    for the same event.
 *
 * On success, generates a unique ticket code + QR code and fires an
 * async (non-blocking) booking confirmation email.
 *
 * @param {import('express').Request} req - body: { eventId }, req.user set by requireAuth
 * @param {import('express').Response} res
 */
async function bookEvent(req, res) {
  try {
    const { eventId } = req.body;
    const event = await getEventById(eventId);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    if (event.seats_booked >= event.capacity) {
      return res.status(400).json({ error: 'Event is fully booked' });
    }

    // Prevent the same user from booking the same event twice
    const existingBookings = await getBookingsByUser(req.user.id);
    const alreadyBooked = existingBookings.some(
      (b) => b.event_id === Number(eventId) && b.status !== 'cancelled'
    );
    if (alreadyBooked) {
      return res.status(409).json({ error: 'You already have a booking for this event' });
    }

    const ticketCode = generateTicketCode();
    const bookingId = await createBooking({ eventId, userId: req.user.id, ticketCode });
    await incrementSeatsBooked(eventId);

    const qrDataUrl = await QRCode.toDataURL(ticketCode);

    // Fire-and-forget: email delivery (or its console fallback) should never
    // delay the booking response or fail the booking if it errors.
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

    res.status(201).json({ bookingId, ticketCode, qrCode: qrDataUrl });
  } catch (err) {
    res.status(500).json({ error: 'Booking failed', details: err.message });
  }
}

/** @param {import('express').Request} req @param {import('express').Response} res */
async function myBookings(req, res) {
  try {
    const bookings = await getBookingsByUser(req.user.id);
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings', details: err.message });
  }
}

/**
 * Cancels a booking owned by the authenticated user and releases its seat
 * back to the event's available capacity.
 *
 * @param {import('express').Request} req - params: { id: bookingId }
 * @param {import('express').Response} res
 */
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

/**
 * Marks a ticket as checked-in at the event venue. Restricted to
 * organizer/admin roles via requireRole middleware on the route.
 *
 * @param {import('express').Request} req - body: { ticketCode }
 * @param {import('express').Response} res
 */
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
