import { useEffect, useState } from 'react';
import api from '../api/client';

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/bookings/me')
      .then((res) => setBookings(res.data))
      .catch(() => setError('Please log in to view your bookings.'));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">My Bookings</h1>
      {error && <p className="text-red-600">{error}</p>}
      <ul className="space-y-2">
        {bookings.map((b) => (
          <li key={b.id} className="border rounded p-3">
            <p className="font-medium">{b.title}</p>
            <p className="text-sm text-gray-500">Ticket: {b.ticket_code}</p>
            <p className="text-sm text-gray-500">Status: {b.status}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
