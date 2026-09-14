import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, Users, Sparkles, ArrowRight } from 'lucide-react';
import api from '../api/client';
import Spinner from '../components/Spinner';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/events')
      .then((res) => setEvents(res.data))
      .catch(() => setError('Could not load events. Is the backend running?'))
      .finally(() => setLoading(false));
  }, []);

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
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <h2 className="font-display font-bold text-2xl text-slate-100 mb-6">
          Upcoming <span className="text-gradient">Events</span>
        </h2>

        {error && (
          <div className="glass-card p-6 border-red-400/30 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {loading ? (
          <Spinner label="Loading events..." />
        ) : events.length === 0 && !error ? (
          <div className="text-center py-20">
            <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No events yet. Check back soon.</p>
          </div>
        ) : (
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
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="font-display font-semibold text-lg text-slate-100 group-hover:text-astu-400 transition-colors">{event.title}</h3>
                      <div className="mt-3 space-y-2 flex-1">
                        <div className="flex items-center gap-2 text-sm text-slate-400"><MapPin className="w-4 h-4 text-astu-400/70" /> {event.location}</div>
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
        )}
      </section>
    </div>
  );
}
