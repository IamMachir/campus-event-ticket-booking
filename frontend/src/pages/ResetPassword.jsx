import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, AlertTriangle, CheckCircle2, ArrowLeft } from 'lucide-react';
import api from '../api/client';
import PasswordField from '../components/PasswordField';
import PasswordStrength, { isStrongPassword } from '../components/PasswordStrength';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get('token');
  const navigate = useNavigate();

  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    if (!isStrongPassword(form.newPassword)) {
      setMessage('Choose a stronger password with uppercase, lowercase, number, and special character');
      setIsError(true);
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setMessage('Passwords do not match');
      setIsError(true);
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', {
        token: resetToken,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      });
      setMessage(res.data?.message || 'Password has been reset successfully');
      setIsError(false);
      setDone(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to reset password');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20">
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-astu-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-astuGreen-500/10 rounded-full blur-3xl"></div>

      <div className="relative w-full max-w-md">
        <div className="glass-card p-8 animate-slide-up">
          {!resetToken ? (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/20 mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
                <h1 className="font-display font-bold text-2xl text-slate-100">Invalid reset link</h1>
                <p className="text-slate-400 text-sm mt-1">This password reset link is missing or incomplete</p>
              </div>
              <p className="text-center text-sm mt-2">
                <Link to="/forgot-password" className="text-astu-400 hover:text-astu-300 font-medium">Request a new reset link</Link>
              </p>
            </>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-astu-500 to-astuGreen-500 mb-4 animate-glow-pulse">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <h1 className="font-display font-bold text-2xl text-slate-100">New password</h1>
                <p className="text-slate-400 text-sm mt-1">Choose a new password for your account</p>
              </div>

              {message && (
                <div className={'glass-card p-3 mb-4 ' + (isError ? 'border-red-400/30' : 'border-astuGreen-400/30')}>
                  <p className={'text-sm flex items-center gap-2 ' + (isError ? 'text-red-400' : 'text-astuGreen-400')}>
                    {isError ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />} {message}
                  </p>
                </div>
              )}

              {!done && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <PasswordField label="New password" placeholder="Create a strong password" value={form.newPassword}
                    onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                    autoComplete="new-password" />
                  <PasswordStrength password={form.newPassword} />
                  <PasswordField label="Confirm new password" placeholder="Repeat your new password" value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    autoComplete="new-password" />
                  <button type="submit" disabled={loading}
                    className="w-full glow-btn bg-gradient-to-r from-astu-500 to-astuGreen-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-astu-500/30 transition-all disabled:opacity-50">
                    {loading ? 'Resetting...' : 'Reset password'}
                  </button>
                </form>
              )}

              <p className="text-center text-sm mt-6">
                <Link to="/login" className="text-slate-400 hover:text-astu-400 transition-colors inline-flex items-center gap-1.5">
                  <ArrowLeft className="w-4 h-4" /> Back to sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
