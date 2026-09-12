import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Calendar, Users, TrendingUp, Edit2, Trash2,
  AlertCircle, X, Shield
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { Event, EventCategory, EventStatus } from '@/types';
import Modal from '@/components/Modal';
import Loader from '@/components/Loader';

const emptyForm = {
  title: '', description: '', event_date: '', venue: '',
  capacity: 100, price: 0, image_url: '', category: 'general' as EventCategory,
  organizer: '',
};

export default function Admin() {
  const { profile, session } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Event | null>(null);
  const [stats, setStats] = useState({ totalEvents: 0, totalBookings: 0, totalSeats: 0 });

  useEffect(() => {
    if (profile?.role === 'admin') {
      loadEvents();
      loadStats();
    }
  }, [profile]);

  async function loadEvents() {
    setLoading(true);
    const { data } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });
    setEvents(data as Event[]);
    setLoading(false);
  }

  async function loadStats() {
    const { count: eventCount } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true });
    const { count: bookingCount } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'confirmed');
    const { data: seatData } = await supabase
      .from('events')
      .select('available_seats, capacity');

    const totalSeats = seatData?.reduce((sum, e) => sum + (e.capacity - e.available_seats), 0) ?? 0;
    setStats({ totalEvents: eventCount ?? 0, totalBookings: bookingCount ?? 0, totalSeats });
  }

  function openCreate() {
    setEditingEvent(null);
    setForm(emptyForm);
    setError(null);
    setShowForm(true);
  }

  function openEdit(event: Event) {
    setEditingEvent(event);
    setForm({
      title: event.title,
      description: event.description,
      event_date: new Date(event.event_date).toISOString().slice(0, 16),
      venue: event.venue,
      capacity: event.capacity,
      price: event.price,
      image_url: event.image_url ?? '',
      category: event.category,
      organizer: event.organizer ?? '',
    });
    setError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      title: form.title,
      description: form.description,
      event_date: new Date(form.event_date).toISOString(),
      venue: form.venue,
      capacity: form.capacity,
      available_seats: editingEvent ? Math.min(editingEvent.available_seats, form.capacity) : form.capacity,
      price: form.price,
      image_url: form.image_url || null,
      category: form.category,
      organizer: form.organizer || null,
    };

    if (editingEvent) {
      const { error } = await supabase.from('events').update(payload).eq('id', editingEvent.id);
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.from('events').insert(payload);
      if (error) setError(error.message);
    }

    if (!error) {
      setShowForm(false);
      await loadEvents();
      await loadStats();
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await supabase.from('events').delete().eq('id', deleteTarget.id);
    setDeleteTarget(null);
    loadEvents();
    loadStats();
  }

  async function handleStatusChange(event: Event, status: EventStatus) {
    await supabase.from('events').update({ status }).eq('id', event.id);
    loadEvents();
  }

  if (!profile || profile.role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Shield className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-300 mb-2">Admin access required.</p>
        <p className="text-slate-500 text-sm">You need an admin account to manage events.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-slate-100">Admin Dashboard</h1>
          <p className="text-slate-400 mt-1">Manage campus events and bookings</p>
        </div>
        <button
          onClick={openCreate}
          className="glow-btn bg-gradient-to-r from-astu-500 to-emerald2-500 text-white px-5 py-2.5 rounded-xl font-medium hover:shadow-lg hover:shadow-astu-500/30 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Event
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Events', value: stats.totalEvents, icon: Calendar, color: 'text-astu-400' },
          { label: 'Total Bookings', value: stats.totalBookings, icon: Users, color: 'text-emerald2-400' },
          { label: 'Seats Booked', value: stats.totalSeats, icon: TrendingUp, color: 'text-astu-400' },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-5">
            <div className="flex items-center gap-3">
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
              <div>
                <p className="text-2xl font-bold text-slate-100">{stat.value}</p>
                <p className="text-sm text-slate-400">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Events Table */}
      {loading ? (
        <Loader label="Loading events..." />
      ) : events.length === 0 ? (
        <div className="text-center py-20">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No events yet. Create your first event!</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 text-left text-sm text-slate-400">
                  <th className="px-4 py-3 font-medium">Event</th>
                  <th className="px-4 py-3 font-medium hidden sm:table-cell">Date</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Seats</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <Link to={`/events/${event.id}`} className="text-slate-200 hover:text-astu-400 transition-colors font-medium">
                        {event.title}
                      </Link>
                      <p className="text-xs text-slate-500">{event.venue}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400 hidden sm:table-cell">
                      {new Date(event.event_date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400 hidden md:table-cell">
                      {event.capacity - event.available_seats}/{event.capacity}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={event.status}
                        onChange={(e) => handleStatusChange(event, e.target.value as EventStatus)}
                        className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm text-slate-300 focus:border-astu-400/40 focus:outline-none"
                      >
                        <option value="upcoming">upcoming</option>
                        <option value="ongoing">ongoing</option>
                        <option value="completed">completed</option>
                        <option value="cancelled">cancelled</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(event)} className="text-slate-400 hover:text-astu-400 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteTarget(event)} className="text-slate-400 hover:text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editingEvent ? 'Edit Event' : 'Create New Event'} maxWidth="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="glass-card p-3 border-red-400/30">
              <p className="text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {error}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Event Title</label>
            <input
              type="text" required value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:border-astu-400/40 focus:outline-none transition-colors"
              placeholder="e.g. Tech Innovators Summit"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
            <textarea
              required value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:border-astu-400/40 focus:outline-none transition-colors resize-none"
              placeholder="Describe the event..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Date & Time</label>
              <input
                type="datetime-local" required value={form.event_date}
                onChange={(e) => setForm({ ...form, event_date: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 focus:border-astu-400/40 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Venue</label>
              <input
                type="text" required value={form.venue}
                onChange={(e) => setForm({ ...form, venue: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:border-astu-400/40 focus:outline-none transition-colors"
                placeholder="e.g. Main Auditorium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Capacity</label>
              <input
                type="number" required min={1} value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) || 1 })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 focus:border-astu-400/40 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Price (ETB)</label>
              <input
                type="number" min={0} step="0.01" value={form.price}
                onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 focus:border-astu-400/40 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as EventCategory })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 focus:border-astu-400/40 focus:outline-none transition-colors"
              >
                <option value="academic">Academic</option>
                <option value="cultural">Cultural</option>
                <option value="sports">Sports</option>
                <option value="social">Social</option>
                <option value="workshop">Workshop</option>
                <option value="general">General</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Image URL (optional)</label>
            <input
              type="url" value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:border-astu-400/40 focus:outline-none transition-colors"
              placeholder="https://images.pexels.com/..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Organizer (optional)</label>
            <input
              type="text" value={form.organizer}
              onChange={(e) => setForm({ ...form, organizer: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:border-astu-400/40 focus:outline-none transition-colors"
              placeholder="e.g. Computer Science Department"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit" disabled={saving}
              className="glow-btn flex-1 bg-gradient-to-r from-astu-500 to-emerald2-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-astu-500/30 transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : editingEvent ? 'Update Event' : 'Create Event'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="border border-white/10 text-slate-300 px-6 py-3 rounded-xl font-medium hover:border-astu-400/40 transition-all">
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Event" maxWidth="max-w-sm">
        <p className="text-slate-300 mb-6">
          Are you sure you want to delete <span className="font-medium text-red-400">{deleteTarget?.title}</span>?
          This will also cancel all bookings for this event.
        </p>
        <div className="flex gap-3">
          <button onClick={handleDelete} className="flex-1 bg-red-500/20 text-red-400 border border-red-400/30 px-4 py-2.5 rounded-xl font-medium hover:bg-red-500/30 transition-all">
            Delete
          </button>
          <button onClick={() => setDeleteTarget(null)} className="flex-1 border border-white/10 text-slate-300 px-4 py-2.5 rounded-xl font-medium hover:border-astu-400/40 transition-all">
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
}
