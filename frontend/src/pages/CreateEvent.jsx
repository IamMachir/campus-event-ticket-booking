import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, AlertCircle, Calendar, MapPin, FileText, Users } from 'lucide-react';
import api from '../api/client';

export default function CreateEvent() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', location: '', startTime: '', endTime: '', capacity: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) { setForm((f) => ({ ...f, [field]: value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.title || !form.startTime || !form.capacity) { setError('Title, start time and capacity are required.'); return; }
    setSubmitting(true);
    try {
      const res = await api.post('/events', { ...form, capacity: Number(form.capacity) });
      navigate(`/events/${res.data.id}`);
    } catch (err) {
      if (err.response && err.response.status === 401) { navigate('/login'); return; }
      if (err.response && err.response.status === 403) { setError('Only organizers can create events.'); return; }
      setError(err.response?.data?.error || 'Failed to create event.');
    } finally { setSubmitting(false); }
  }

  const inputClass = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:border-astu-400/40 focus:outline-none transition-colors';

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-8 pt-24">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-astuGreen-500 to-astu-500 mb-4 animate-glow-pulse">
          <Plus className="w-8 h-8 text-white" />
        </div>
        <h1 className="font-display font-bold text-2xl text-slate-100">Create New Event</h1>
        <p className="text-slate-400 text-sm mt-1">Fill in the details below</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-1.5"><Calendar className="w-4 h-4 text-astu-400" /> Event Title</label>
          <input type="text" placeholder="e.g. Tech Career Fair" value={form.title} onChange={(e) => update('title', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-1.5"><FileText className="w-4 h-4 text-astu-400" /> Description</label>
          <textarea placeholder="Describe the event..." rows={3} value={form.description} onChange={(e) => update('description', e.target.value)} className={`${inputClass} resize-none`} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-1.5"><MapPin className="w-4 h-4 text-astu-400" /> Location</label>
          <input type="text" placeholder="e.g. Main Auditorium" value={form.location} onChange={(e) => update('location', e.target.value)} className={inputClass} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Start Time</label>
            <input type="datetime-local" value={form.startTime} onChange={(e) => update('startTime', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">End Time (optional)</label>
            <input type="datetime-local" value={form.endTime} onChange={(e) => update('endTime', e.target.value)} className={inputClass} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-1.5"><Users className="w-4 h-4 text-astu-400" /> Capacity</label>
          <input type="number" min="1" placeholder="100" value={form.capacity} onChange={(e) => update('capacity', e.target.value)} className={inputClass} />
        </div>

        {error && <div className="glass-card p-3 border-red-400/30"><p className="text-red-400 text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {error}</p></div>}

        <button type="submit" disabled={submitting}
          className="w-full glow-btn bg-gradient-to-r from-astu-500 to-astuGreen-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-astu-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
          {submitting ? 'Creating...' : <><Plus className="w-5 h-5" /> Create Event</>}
        </button>
      </form>
    </div>
  );
}
