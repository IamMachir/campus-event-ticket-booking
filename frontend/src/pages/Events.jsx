import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/events')
      .then((res) => setEvents(res.data))
      .catch(() => setError('Could not load events. Is the backend running?'));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Upcoming Campus Events</h1>
      {error && <p className="text-red-600">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
      </div>
    </div>
  );
}
