import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Ticket, LogOut, User, Shield, Calendar } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { session, profile, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navLinks = (
    <>
      <Link to="/" onClick={() => setOpen(false)} className="text-slate-300 hover:text-astu-400 transition-colors font-medium">
        Events
      </Link>
      {session && (
        <Link to="/my-tickets" onClick={() => setOpen(false)} className="text-slate-300 hover:text-astu-400 transition-colors font-medium">
          My Tickets
        </Link>
      )}
      {profile?.role === 'admin' && (
        <Link to="/admin" onClick={() => setOpen(false)} className="text-slate-300 hover:text-astu-400 transition-colors font-medium">
          Admin
        </Link>
      )}
    </>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-astu-500/30 blur-lg group-hover:bg-astu-500/50 transition-all"></div>
              <Calendar className="relative w-8 h-8 text-astu-400" />
            </div>
            <span className="font-display font-bold text-xl text-gradient">CampusEvents</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks}
            {session ? (
              <div className="flex items-center gap-3">
                <Link to="/profile" className="flex items-center gap-2 text-slate-300 hover:text-astu-400 transition-colors">
                  {profile?.role === 'admin' ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  <span className="text-sm font-medium">{profile?.full_name?.split(' ')[0] ?? 'Profile'}</span>
                </Link>
                <button onClick={handleSignOut} className="flex items-center gap-1.5 text-slate-400 hover:text-red-400 transition-colors text-sm">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/signin" className="text-slate-300 hover:text-astu-400 transition-colors font-medium text-sm">
                  Sign In
                </Link>
                <Link to="/signup" className="glow-btn bg-gradient-to-r from-astu-500 to-emerald2-500 text-white px-5 py-2 rounded-lg font-medium text-sm hover:shadow-lg hover:shadow-astu-500/30 transition-all">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          <button className="md:hidden text-slate-300" onClick={() => setOpen(!open)}>
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {open && (
          <div className="md:hidden pb-4 flex flex-col gap-4 animate-slide-up">
            {navLinks}
            {session ? (
              <>
                <Link to="/profile" onClick={() => setOpen(false)} className="text-slate-300 hover:text-astu-400 transition-colors flex items-center gap-2">
                  <Ticket className="w-4 h-4" /> {profile?.full_name ?? 'Profile'}
                </Link>
                <button onClick={handleSignOut} className="text-red-400 text-left flex items-center gap-2">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-3">
                <Link to="/signin" onClick={() => setOpen(false)} className="text-slate-300 hover:text-astu-400 transition-colors">
                  Sign In
                </Link>
                <Link to="/signup" onClick={() => setOpen(false)} className="bg-gradient-to-r from-astu-500 to-emerald2-500 text-white px-5 py-2 rounded-lg font-medium text-center">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
