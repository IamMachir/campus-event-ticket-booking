import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, ArrowLeft, Ticket, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../api/client';
import QrTicket from '../components/QrTicket';
import Spinner from '../components/Spinner';

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    api.get(`/events/${id}`).then((res) => setEvent(res.data)).catch(() => setError('Could not load this event.'));
  }, [id]);

  useEffect(() => {
    if (!localStorage.getItem('token')) return;
    api.get('/bookings/me').then((res) => {
      const existing = res.data.find((b) => b.event_id === Number(id) && b.status !== 'cancelled');
      if (existing) setTicket({ ticketCode: existing.ticket_code, qrCode: existing.qr_code });
    }).catch(() => {});
  }, [id]);

  async function handleBook() {
    setError('');
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    setBooking(true);
    try {
      const res = await api.post('/bookings', { eventId: Number(id) });
      setTicket({ ticketCode: res.data.ticketCode, qrCode: res.data.qrCode });
      setEvent((e) => (e ? { ...e, seats_booked: e.seats_booked + 1 } : e));
    } catch (err) {
      if (err.response && err.response.status === 401) {
        navigate('/login');
        return;
      }
      setError(err.response?.data?.error || 'Booking failed. Please try again.');
    } finally {
      setBooking(false);
    }
  }

  if (error && !event) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center pt-24">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-slate-300 mb-4">{error}</p>
        <Link to="/" className="text-astu-400 hover:text-astu-300 transition-colors">Back to events</Link>
      </div>
    );
  }
  if (!event) return <div className="pt-20"><Spinner label="Loading event..." /></div>;

  const seatsLeft = event.capacity - event.seats_booked;
  const isFull = seatsLeft <= 0;
  const eventDate = new Date(event.start_time);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
      <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-astu-400 transition-colors mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to events
      </Link>

      <div className="glass-card p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center bg-slate-950/80 rounded-xl px-4 py-3 border border-white/10 flex-shrink-0">
            <span className="text-3xl font-bold text-astu-400 leading-none">{eventDate.getDate()}</span>
            <span className="text-sm text-slate-300 uppercase">{eventDate.toLocaleDateString('en', { month: 'short' })}</span>
            <span className="text-xs text-slate-500">{eventDate.getFullYear()}</span>
          </div>
          <div className="flex-1">
            <h1 className="font-display font-bold text-2xl text-slate-100 mb-2">{event.title}</h1>
            {event.description && <p className="text-slate-400 leading-relaxed">{event.description}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
          <div className="flex items-center gap-2 text-slate-300"><Clock className="w-5 h-5 text-astu-400" /> {eventDate.toLocaleString()}</div>
          <div className="flex items-center gap-2 text-slate-300"><MapPin className="w-5 h-5 text-astu-400" /> {event.location}</div>
          <div className="flex items-center gap-2 text-slate-300"><Users className="w-5 h-5 text-astu-400" />
            <span className={isFull ? 'text-red-400' : 'text-astuGreen-400'}>
              {isFull ? 'Fully booked' : `${seatsLeft} of ${event.capacity} seats left`}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="glass-card p-4 border-red-400/30 mb-4">
          <p className="text-red-400 text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {error}</p>
        </div>
      )}

      {ticket ? (
        <div>
          <div className="flex items-center gap-2 text-astuGreen-400 mb-4">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium">You're booked for this event!</span>
          </div>
          <QrTicket qrCode={ticket.qrCode} ticketCode={ticket.ticketCode} eventTitle={event.title} />
        </div>
      ) : (
        <button
          onClick={handleBook}
          disabled={isFull || booking}
          className="glow-btn w-full bg-gradient-to-r from-astu-500 to-astuGreen-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-astu-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {booking ? 'Booking...' : isFull ? 'Fully Booked' : <><Ticket className="w-5 h-5" /> Book This Event</>}
        </button>
      )}
    </div>
  );
}
