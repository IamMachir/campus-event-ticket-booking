import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

export default function CreateEvent() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    startTime: '',
    endTime: '',
    capacity: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.title || !form.startTime || !form.capacity) {
      setError('Title, start time and capacity are required.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/events', {
        ...form,
        capacity: Number(form.capacity),
      });
      navigate(`/events/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create event. Are you logged in as an organizer?');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Create Event</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Event title"
          className="border rounded px-3 py-2"
          value={form.title}
          onChange={(e) => update('title', e.target.value)}
        />
        <textarea
          placeholder="Description"
          className="border rounded px-3 py-2"
          rows={4}
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
        />
        <input
          type="text"
          placeholder="Location"
          className="border rounded px-3 py-2"
          value={form.location}
          onChange={(e) => update('location', e.target.value)}
        />
        <label className="text-sm text-gray-600">Start time</label>
        <input
          type="datetime-local"
          className="border rounded px-3 py-2"
          value={form.startTime}
          onChange={(e) => update('startTime', e.target.value)}
        />
        <label className="text-sm text-gray-600">End time (optional)</label>
        <input
          type="datetime-local"
          className="border rounded px-3 py-2"
          value={form.endTime}
          onChange={(e) => update('endTime', e.target.value)}
        />
        <input
          type="number"
          min="1"
          placeholder="Capacity"
          className="border rounded px-3 py-2"
          value={form.capacity}
          onChange={(e) => update('capacity', e.target.value)}
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="bg-emerald-700 text-white rounded py-2 disabled:opacity-60"
        >
          {submitting ? 'Creating…' : 'Create Event'}
        </button>
      </form>
    </div>
  );
}
