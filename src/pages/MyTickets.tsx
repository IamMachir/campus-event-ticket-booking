import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Calendar, MapPin, Clock, ArrowRight, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { Booking } from '@/types';
import Loader from '@/components/Loader';
import Modal from '@/components/Modal';

export default function MyTickets() {
  const { session } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    loadBookings();
  }, [session]);

  async function loadBookings() {
    if (!session) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        event:events(*)
      `)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setBookings(data as Booking[]);
    }
    setLoading(false);
  }

  async function handleCancel() {
    if (!cancelTarget) return;
    setCancelling(true);

    await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', cancelTarget.id);

    await supabase
      .from('events')
      .update({ available_seats: cancelTarget.event!.available_seats + 1 })
      .eq('id', cancelTarget.event_id);

    setCancelling(false);
    setCancelTarget(null);
    loadBookings();
  }

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Ticket className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-300 mb-4">Sign in to view your tickets.</p>
        <Link to="/signin" className="text-astu-400 hover:text-astu-300 transition-colors">Sign in &rarr;</Link>
      </div>
    );
  }

  if (loading) return <Loader label="Loading your tickets..." />;

  const activeBookings = bookings.filter((b) => b.status === 'confirmed');
  const pastBookings = bookings.filter((b) => b.status !== 'confirmed');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
      <h1 className="font-display font-bold text-3xl text-slate-100 mb-2">My Tickets</h1>
      <p className="text-slate-400 mb-8">Manage your event bookings</p>

      {activeBookings.length === 0 && pastBookings.length === 0 ? (
        <div className="text-center py-20">
          <Ticket className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 mb-4">You haven't booked any tickets yet.</p>
          <Link to="/" className="inline-flex items-center gap-2 text-astu-400 hover:text-astu-300 transition-colors">
            Browse events <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <>
          {activeBookings.length > 0 && (
            <div className="mb-8">
              <h2 className="font-display font-semibold text-xl text-slate-200 mb-4">Active Bookings ({activeBookings.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeBookings.map((booking) => (
                  <TicketCard key={booking.id} booking={booking} onCancel={() => setCancelTarget(booking)} />
                ))}
              </div>
            </div>
          )}

          {pastBookings.length > 0 && (
            <div>
              <h2 className="font-display font-semibold text-xl text-slate-500 mb-4">Past Bookings ({pastBookings.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-60">
                {pastBookings.map((booking) => (
                  <TicketCard key={booking.id} booking={booking} onCancel={() => {}} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <Modal open={!!cancelTarget} onClose={() => setCancelTarget(null)} title="Cancel Booking" maxWidth="max-w-sm">
        <p className="text-slate-300 mb-6">Are you sure you want to cancel your booking for <span className="font-medium text-astu-400">{cancelTarget?.event?.title}</span>? This will free up your seat.</p>
        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="flex-1 bg-red-500/20 text-red-400 border border-red-400/30 px-4 py-2.5 rounded-xl font-medium hover:bg-red-500/30 transition-all disabled:opacity-50"
          >
            {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
          </button>
          <button onClick={() => setCancelTarget(null)} className="flex-1 border border-white/10 text-slate-300 px-4 py-2.5 rounded-xl font-medium hover:border-astu-400/40 transition-all">
            Keep Booking
          </button>
        </div>
      </Modal>
    </div>
  );
}

function TicketCard({ booking, onCancel }: { booking: Booking; onCancel: () => void }) {
  const event = booking.event;
  if (!event) return null;
  const eventDate = new Date(event.event_date);
  const isActive = booking.status === 'confirmed';

  return (
    <div className={`glass-card overflow-hidden ${!isActive ? 'opacity-70' : ''}`}>
      <div className="flex">
        <div className="w-2 bg-gradient-to-b from-astu-500 to-emerald2-500"></div>
        <div className="flex-1 p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h3 className="font-display font-semibold text-lg text-slate-100">{event.title}</h3>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
                booking.status === 'confirmed' ? 'bg-emerald2-500/20 text-emerald2-300' :
                booking.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                'bg-slate-500/20 text-slate-400'
              }`}>
                {booking.status}
              </span>
            </div>
            {isActive && (
              <button onClick={onCancel} className="text-slate-500 hover:text-red-400 transition-colors" title="Cancel booking">
                <XCircle className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="space-y-1.5 text-sm text-slate-400 mb-4">
            <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-astu-400/70" /> {eventDate.toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
            <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-astu-400/70" /> {eventDate.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}</div>
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-astu-400/70" /> {event.venue}</div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <div>
              <p className="text-xs text-slate-500">Booking Code</p>
              <p className="font-mono font-bold text-astu-400">{booking.booking_code}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Seat</p>
              <p className="font-bold text-emerald2-400 text-lg">{booking.seat_number}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
