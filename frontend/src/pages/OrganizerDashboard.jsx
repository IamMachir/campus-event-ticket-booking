import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../api/client';
import Spinner from '../components/Spinner';

export default function OrganizerDashboard() {
  const [stats, setStats] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/events/organizer/stats')
      .then((res) => setStats(res.data))
      .catch(() =>
        setError('Could not load your event stats. Make sure you are logged in as an organizer.')
      )
      .finally(() => setLoading(false));
  }, []);

  const chartData = stats.map((s) => ({
    name: s.title.length > 18 ? `${s.title.slice(0, 18)}…` : s.title,
    Booked: s.seats_booked,
    'Checked In': s.checked_in_count,
    Remaining: Math.max(s.capacity - s.seats_booked, 0),
  }));

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-semibold mb-1">Organizer Dashboard</h1>
      <p className="text-sm text-gray-500 mb-4">Bookings and check-in activity across your events.</p>

      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

      {loading ? (
        <Spinner label="Loading stats…" />
      ) : stats.length === 0 && !error ? (
        <p className="text-gray-400 text-center py-6">You haven't created any events yet.</p>
      ) : (
        <>
          <div className="h-72 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={60} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Checked In" stackId="a" fill="#059669" />
                <Bar dataKey="Booked" stackId="b" fill="#0ea5e9" />
                <Bar dataKey="Remaining" stackId="b" fill="#e5e7eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <table className="w-full text-sm border">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2 border">Event</th>
                <th className="p-2 border">Capacity</th>
                <th className="p-2 border">Booked</th>
                <th className="p-2 border">Checked In</th>
                <th className="p-2 border">Check-In Rate</th>
                <th className="p-2 border">Cancelled</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((s) => {
                const rate = s.seats_booked > 0 ? Math.round((s.checked_in_count / s.seats_booked) * 100) : 0;
                return (
                  <tr key={s.id}>
                    <td className="p-2 border">{s.title}</td>
                    <td className="p-2 border">{s.capacity}</td>
                    <td className="p-2 border">{s.seats_booked}</td>
                    <td className="p-2 border">{s.checked_in_count}</td>
                    <td className="p-2 border">{rate}%</td>
                    <td className="p-2 border">{s.cancelled_count}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
