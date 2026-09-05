import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
    <div className="p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-semibold mb-4">Upcoming Campus Events</h1>
      {error && <p className="text-red-600">{error}</p>}
      {loading ? (
        <Spinner label="Loading events…" />
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Link
              key={event.id}
              to={`/events/${event.id}`}
              className="border rounded-lg p-4 shadow-sm hover:shadow-md transition"
            >
              <h2 className="font-semibold">{event.title}</h2>
              <p className="text-sm text-gray-600">{event.location}</p>
              <p className="text-sm text-gray-500">{new Date(event.start_time).toLocaleString()}</p>
            </Link>
          ))}
          {events.length === 0 && !error && (
            <p className="text-gray-400 col-span-full text-center py-6">No events yet. Check back soon.</p>
          )}
        </div>
      )}
    </div>
  );
}
