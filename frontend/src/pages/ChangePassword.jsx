import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';
import api from '../api/client';
import PasswordField from '../components/PasswordField';
import PasswordStrength, { isStrongPassword } from '../components/PasswordStrength';

export default function ChangePassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    setError(false);
    if (!isStrongPassword(form.newPassword)) {
      setMessage('Choose a stronger password with uppercase, lowercase, number, and special character');
      setError(true);
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setMessage('Passwords do not match');
      setError(true);
      return;
    }
    setSaving(true);
    try {
      await api.post('/auth/me/password', form);
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setMessage('Password updated successfully');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to change password');
      setError(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-12">
      <div className="w-full max-w-md">
        <Link to="/profile" className="inline-flex items-center gap-2 text-slate-400 hover:text-astu-400 mb-6 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to profile
        </Link>
        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-astu-500 to-astuGreen-500 mb-4">
              <KeyRound className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-display font-bold text-2xl text-slate-100">Change password</h1>
            <p className="text-slate-400 text-sm mt-1">Use a strong password you do not reuse elsewhere.</p>
          </div>
          {message && (
            <div className={`glass-card p-3 mb-4 ${error ? 'border-red-400/30' : 'border-astuGreen-400/30'}`}>
              <p className={`text-sm flex items-center gap-2 ${error ? 'text-red-400' : 'text-astuGreen-400'}`}>
                {error ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />} {message}
              </p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <PasswordField label="Current password" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} autoComplete="current-password" />
            <PasswordField label="New password" placeholder="Create a strong password" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} autoComplete="new-password" />
            <PasswordStrength password={form.newPassword} />
            <PasswordField label="Confirm new password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} autoComplete="new-password" />
            <button type="submit" disabled={saving} className="w-full glow-btn bg-gradient-to-r from-astu-500 to-astuGreen-500 text-white px-6 py-3 rounded-xl font-medium disabled:opacity-50">
              {saving ? 'Updating...' : 'Update password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}