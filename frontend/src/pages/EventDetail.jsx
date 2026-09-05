import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client';
import QrTicket from '../components/QrTicket';
import Spinner from '../components/Spinner';

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [ticket, setTicket] = useState(null); // { ticketCode, qrCode }
  const [error, setError] = useState('');
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    api
      .get(`/events/${id}`)
      .then((res) => setEvent(res.data))
      .catch(() => setError('Could not load this event.'));
  }, [id]);

  // If the user already has a booking for this event, surface it instead of a Book button
  useEffect(() => {
    api
      .get('/bookings/me')
      .then((res) => {
        const existing = res.data.find((b) => b.event_id === Number(id) && b.status !== 'cancelled');
        if (existing) setTicket({ ticketCode: existing.ticket_code, qrCode: null });
      })
      .catch(() => {
        // Not logged in — fine, just won't preload an existing ticket
      });
  }, [id]);

  async function handleBook() {
    setError('');
    setBooking(true);
    try {
      const res = await api.post('/bookings', { eventId: Number(id) });
      setTicket({ ticketCode: res.data.ticketCode, qrCode: res.data.qrCode });
      setEvent((e) => (e ? { ...e, seats_booked: e.seats_booked + 1 } : e));
    } catch (err) {
      setError(err.response?.data?.error || 'Booking failed. Please log in first.');
    } finally {
      setBooking(false);
    }
  }

  if (error && !event) {
    return <p className="p-6 text-red-600">{error}</p>;
  }
  if (!event) {
    return <Spinner label="Loading event…" />;
  }

  const seatsLeft = event.capacity - event.seats_booked;
  const isFull = seatsLeft <= 0;

  return (
    <div className="p-4 sm:p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-semibold">{event.title}</h1>
      <p className="text-sm text-gray-500 mt-1">{event.location}</p>
      <p className="text-sm text-gray-500">{new Date(event.start_time).toLocaleString()}</p>
      {event.description && <p className="mt-3 text-gray-700">{event.description}</p>}

      <p className="mt-3 text-sm">
        {isFull ? (
          <span className="text-red-600 font-medium">Fully booked</span>
        ) : (
          <span className="text-gray-600">{seatsLeft} seat(s) left of {event.capacity}</span>
        )}
      </p>

      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}

      {ticket ? (
        <div className="mt-5">
          <p className="text-sm text-emerald-700 font-medium mb-2">You're booked for this event.</p>
          <QrTicket qrCode={ticket.qrCode} ticketCode={ticket.ticketCode} />
        </div>
      ) : (
        <button
          onClick={handleBook}
          disabled={isFull || booking}
          className="mt-5 bg-emerald-700 text-white rounded py-2 px-4 disabled:opacity-60"
        >
          {booking ? 'Booking…' : isFull ? 'Fully booked' : 'Book this event'}
        </button>
      )}
    </div>
  );
}
