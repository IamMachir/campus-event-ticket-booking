const QRCode = require('qrcode');
const { createBooking, getBookingsByUser, findByTicketCode, markCheckedIn } = require('../models/bookingModel');
const { getEventById, incrementSeatsBooked } = require('../models/eventModel');
const { generateTicketCode } = require('../utils/ticket');

async function bookEvent(req, res) {
  try {
    const { eventId } = req.body;
    const event = await getEventById(eventId);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    if (event.seats_booked >= event.capacity) {
      return res.status(400).json({ error: 'Event is fully booked' });
    }

    const ticketCode = generateTicketCode();
    const bookingId = await createBooking({ eventId, userId: req.user.id, ticketCode });
    await incrementSeatsBooked(eventId);

    const qrDataUrl = await QRCode.toDataURL(ticketCode);

    res.status(201).json({ bookingId, ticketCode, qrCode: qrDataUrl });
  } catch (err) {
    res.status(500).json({ error: 'Booking failed', details: err.message });
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

module.exports = { bookEvent, myBookings, checkIn };
