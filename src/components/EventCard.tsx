import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import type { Event } from '@/types';

const categoryColors: Record<string, string> = {
  academic: 'bg-astu-500/20 text-astu-300 border-astu-400/30',
  cultural: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
  sports: 'bg-orange-500/20 text-orange-300 border-orange-400/30',
  social: 'bg-pink-500/20 text-pink-300 border-pink-400/30',
  workshop: 'bg-emerald2-500/20 text-emerald2-300 border-emerald2-400/30',
  general: 'bg-slate-500/20 text-slate-300 border-slate-400/30',
};

const statusColors: Record<string, string> = {
  upcoming: 'text-astu-400',
  ongoing: 'text-emerald2-400',
  completed: 'text-slate-500',
  cancelled: 'text-red-400',
};

export default function EventCard({ event }: { event: Event }) {
  const eventDate = new Date(event.event_date);
  const day = eventDate.getDate();
  const month = eventDate.toLocaleDateString('en', { month: 'short' });
  const year = eventDate.getFullYear();
  const time = eventDate.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });
  const seatsLeft = event.available_seats;
  const isFull = seatsLeft <= 0;
  const isCancelled = event.status === 'cancelled';

  return (
    <Link to={`/events/${event.id}`} className="group block animate-slide-up">
      <div className="glass-card overflow-hidden h-full flex flex-col">
        <div className="relative h-48 overflow-hidden">
          {event.image_url ? (
            <img
              src={event.image_url}
              alt={event.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-astu-800 to-emerald2-800 flex items-center justify-center">
              <Calendar className="w-12 h-12 text-astu-400/50" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>
          <div className="absolute top-3 left-3 flex flex-col items-center bg-slate-950/80 backdrop-blur-md rounded-lg px-3 py-2 border border-white/10">
            <span className="text-2xl font-bold text-astu-400 leading-none">{day}</span>
            <span className="text-xs text-slate-300 uppercase">{month}</span>
            <span className="text-xs text-slate-500">{year}</span>
          </div>
          <div className="absolute top-3 right-3">
            <span className={`text-xs font-medium px-3 py-1 rounded-full border ${categoryColors[event.category] ?? categoryColors.general}`}>
              {event.category}
            </span>
          </div>
          {isFull && !isCancelled && (
            <div className="absolute bottom-3 right-3">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-400/30">
                SOLD OUT
              </span>
            </div>
          )}
          {isCancelled && (
            <div className="absolute bottom-3 right-3">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-400/30">
                CANCELLED
              </span>
            </div>
          )}
        </div>

        <div className="p-5 flex-1 flex flex-col">
          <h3 className="font-display font-semibold text-lg text-slate-100 group-hover:text-astu-400 transition-colors line-clamp-2">
            {event.title}
          </h3>
          <p className="text-sm text-slate-400 mt-2 line-clamp-2 flex-1">{event.description}</p>

          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Clock className="w-4 h-4 text-astu-400/70" />
              <span>{time}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <MapPin className="w-4 h-4 text-astu-400/70" />
              <span className="truncate">{event.venue}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Users className="w-4 h-4 text-astu-400/70" />
              <span className={isFull ? 'text-red-400' : 'text-emerald2-400'}>
                {isFull ? 'No seats left' : `${seatsLeft} seats available`}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
            <span className={`text-sm font-medium ${statusColors[event.status] ?? 'text-slate-400'}`}>
              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
            </span>
            <span className="text-sm font-medium text-astu-400 group-hover:translate-x-1 transition-transform">
              View details &rarr;
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
