import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, Users, Sparkles, ArrowDown, CheckCircle2, Search, SlidersHorizontal, RotateCcw } from 'lucide-react';
import api from '../api/client';
import Spinner from '../components/Spinner';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 0 });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [bookedEventIds, setBookedEventIds] = useState(() => new Set());

  useEffect(() => {
    api.get('/events/categories')
      .then((res) => setCategories(res.data))
      .catch(() => setError('Could not load event categories.'));
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    api
      .get('/events', {
        params: { search: search || undefined, category: category || undefined, page: pagination.page, limit: pagination.limit },
        signal: controller.signal,
      })
      .then((res) => {
        setEvents(res.data.events);
        setPagination(res.data.pagination);
      })
      .catch((err) => {
        if (err.code !== 'ERR_CANCELED' && err.name !== 'CanceledError') {
          setError('Could not load events. Please try again.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [search, category, pagination.page]);

  useEffect(() => {
    if (!localStorage.getItem('token')) return;
    api.get('/bookings/me')
      .then((res) => setBookedEventIds(new Set(
        res.data.filter((booking) => booking.status !== 'cancelled').map((booking) => booking.event_id),
      )))
      .catch(() => {});
  }, []);

  function scrollToUpcoming() {
    document.getElementById('upcoming-events')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function submitSearch(e) {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPagination((current) => ({ ...current, page: 1 }));
  }

  function selectCategory(value) {
    setCategory(value);
    setPagination((current) => ({ ...current, page: 1 }));
  }

  function clearFilters() {
    setSearchInput('');
    setSearch('');
    setCategory('');
    setPagination((current) => ({ ...current, page: 1 }));
  }

  const hasFilters = Boolean(search || category);

  return (
    <div>
      <section className="relative pt-20 pb-12 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30"></div>
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-astu-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-32 right-1/4 w-96 h-96 bg-astuGreen-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-astu-500/10 border border-astu-400/20 text-astu-300 text-sm mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            <span>Adama Science and Technology University</span>
          </div>
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-slate-100 mb-4 animate-slide-up">
            Discover & Book <span className="text-gradient glow-text">Campus Events</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Browse upcoming events, reserve your seat, and get your digital ticket with QR code for check-in.
          </p>
          <button type="button" onClick={scrollToUpcoming} className="mt-8 inline-flex items-center gap-2 rounded-full border border-astu-400/30 px-5 py-2.5 text-sm font-medium text-astu-300 hover:bg-astu-500/10 transition-colors">
            Explore upcoming events <ArrowDown className="w-4 h-4" />
          </button>
        </div>
      </section>

      <section id="upcoming-events" className="scroll-mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
          <div>
            <h2 className="font-display font-bold text-2xl text-slate-100">
              Upcoming <span className="text-gradient">Events</span>
            </h2>
            {!loading && !error && (
              <p className="text-sm text-slate-500 mt-1">
                {pagination.total} {pagination.total === 1 ? 'event' : 'events'} found
                {search ? ` for "${search}"` : ''}
              </p>
            )}
          </div>
          <form onSubmit={submitSearch} className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto" role="search">
            <label className="relative flex-1 lg:w-96">
              <span className="sr-only">Search events</span>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by name, organizer, category, or location"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:border-astu-400/40 focus:outline-none transition-colors"
              />
            </label>
            <button type="submit" disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-astu-500/15 border border-astu-400/30 px-4 py-2.5 text-sm font-medium text-astu-300 hover:bg-astu-500/25 transition-colors disabled:opacity-50">
              <Search className="w-4 h-4" /> Search
            </button>
          </form>
        </div>

        {error && (
          <div className="glass-card p-6 border-red-400/30 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <label className="flex items-center gap-2 text-sm text-slate-400">
            <SlidersHorizontal className="w-4 h-4 text-astu-400" />
            <span>Category</span>
            <select
              value={category}
              onChange={(e) => selectCategory(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-astu-400/40 focus:outline-none"
            >
              <option value="">All Categories</option>
              {categories.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
            </select>
          </label>
          {hasFilters && (
            <button type="button" onClick={clearFilters} className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-astu-300 transition-colors">
              <RotateCcw className="w-3.5 h-3.5" /> Clear filters
            </button>
          )}
        </div>

        {loading ? (
          <Spinner label={hasFilters ? 'Searching events...' : 'Loading events...'} />
        ) : events.length === 0 && !error ? (
          <div className="text-center py-20">
            <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-300 font-medium">{hasFilters ? 'No events found.' : 'No events yet.'}</p>
            <p className="text-slate-500 text-sm mt-2">{hasFilters ? 'Try a different search term or category.' : 'Check back soon.'}</p>
            {hasFilters && <button type="button" onClick={clearFilters} className="mt-4 text-sm text-astu-400 hover:text-astu-300">Clear filters</button>}
          </div>
        ) : (
          <>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event, i) => {
              const seatsLeft = event.capacity - event.seats_booked;
              const isFull = seatsLeft <= 0;
              const eventDate = new Date(event.start_time);
              return (
                <Link
                  key={event.id}
                  to={`/events/${event.id}`}
                  className="group block animate-slide-up"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="glass-card overflow-hidden h-full flex flex-col">
                    <div className="relative h-40 bg-gradient-to-br from-astu-800 to-astuGreen-800 flex items-center justify-center">
                      <Calendar className="w-12 h-12 text-astu-400/30" />
                      <div className="absolute top-3 left-3 flex flex-col items-center bg-slate-950/80 backdrop-blur-md rounded-lg px-3 py-2 border border-white/10">
                        <span className="text-2xl font-bold text-astu-400 leading-none">{eventDate.getDate()}</span>
                        <span className="text-xs text-slate-300 uppercase">{eventDate.toLocaleDateString('en', { month: 'short' })}</span>
                      </div>
                      {isFull && (
                        <div className="absolute top-3 right-3">
                          <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-400/30">SOLD OUT</span>
                        </div>
                      )}
                      {bookedEventIds.has(event.id) && (
                        <div className="absolute top-3 right-3">
                          <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-astuGreen-500/20 text-astuGreen-300 border border-astuGreen-400/30">
                            <CheckCircle2 className="w-3 h-3" /> BOOKED
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                       <div className="flex items-start justify-between gap-3">
                         <h3 className="font-display font-semibold text-lg text-slate-100 group-hover:text-astu-400 transition-colors">{event.title}</h3>
                         {event.category_name && <span className="shrink-0 text-[11px] px-2 py-1 rounded-full bg-astu-500/10 text-astu-300 border border-astu-400/20">{event.category_name}</span>}
                       </div>
                      <div className="mt-3 space-y-2 flex-1">
                         <div className="flex items-center gap-2 text-sm text-slate-400"><MapPin className="w-4 h-4 text-astu-400/70" /> {event.location || 'Location to be announced'}</div>
                        <div className="flex items-center gap-2 text-sm text-slate-400"><Clock className="w-4 h-4 text-astu-400/70" /> {eventDate.toLocaleString()}</div>
                        <div className="flex items-center gap-2 text-sm text-slate-400"><Users className="w-4 h-4 text-astu-400/70" />
                          <span className={isFull ? 'text-red-400' : 'text-astuGreen-400'}>{isFull ? 'Fully booked' : `${seatsLeft} seats left`}</span>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                        <span className="text-sm text-slate-500">{event.capacity} total seats</span>
                        <span className="text-sm font-medium text-astu-400 group-hover:translate-x-1 transition-transform">View &rarr;</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                type="button"
                disabled={pagination.page <= 1 || loading}
                onClick={() => setPagination((current) => ({ ...current, page: current.page - 1 }))}
                className="px-4 py-2 rounded-lg border border-white/10 text-sm text-slate-300 hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-slate-500">Page {pagination.page} of {pagination.totalPages}</span>
              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages || loading}
                onClick={() => setPagination((current) => ({ ...current, page: current.page + 1 }))}
                className="px-4 py-2 rounded-lg border border-white/10 text-sm text-slate-300 hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
          </>
        )}
      </section>
    </div>
  );
}
