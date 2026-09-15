import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, AlertCircle, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PasswordField from '../components/PasswordField';

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Login failed');
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
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-display font-bold text-2xl text-slate-100">Welcome Back</h1>
            <p className="text-slate-400 text-sm mt-1">Sign in to manage your bookings</p>
          </div>

          {message && (
            <div className={'glass-card p-3 mb-4 ' + (isError ? 'border-red-400/30' : 'border-astuGreen-400/30')}>
              <p className={'text-sm flex items-center gap-2 ' + (isError ? 'text-red-400' : 'text-astuGreen-400')}>
                {isError ? <AlertCircle className="w-4 h-4" /> : <GraduationCap className="w-4 h-4" />} {message}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="email" required placeholder="your.email@campus.edu" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-slate-200 placeholder-slate-500 focus:border-astu-400/40 focus:outline-none transition-colors" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="sr-only">Password</span>
                <Link to="/forgot-password" className="ml-auto text-xs text-slate-400 hover:text-astu-400 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <PasswordField
                label="Password"
                placeholder="........"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                autoComplete="current-password"
              />
            </div>
            <button type="submit" disabled={loading}
              className="w-full glow-btn bg-gradient-to-r from-astu-500 to-astuGreen-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-astu-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? 'Signing in...' : <>Sign In <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            New to CampusEvents?{' '}
            <Link to="/register" className="text-astu-400 hover:text-astu-300 font-medium">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
