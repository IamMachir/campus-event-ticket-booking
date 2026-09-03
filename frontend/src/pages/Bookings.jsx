import { useEffect, useState } from 'react';
import api from '../api/client';

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');

  function loadBookings() {
    api
      .get('/bookings/me')
      .then((res) => setBookings(res.data))
      .catch(() => setError('Please log in to view your bookings.'));
  }

  useEffect(() => {
    loadBookings();
  }, []);

  async function handleCancel(id) {
    try {
      await api.post(`/bookings/${id}/cancel`);
      loadBookings();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to cancel booking.');
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">My Bookings</h1>
      {error && <p className="text-red-600">{error}</p>}
      <ul className="space-y-2">
        {bookings.map((b) => (
          <li key={b.id} className="border rounded p-3 flex justify-between items-start">
            <div>
              <p className="font-medium">{b.title}</p>
              <p className="text-sm text-gray-500">Ticket: {b.ticket_code}</p>
              <p className="text-sm text-gray-500">Status: {b.status}</p>
            </div>
            {b.status === 'booked' && (
              <button
                onClick={() => handleCancel(b.id)}
                className="text-sm text-red-600 border border-red-300 rounded px-3 py-1 hover:bg-red-50"
              >
                Cancel
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
