import { useEffect, useState } from 'react';
import { Heart, Search, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import EventCard from '../components/EventCard';
import Spinner from '../components/Spinner';

export default function SavedEvents() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingId, setPendingId] = useState(null);

  useEffect(() => {
    api.get('/favorites/events')
      .then((res) => setEvents(res.data))
      .catch(() => setError('Could not load your saved events.'))
      .finally(() => setLoading(false));
  }, []);

  async function removeSaved(eventId) {
    setPendingId(eventId);
    try {
      await api.delete('/favorites/' + eventId);
      setEvents((current) => current.filter((event) => event.id !== eventId));
    } catch (err) {
      setError(err.response?.data?.error || 'Could not remove this saved event.');
    } finally {
      setPendingId(null);
    }
  }

  const visibleEvents = events.filter((event) => {
    const query = search.trim().toLowerCase();
    return !query || [event.title, event.location, event.category_name].some((value) => value?.toLowerCase().includes(query));
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-slate-100">My Saved Events</h1>
          <p className="text-slate-400 mt-1">Keep interesting events close until you are ready to book.</p>
        </div>
        <label className="relative sm:w-72">
          <span className="sr-only">Search saved events</span>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search saved events" className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:border-astu-400/40 focus:outline-none" />
        </label>
      </div>

      {error && <div className="glass-card p-4 border-red-400/30 mb-5"><p className="text-red-300 text-sm">{error}</p></div>}
      {loading ? <Spinner label="Loading saved events..." /> : visibleEvents.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Heart className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-300 font-medium">{events.length === 0 ? "You haven't saved any events yet." : 'No saved events match your search.'}</p>
          {events.length === 0 && <p className="text-slate-500 text-sm mt-2 mb-5">Explore upcoming events and save the ones you like.</p>}
          {events.length === 0 && <Link to="/" className="inline-flex items-center gap-2 text-astu-400 hover:text-astu-300">Explore events <ArrowRight className="w-4 h-4" /></Link>}
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {visibleEvents.map((event, index) => <EventCard key={event.id} event={event} favorite favoritePending={pendingId === event.id} onToggleFavorite={removeSaved} index={index} />)}
        </div>
      )}
    </div>
  );
}