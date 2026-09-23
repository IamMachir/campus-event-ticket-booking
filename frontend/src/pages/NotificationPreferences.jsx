import { useEffect, useState } from 'react';
import { Bell, Heart, Save, Settings } from 'lucide-react';
import api from '../api/client';
import Spinner from '../components/Spinner';

const preferenceOptions = [
  { key: 'approachingEnabled', title: 'Event approaching', description: 'Reminders for events you have booked.' },
  { key: 'dateChangeEnabled', title: 'Event date changes', description: 'Updates when a saved or booked event changes date or time.' },
  { key: 'locationChangeEnabled', title: 'Event location changes', description: 'Updates when a saved or booked event changes location.' },
  { key: 'interestMatchEnabled', title: 'New events matching my interests', description: 'Updates when a new published event matches a selected category.' },
];

export default function NotificationPreferences() {
  const [categories, setCategories] = useState([]);
  const [preferences, setPreferences] = useState(null);
  const [interestIds, setInterestIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.get('/events/categories'), api.get('/notifications/preferences')])
      .then(([categoryResponse, preferenceResponse]) => {
        setCategories(categoryResponse.data);
        setPreferences(preferenceResponse.data.preferences);
        setInterestIds(preferenceResponse.data.interestIds);
      })
      .catch(() => setError('Could not load notification preferences.'))
      .finally(() => setLoading(false));
  }, []);

  async function togglePreference(key) {
    const next = { ...preferences, [key]: !preferences[key] };
    setPreferences(next);
    setMessage('');
    try {
      await api.patch('/notifications/preferences', { [key]: next[key] });
      setMessage('Notification preferences saved.');
    } catch (err) {
      setPreferences(preferences);
      setError(err.response?.data?.error || 'Could not save that preference.');
    }
  }

  function toggleInterest(categoryId) {
    setInterestIds((current) => current.includes(categoryId)
      ? current.filter((id) => id !== categoryId)
      : [...current, categoryId]);
    setMessage('');
  }

  async function saveInterests() {
    setSaving(true);
    setError('');
    try {
      await api.put('/notifications/interests', { categoryIds: interestIds });
      setMessage('Interests saved. We will use them for new-event alerts.');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save your interests.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="pt-24"><Spinner label="Loading preferences..." /></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 text-astu-300 text-sm mb-3"><Settings className="w-4 h-4" /> Personalize your alerts</div>
        <h1 className="font-display font-bold text-3xl text-slate-100">Notification preferences</h1>
        <p className="text-slate-400 mt-1">Choose which in-app updates are useful to you.</p>
      </div>

      {error && <div className="glass-card p-4 border-red-400/30 mb-5"><p className="text-red-300 text-sm">{error}</p></div>}
      {message && <div className="glass-card p-4 border-astuGreen-400/30 mb-5"><p className="text-astuGreen-300 text-sm">{message}</p></div>}

      <section className="glass-card p-5 mb-6">
        <div className="flex items-center gap-3 mb-5"><Bell className="w-5 h-5 text-astu-300" /><div><h2 className="font-display font-semibold text-slate-100">Notification types</h2><p className="text-xs text-slate-500 mt-1">These controls affect in-app notifications.</p></div></div>
        <div className="space-y-3">
          {preferenceOptions.map((option) => <label key={option.key} className="flex items-center justify-between gap-4 rounded-xl border border-white/10 p-4 hover:bg-white/5 cursor-pointer"><span><span className="block text-sm text-slate-200">{option.title}</span><span className="block text-xs text-slate-500 mt-1">{option.description}</span></span><input type="checkbox" checked={Boolean(preferences?.[option.key])} onChange={() => togglePreference(option.key)} className="h-5 w-5 accent-cyan-400" /></label>)}
        </div>
      </section>

      <section className="glass-card p-5">
        <div className="flex items-center gap-3 mb-5"><Heart className="w-5 h-5 text-red-300" /><div><h2 className="font-display font-semibold text-slate-100">My interests</h2><p className="text-xs text-slate-500 mt-1">Select categories for new-event suggestions.</p></div></div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {categories.map((category) => <label key={category.id} className={`rounded-xl border p-3 text-sm cursor-pointer transition-colors ${interestIds.includes(category.id) ? 'border-astu-400/50 bg-astu-500/10 text-astu-200' : 'border-white/10 text-slate-400 hover:bg-white/5'}`}><input type="checkbox" checked={interestIds.includes(category.id)} onChange={() => toggleInterest(category.id)} className="sr-only" />{category.name}</label>)}
        </div>
        <button type="button" onClick={saveInterests} disabled={saving} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-astu-500 to-astuGreen-500 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"><Save className="w-4 h-4" />{saving ? 'Saving…' : 'Save interests'}</button>
      </section>
    </div>
  );
}