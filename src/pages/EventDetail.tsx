import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar, Clock, MapPin, Users, Ticket, ArrowLeft,
  CheckCircle2, AlertCircle, Share2, Info
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { Event } from '@/types';
import Modal from '@/components/Modal';
import Loader from '@/components/Loader';

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session, profile } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingModal, setBookingModal] = useState(false);
  const [seatNumber, setSeatNumber] = useState(1);
  const [booking, setBooking] = useState<{ loading: boolean; error: string | null; success: string | null }>({
    loading: false, error: null, success: null,
  });
  const [existingBooking, setExistingBooking] = useState<string | null>(null);

  useEffect(() => {
    loadEvent();
  }, [id]);

  useEffect(() => {
    if (session && id) {
      checkExistingBooking();
    }
  }, [session, id]);

  async function loadEvent() {
    setLoading(true);
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id!)
      .maybeSingle();

    if (error) {
      setError(error.message);
    } else if (!data) {
      setError('Event not found.');
    } else {
      setEvent(data as Event);
    }
    setLoading(false);
  }

  async function checkExistingBooking() {
    const { data } = await supabase
      .from('bookings')
      .select('id, booking_code')
      .eq('event_id', id!)
      .eq('user_id', session!.user.id)
      .eq('status', 'confirmed')
      .maybeSingle();

    if (data) {
      setExistingBooking(data.booking_code);
    }
  }

  async function handleBooking() {
    if (!session) {
      navigate('/signin');
      return;
    }

    setBooking({ loading: true, error: null, success: null });

    // Check seat availability
    const { data: seatCheck, error: seatError } = await supabase
      .from('bookings')
      .select('id')
      .eq('event_id', id!)
      .eq('seat_number', seatNumber)
      .eq('status', 'confirmed')
      .maybeSingle();

    if (seatError) {
      setBooking({ loading: false, error: seatError.message, success: null });
      return;
    }

    if (seatCheck) {
      setBooking({ loading: false, error: 'That seat is already taken. Please choose another.', success: null });
      return;
    }

    // Insert booking
    const { data: bookingData, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        event_id: id!,
        user_id: session.user.id,
        seat_number: seatNumber,
        status: 'confirmed',
      })
      .select('booking_code')
      .single();

    if (bookingError) {
      setBooking({ loading: false, error: bookingError.message, success: null });
      return;
    }

    // Decrement available seats
    await supabase
      .from('events')
      .update({ available_seats: event!.available_seats - 1 })
      .eq('id', id!);

    setBooking({ loading: false, error: null, success: bookingData.booking_code });
    setExistingBooking(bookingData.booking_code);
    setEvent({ ...event!, available_seats: event!.available_seats - 1 });
  }

  if (loading) return <Loader label="Loading event details..." />;

  if (error || !event) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-slate-300 mb-4">{error ?? 'Event not found.'}</p>
        <Link to="/" className="text-astu-400 hover:text-astu-300 transition-colors">Back to events</Link>
      </div>
    );
  }

  const eventDate = new Date(event.event_date);
  const isFull = event.available_seats <= 0;
  const isCancelled = event.status === 'cancelled';
  const canBook = !isFull && !isCancelled && event.status === 'upcoming';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
      <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-astu-400 transition-colors mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to events
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image */}
        <div className="relative rounded-2xl overflow-hidden h-72 lg:h-96 glass-card">
          {event.image_url ? (
            <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-astu-800 to-emerald2-800 flex items-center justify-center">
              <Calendar className="w-16 h-16 text-astu-400/50" />
            </div>
          )}
          <div className="absolute top-4 left-4 flex flex-col items-center bg-slate-950/80 backdrop-blur-md rounded-lg px-4 py-3 border border-white/10">
            <span className="text-3xl font-bold text-astu-400 leading-none">{eventDate.getDate()}</span>
            <span className="text-sm text-slate-300 uppercase">{eventDate.toLocaleDateString('en', { month: 'short' })}</span>
            <span className="text-xs text-slate-500">{eventDate.getFullYear()}</span>
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-medium px-3 py-1 rounded-full bg-astu-500/20 text-astu-300 border border-astu-400/30 capitalize">
              {event.category}
            </span>
            <span className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${
              event.status === 'upcoming' ? 'bg-emerald2-500/20 text-emerald2-300 border border-emerald2-400/30' :
              event.status === 'cancelled' ? 'bg-red-500/20 text-red-400 border border-red-400/30' :
              'bg-slate-500/20 text-slate-400 border border-slate-400/30'
            }`}>
              {event.status}
            </span>
          </div>

          <h1 className="font-display font-bold text-3xl text-slate-100 mb-4">{event.title}</h1>
          <p className="text-slate-400 leading-relaxed mb-6">{event.description}</p>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-slate-300">
              <Clock className="w-5 h-5 text-astu-400" />
              <span>{eventDate.toLocaleDateString('en', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {eventDate.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <MapPin className="w-5 h-5 text-astu-400" />
              <span>{event.venue}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <Users className="w-5 h-5 text-astu-400" />
              <span>{event.available_seats} of {event.capacity} seats available</span>
            </div>
            {event.organizer && (
              <div className="flex items-center gap-3 text-slate-300">
                <Info className="w-5 h-5 text-astu-400" />
                <span>Organized by {event.organizer}</span>
              </div>
            )}
          </div>

          {/* Booking Actions */}
          {existingBooking && (
            <div className="glass-card p-4 mb-4 border-emerald2-400/30">
              <div className="flex items-center gap-2 text-emerald2-400 mb-2">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">You have a ticket!</span>
              </div>
              <p className="text-slate-400 text-sm">Booking code: <span className="font-mono text-astu-400 font-bold">{existingBooking}</span></p>
              <Link to="/my-tickets" className="text-sm text-astu-400 hover:text-astu-300 transition-colors mt-2 inline-block">
                View my tickets &rarr;
              </Link>
            </div>
          )}

          {!existingBooking && canBook && (
            <button
              onClick={() => session ? setBookingModal(true) : navigate('/signin')}
              className="glow-btn bg-gradient-to-r from-astu-500 to-emerald2-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-astu-500/30 transition-all flex items-center gap-2 justify-center"
            >
              <Ticket className="w-5 h-5" /> Book Your Seat
            </button>
          )}

          {!existingBooking && isFull && !isCancelled && (
            <div className="glass-card p-4 border-red-400/30">
              <p className="text-red-400 font-medium flex items-center gap-2">
                <AlertCircle className="w-5 h-5" /> This event is sold out.
              </p>
            </div>
          )}

          {isCancelled && (
            <div className="glass-card p-4 border-red-400/30">
              <p className="text-red-400 font-medium flex items-center gap-2">
                <AlertCircle className="w-5 h-5" /> This event has been cancelled.
              </p>
            </div>
          )}

          <button
            onClick={() => { navigator.clipboard.writeText(window.location.href); }}
            className="mt-3 text-sm text-slate-400 hover:text-astu-400 transition-colors flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" /> Share event
          </button>
        </div>
      </div>

      {/* Booking Modal */}
      <Modal open={bookingModal} onClose={() => { setBookingModal(false); setBooking({ loading: false, error: null, success: null }); }} title="Book Your Seat" maxWidth="max-w-lg">
        {booking.success ? (
          <div className="text-center py-6">
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-emerald2-500/30 blur-2xl"></div>
              <CheckCircle2 className="relative w-16 h-16 text-emerald2-400 mx-auto" />
            </div>
            <h3 className="font-display font-bold text-xl text-slate-100 mb-2">Booking Confirmed!</h3>
            <p className="text-slate-400 mb-4">Your seat has been reserved.</p>
            <div className="glass-card p-4 mb-4">
              <p className="text-sm text-slate-400 mb-1">Booking Code</p>
              <p className="font-mono text-2xl font-bold text-astu-400 glow-text">{booking.success}</p>
              <p className="text-sm text-slate-400 mt-2">Seat Number: <span className="text-emerald2-400 font-bold">{seatNumber}</span></p>
            </div>
            <div className="flex gap-3">
              <Link to="/my-tickets" className="flex-1 bg-gradient-to-r from-astu-500 to-emerald2-500 text-white px-4 py-2.5 rounded-xl font-medium text-center hover:shadow-lg hover:shadow-astu-500/30 transition-all">
                View My Tickets
              </Link>
              <button onClick={() => { setBookingModal(false); setBooking({ loading: false, error: null, success: null }); }} className="border border-white/10 text-slate-300 px-4 py-2.5 rounded-xl font-medium hover:border-astu-400/40 transition-all">
                Close
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <div className="glass-card p-3 mb-4 flex items-center gap-3">
                <Calendar className="w-5 h-5 text-astu-400 flex-shrink-0" />
                <div>
                  <p className="font-medium text-slate-200">{event.title}</p>
                  <p className="text-sm text-slate-400">{eventDate.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })} • {event.venue}</p>
                </div>
              </div>

              <label className="block text-sm font-medium text-slate-300 mb-2">Choose your seat number</label>
              <div className="grid grid-cols-5 sm:grid-cols-8 gap-2 max-h-48 overflow-y-auto scrollbar-hide p-1">
                {Array.from({ length: event.capacity }, (_, i) => i + 1).map((seat) => (
                  <button
                    key={seat}
                    onClick={() => setSeatNumber(seat)}
                    className={`aspect-square rounded-lg text-sm font-medium transition-all ${
                      seatNumber === seat
                        ? 'bg-gradient-to-r from-astu-500 to-emerald2-500 text-white shadow-lg shadow-astu-500/30 scale-110'
                        : 'bg-white/5 border border-white/10 text-slate-400 hover:border-astu-400/30 hover:text-astu-400'
                    }`}
                  >
                    {seat}
                  </button>
                ))}
              </div>
              <p className="text-sm text-slate-400 mt-2">Selected seat: <span className="text-astu-400 font-bold">{seatNumber}</span></p>
            </div>

            {booking.error && (
              <div className="glass-card p-3 border-red-400/30 mb-4">
                <p className="text-red-400 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> {booking.error}
                </p>
              </div>
            )}

            <button
              onClick={handleBooking}
              disabled={booking.loading}
              className="w-full glow-btn bg-gradient-to-r from-astu-500 to-emerald2-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-astu-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {booking.loading ? 'Confirming...' : <>Confirm Booking <Ticket className="w-4 h-4" /></>}
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
