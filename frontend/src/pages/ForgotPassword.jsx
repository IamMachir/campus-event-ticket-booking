import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';
import api from '../api/client';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to send reset instructions');
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
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-astu-500 to-astuGreen-500 mb-4 animate-glow-pulse">
              <KeyRound className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-display font-bold text-2xl text-slate-100">Reset password</h1>
            <p className="text-slate-400 text-sm mt-1">We'll email you a reset link</p>
          </div>

          {sent ? (
            <div className="glass-card p-4 border-astuGreen-400/30">
              <p className="text-sm text-astuGreen-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                If an account exists with this email, password reset instructions have been sent.
              </p>
              <p className="text-xs text-slate-500 mt-3">
                The link is valid for 60 minutes and can only be used once.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {message && (
                <div className="glass-card p-3 mb-4 border-red-400/30">
                  <p className="text-sm text-red-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> {message}
                  </p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input type="email" required placeholder="your.email@campus.edu" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-slate-200 placeholder-slate-500 focus:border-astu-400/40 focus:outline-none transition-colors" />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full glow-btn bg-gradient-to-r from-astu-500 to-astuGreen-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-astu-500/30 transition-all disabled:opacity-50">
                {loading ? 'Sending...' : 'Send reset link'}
              </button>
            </form>
          )}

          <p className="text-center text-sm mt-6">
            <Link to="/login" className="text-slate-400 hover:text-astu-400 transition-colors inline-flex items-center gap-1.5">
              <ArrowLeft className="w-4 h-4" /> Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
