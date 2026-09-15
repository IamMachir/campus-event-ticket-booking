import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, User as UserIcon, ArrowRight, AlertCircle, CheckCircle2, GraduationCap } from 'lucide-react';
import api from '../api/client';
import { PUBLIC_ROLES, ROLE_LABELS } from '../constants/roles';
import PasswordField from '../components/PasswordField';
import PasswordStrength, { isStrongPassword } from '../components/PasswordStrength';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '', role: 'student' });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function validate() {
    if (!form.fullName.trim()) return 'Full name is required';
    if (form.fullName.trim().length < 2) return 'Full name must be at least 2 characters';
    if (!form.email) return 'Email is required';
    if (!EMAIL_RE.test(form.email)) return 'Please enter a valid email address';
    if (!isStrongPassword(form.password)) return 'Choose a stronger password with uppercase, lowercase, number, and special character';
    if (form.password !== form.confirmPassword) return 'Passwords do not match';
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    const problem = validate();
    if (problem) {
      setMessage(problem);
      setIsError(true);
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/register', {
        fullName: form.fullName.trim(),
        email: form.email,
        password: form.password,
        role: form.role,
      });
      setMessage('Account created successfully! Redirecting to sign in...');
      setIsError(false);
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      const base = err.response?.data?.error || 'Registration failed';
      const details = err.response?.data?.details;
      const fieldErrors = Array.isArray(details) ? details.map((d) => d.msg).join(', ') : null;
      setMessage(fieldErrors ? base + ': ' + fieldErrors : base);
      setIsError(true);
    } finally {
      setLoading(false);
    }
  }

  const inputClass = 'w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-slate-200 placeholder-slate-500 focus:border-astu-400/40 focus:outline-none transition-colors';

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-12">
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-astu-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-astuGreen-500/10 rounded-full blur-3xl"></div>

      <div className="relative w-full max-w-md">
        <div className="glass-card p-8 animate-slide-up">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-astu-500 to-astuGreen-500 mb-4 animate-glow-pulse">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-display font-bold text-2xl text-slate-100">Create Account</h1>
            <p className="text-slate-400 text-sm mt-1">Join campus events in minutes</p>
          </div>

          {message && (
            <div className={'glass-card p-3 mb-4 ' + (isError ? 'border-red-400/30' : 'border-astuGreen-400/30')}>
              <p className={'text-sm flex items-center gap-2 ' + (isError ? 'text-red-400' : 'text-astuGreen-400')}>
                {isError ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />} {message}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Full name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="text" required placeholder="Jane Doe" value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className={inputClass} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="email" required placeholder="your.email@campus.edu" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={inputClass} />
              </div>
            </div>
            <PasswordField
              label="Password"
              placeholder="Create a strong password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoComplete="new-password"
            />
            <PasswordStrength password={form.password} />
            <PasswordField
              label="Confirm password"
              placeholder="Repeat your password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              autoComplete="new-password"
            />
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">I am a</label>
              <div className="grid grid-cols-2 gap-3">
                {PUBLIC_ROLES.map((role) => (
                  <label key={role} className={'cursor-pointer rounded-xl border px-4 py-3 text-center transition-colors ' + (form.role === role ? 'border-astu-400/60 bg-astu-500/10' : 'border-white/10 bg-white/5 hover:border-astu-400/30')}>
                    <input type="radio" name="role" value={role}
                      checked={form.role === role}
                      onChange={() => setForm({ ...form, role })}
                      className="sr-only" />
                    <span className={'text-sm font-medium ' + (form.role === role ? 'text-astu-400' : 'text-slate-300')}>
                      {ROLE_LABELS[role]}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full glow-btn bg-gradient-to-r from-astu-500 to-astuGreen-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-astu-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? 'Creating account...' : <>Create Account <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-astu-400 hover:text-astu-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
