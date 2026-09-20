import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Calendar, XCircle, ArrowRight, Clock3, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../api/client';
import Spinner from '../components/Spinner';
import QrTicket from '../components/QrTicket';

function formatDateTime(value) {
  return new Date(value).toLocaleString('en', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  function loadBookings() {
    setLoading(true);
    api.get('/bookings/me')
      .then((res) => setBookings(res.data))
      .catch(() => setError('Please log in to view your bookings.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadBookings(); }, []);

  async function handleCancel(event, id) {
    event.stopPropagation();
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await api.post(`/bookings/${id}/cancel`);
      setExpandedId(null);
      loadBookings();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to cancel booking.');
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
      <h1 className="font-display font-bold text-3xl text-slate-100 mb-2">My Bookings</h1>
      <p className="text-slate-400 mb-8">Open a booking to view or download its QR ticket and code.</p>

      {error && <div className="glass-card p-4 border-red-400/30 mb-4"><p className="text-red-400 text-sm">{error}</p></div>}

      {loading ? <Spinner label="Loading your bookings..." /> : bookings.length === 0 && !error ? (
        <div className="text-center py-20">
          <Ticket className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 mb-4">You haven't booked any events yet.</p>
          <Link to="/" className="inline-flex items-center gap-2 text-astu-400 hover:text-astu-300 transition-colors">Browse events <ArrowRight className="w-4 h-4" /></Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => {
            const expanded = expandedId === booking.id;
            return (
              <div
                key={booking.id}
                role="button"
                tabIndex={0}
                aria-expanded={expanded}
                onClick={() => setExpandedId(expanded ? null : booking.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') setExpandedId(expanded ? null : booking.id);
                }}
                className="glass-card overflow-hidden cursor-pointer hover:border-astu-400/30 transition-colors"
              >
                <div className="flex">
                  <div className="w-2 bg-gradient-to-b from-astu-500 to-astuGreen-500"></div>
                  <div className="flex-1 p-5">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                      <div>
                        <h3 className="font-display font-semibold text-lg text-slate-100">{booking.title}</h3>
                        <p className="text-sm text-slate-400 mt-1">Ticket: <span className="font-mono text-astu-400">{booking.ticket_code}</span></p>
                        <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
                          <Clock3 className="w-3.5 h-3.5" /> Booked {formatDateTime(booking.booked_at)}
                        </p>
                        <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-2 capitalize ${
                          booking.status === 'booked' ? 'bg-astuGreen-500/20 text-astuGreen-300' :
                          booking.status === 'checked_in' ? 'bg-astu-500/20 text-astu-300' :
                          'bg-red-500/20 text-red-400'
                        }`}>{booking.status}</span>
                      </div>
                      <div className="flex items-center gap-2 self-start">
                        {booking.status === 'booked' && (
                          <button onClick={(event) => handleCancel(event, booking.id)}
                            className="text-sm text-red-400 border border-red-400/30 rounded-lg px-4 py-2 hover:bg-red-500/10 transition-all flex items-center gap-1.5">
                            <XCircle className="w-4 h-4" /> Cancel
                          </button>
                        )}
                        {expanded ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                      </div>
                    </div>
                    {expanded && (
                      <div className="mt-5 pt-5 border-t border-white/10" onClick={(event) => event.stopPropagation()}>
                        <QrTicket qrCode={booking.qr_code} ticketCode={booking.ticket_code} status={booking.status} eventTitle={booking.title} compact />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}