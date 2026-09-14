import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Calendar, XCircle, ArrowRight } from 'lucide-react';
import api from '../api/client';
import Spinner from '../components/Spinner';

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  function loadBookings() {
    api.get('/bookings/me').then((res) => setBookings(res.data)).catch(() => setError('Please log in to view your bookings.')).finally(() => setLoading(false));
  }

  useEffect(() => { loadBookings(); }, []);

  async function handleCancel(id) {
    try { await api.post(`/bookings/${id}/cancel`); loadBookings(); }
    catch (err) { setError(err.response?.data?.error || 'Failed to cancel booking.'); }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
      <h1 className="font-display font-bold text-3xl text-slate-100 mb-2">My Bookings</h1>
      <p className="text-slate-400 mb-8">Manage your event tickets</p>

      {error && <div className="glass-card p-4 border-red-400/30 mb-4"><p className="text-red-400 text-sm">{error}</p></div>}

      {loading ? <Spinner label="Loading your bookings..." /> : bookings.length === 0 && !error ? (
        <div className="text-center py-20">
          <Ticket className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 mb-4">You haven't booked any events yet.</p>
          <Link to="/" className="inline-flex items-center gap-2 text-astu-400 hover:text-astu-300 transition-colors">Browse events <ArrowRight className="w-4 h-4" /></Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {bookings.map((b) => (
            <div key={b.id} className="glass-card overflow-hidden">
              <div className="flex">
                <div className="w-2 bg-gradient-to-b from-astu-500 to-astuGreen-500"></div>
                <div className="flex-1 p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <div>
                    <h3 className="font-display font-semibold text-lg text-slate-100">{b.title}</h3>
                    <p className="text-sm text-slate-400 mt-1">Ticket: <span className="font-mono text-astu-400">{b.ticket_code}</span></p>
                    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-2 capitalize ${
                      b.status === 'booked' ? 'bg-astuGreen-500/20 text-astuGreen-300' :
                      b.status === 'checked_in' ? 'bg-astu-500/20 text-astu-300' :
                      'bg-red-500/20 text-red-400'
                    }`}>{b.status}</span>
                  </div>
                  {b.status === 'booked' && (
                    <button onClick={() => handleCancel(b.id)}
                      className="text-sm text-red-400 border border-red-400/30 rounded-lg px-4 py-2 hover:bg-red-500/10 transition-all flex items-center gap-1.5 self-start">
                      <XCircle className="w-4 h-4" /> Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
