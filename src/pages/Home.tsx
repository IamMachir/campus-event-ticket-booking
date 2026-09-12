import { useEffect, useState } from 'react';
import { Calendar, Sparkles, ArrowRight, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Event, EventCategory } from '@/types';
import EventCard from '@/components/EventCard';
import Loader from '@/components/Loader';

const categories: { value: EventCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All Events' },
  { value: 'academic', label: 'Academic' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'sports', label: 'Sports' },
  { value: 'social', label: 'Social' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'general', label: 'General' },
];

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<EventCategory | 'all'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadEvents();
  }, [category, search]);

  async function loadEvents() {
    setLoading(true);
    setError(null);
    let query = supabase
      .from('events')
      .select('*')
      .eq('status', 'upcoming')
      .order('event_date', { ascending: true });

    if (category !== 'all') {
      query = query.eq('category', category);
    }

    if (search.trim()) {
      query = query.ilike('title', `%${search.trim()}%`);
    }

    const { data, error } = await query;

    if (error) {
      setError(error.message);
    } else {
      setEvents(data as Event[]);
    }
    setLoading(false);
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30"></div>
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-astu-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-32 right-1/4 w-96 h-96 bg-emerald2-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-astu-500/10 border border-astu-400/20 text-astu-300 text-sm mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            <span>Adama Science and Technology University</span>
          </div>

          <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-slate-100 mb-6 animate-slide-up">
            Discover & Book
            <br />
            <span className="text-gradient glow-text">Campus Events</span>
          </h1>

          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Browse upcoming events, reserve your seat in seconds, and never miss out on what's happening at ASTU.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <a href="#events" className="glow-btn bg-gradient-to-r from-astu-500 to-emerald2-500 text-white px-8 py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-astu-500/30 transition-all flex items-center gap-2">
              Browse Events <ArrowRight className="w-4 h-4" />
            </a>
            <a href="#stats" className="border border-white/10 text-slate-300 px-8 py-3 rounded-xl font-medium hover:border-astu-400/40 hover:text-astu-400 transition-all">
              View Stats
            </a>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Events', value: events.length || '—', icon: Calendar, color: 'text-astu-400' },
              { label: 'Categories', value: '6', icon: Sparkles, color: 'text-emerald2-400' },
              { label: 'Free Booking', value: '100%', icon: TrendingUp, color: 'text-astu-400' },
              { label: 'Seats Available', value: events.reduce((sum, e) => sum + e.available_seats, 0) || '—', icon: ArrowRight, color: 'text-emerald2-400' },
            ].map((stat, i) => (
              <div key={i} className="glass-card p-5 text-center animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
                <p className="text-2xl font-bold text-slate-100">{stat.value}</p>
                <p className="text-sm text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <h2 className="font-display font-bold text-2xl text-slate-100">
              Upcoming <span className="text-gradient">Events</span>
            </h2>
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:border-astu-400/40 focus:outline-none transition-colors w-full sm:w-64"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  category === cat.value
                    ? 'bg-gradient-to-r from-astu-500 to-emerald2-500 text-white shadow-lg shadow-astu-500/20'
                    : 'bg-white/5 border border-white/10 text-slate-400 hover:border-astu-400/30 hover:text-astu-400'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {loading ? (
            <Loader label="Loading events..." />
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-400 mb-2">Could not load events.</p>
              <p className="text-slate-500 text-sm">{error}</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-20">
              <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No events found. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event, i) => (
                <div key={event.id} className="animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                  <EventCard event={event} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
