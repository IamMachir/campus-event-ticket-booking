import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { BarChart3, TrendingUp, Users, CheckCircle2, Calendar, MapPin, Clock, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import Spinner from '../components/Spinner';

export default function OrganizerDashboard() {
  const [stats, setStats] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [myEvents, setMyEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    Promise.all([
      api.get('/events/organizer/stats').then((res) => setStats(res.data)),
      api.get('/events/organizer/mine').then((res) => setMyEvents(res.data)),
    ]).catch(() => setError('Could not load your organizer data.'))
      .finally(() => setLoading(false));
  }, []);

  const chartData = stats.map((s) => ({
    name: s.title.length > 18 ? `${s.title.slice(0, 18)}...` : s.title,
    Booked: s.seats_booked,
    'Checked In': s.checked_in_count,
    Remaining: Math.max(s.capacity - s.seats_booked, 0),
  }));

  const totalBooked = stats.reduce((sum, s) => sum + s.seats_booked, 0);
  const totalCheckedIn = stats.reduce((sum, s) => sum + s.checked_in_count, 0);
  const totalCapacity = stats.reduce((sum, s) => sum + s.capacity, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
      <h1 className="font-display font-bold text-3xl text-slate-100 mb-2">Organizer Dashboard</h1>
      <p className="text-slate-400 mb-8">Bookings and check-in activity across your events</p>

      {error && <div className="glass-card p-4 border-red-400/30 mb-4"><p className="text-red-400 text-sm">{error}</p></div>}

      <div className="flex items-center gap-2 border-b border-white/10 mb-6 overflow-x-auto">
        {[
          ['overview', 'Overview', BarChart3],
          ['events', 'My Events', Calendar],
        ].map(([key, label, Icon]) => (
          <button key={key} type="button" onClick={() => setActiveTab(key)}
            className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${activeTab === key ? 'border-astu-400 text-astu-300' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {loading ? <Spinner label="Loading organizer data..." /> : activeTab === 'events' ? (
        myEvents.length === 0 ? (
          <div className="text-center py-20">
            <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 mb-4">You haven't created any events yet.</p>
            <Link to="/events/new" className="inline-flex items-center gap-2 text-astu-400 hover:text-astu-300"><Plus className="w-4 h-4" /> Create your first event</Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {myEvents.map((event) => (
              <Link key={event.id} to={`/events/${event.id}`} className="glass-card p-5 hover:border-astu-400/30 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-astu-500/10 flex items-center justify-center shrink-0"><Calendar className="w-5 h-5 text-astu-400" /></div>
                  <div className="min-w-0">
                    <h3 className="font-display font-semibold text-slate-100 truncate">{event.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(event.start_time).toLocaleString()}</p>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.location || 'Location to be announced'}</p>
                    <p className="text-xs text-astuGreen-300 mt-3">{event.seats_booked} of {event.capacity} seats booked</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )
      ) : stats.length === 0 && !error ? (
        <div className="text-center py-20">
          <BarChart3 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">You haven't created any events yet.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Total Capacity', value: totalCapacity, icon: Users, color: 'text-astu-400' },
              { label: 'Total Booked', value: totalBooked, icon: TrendingUp, color: 'text-astuGreen-400' },
              { label: 'Checked In', value: totalCheckedIn, icon: CheckCircle2, color: 'text-astu-400' },
            ].map((stat, i) => (
              <div key={i} className="glass-card p-5">
                <div className="flex items-center gap-3">
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  <div><p className="text-2xl font-bold text-slate-100">{stat.value}</p><p className="text-sm text-slate-400">{stat.label}</p></div>
                </div>
              </div>
            ))}
          </div>

          <div className="glass-card p-6 mb-6">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} interval={0} angle={-15} textAnchor="end" height={60} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="Checked In" stackId="a" fill="#00cc5f" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Booked" stackId="b" fill="#0099e6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Remaining" stackId="b" fill="#334155" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-slate-400">
                    <th className="px-4 py-3 font-medium">Event</th>
                    <th className="px-4 py-3 font-medium">Capacity</th>
                    <th className="px-4 py-3 font-medium">Booked</th>
                    <th className="px-4 py-3 font-medium">Checked In</th>
                    <th className="px-4 py-3 font-medium">Rate</th>
                    <th className="px-4 py-3 font-medium">Cancelled</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.map((s) => {
                    const rate = s.seats_booked > 0 ? Math.round((s.checked_in_count / s.seats_booked) * 100) : 0;
                    return (
                      <tr key={s.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 text-slate-200 font-medium">{s.title}</td>
                        <td className="px-4 py-3 text-slate-400">{s.capacity}</td>
                        <td className="px-4 py-3 text-astuGreen-400">{s.seats_booked}</td>
                        <td className="px-4 py-3 text-astu-400">{s.checked_in_count}</td>
                        <td className="px-4 py-3 text-slate-300">{rate}%</td>
                        <td className="px-4 py-3 text-red-400">{s.cancelled_count}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
