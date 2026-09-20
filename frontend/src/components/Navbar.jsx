import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Calendar, LogOut, ScanLine, Plus, Ticket, BarChart3, Info, User } from 'lucide-react';
import { isOrganizer, isAdmin, getUser } from '../api/client';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const organizer = isOrganizer();
  const admin = isAdmin();
  const user = getUser();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
    window.location.reload();
  };

  const linkClass = 'text-slate-300 hover:text-astu-400 transition-colors font-medium text-sm flex items-center gap-1.5';

  const links = (
    <>
      <Link to="/" onClick={() => setOpen(false)} className={linkClass}><Calendar className="w-4 h-4" /> Events</Link>
      {organizer && <Link to="/events/new" onClick={() => setOpen(false)} className={linkClass}><Plus className="w-4 h-4" /> Create</Link>}
      {token && <Link to="/bookings" onClick={() => setOpen(false)} className={linkClass}><Ticket className="w-4 h-4" /> My Bookings</Link>}
      {organizer && <Link to="/check-in" onClick={() => setOpen(false)} className={linkClass}><ScanLine className="w-4 h-4" /> Scan Ticket</Link>}
      {organizer && <Link to="/organizer/dashboard" onClick={() => setOpen(false)} className={linkClass}><BarChart3 className="w-4 h-4" /> Dashboard</Link>}
      <Link to="/about" onClick={() => setOpen(false)} className={linkClass}><Info className="w-4 h-4" /> About</Link>
      {token && <NotificationBell />}
      {token && <Link to="/profile" onClick={() => setOpen(false)} className={linkClass}><User className="w-4 h-4" /> Profile</Link>}
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

          <div className="hidden md:flex items-center gap-6">
            {links}
            {token ? (
              <div className="flex items-center gap-3">
                {user && <span className="text-xs text-slate-500 capitalize">{user.role}</span>}
                <button onClick={handleLogout} className="flex items-center gap-1.5 text-slate-400 hover:text-red-400 transition-colors text-sm">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/register" className="text-slate-300 hover:text-astu-400 transition-colors font-medium text-sm">
                  Create account
                </Link>
                <Link to="/login" className="glow-btn bg-gradient-to-r from-astu-500 to-astuGreen-500 text-white px-5 py-2 rounded-lg font-medium text-sm hover:shadow-lg hover:shadow-astu-500/30 transition-all flex items-center gap-1.5">
                  <User className="w-4 h-4" /> Sign In
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
            {links}
            {token ? (
              <button onClick={handleLogout} className="text-red-400 text-left flex items-center gap-2 text-sm">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <Link to="/login" onClick={() => setOpen(false)} className="bg-gradient-to-r from-astu-500 to-astuGreen-500 text-white px-5 py-2 rounded-lg font-medium text-center text-sm">
                  Sign In
                </Link>
                <Link to="/register" onClick={() => setOpen(false)} className="text-slate-300 hover:text-astu-400 transition-colors font-medium text-center text-sm">
                  Create account
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
