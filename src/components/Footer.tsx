import { Calendar, Mail, MapPin, Github } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-white/10 bg-slate-950/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-7 h-7 text-astu-400" />
              <span className="font-display font-bold text-lg text-gradient">CampusEvents</span>
            </div>
            <p className="text-slate-400 text-sm max-w-md leading-relaxed">
              The official campus event ticket booking platform for Adama Science and Technology University.
              Discover, book, and attend events happening across campus.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-200 mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-slate-400 hover:text-astu-400 transition-colors">Browse Events</Link></li>
              <li><Link to="/my-tickets" className="text-slate-400 hover:text-astu-400 transition-colors">My Tickets</Link></li>
              <li><Link to="/signin" className="text-slate-400 hover:text-astu-400 transition-colors">Sign In</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-200 mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-astu-400" /> Adama, Ethiopia</li>
              <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-astu-400" /> events@astu.edu.et</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} CampusEvents — ASTU. Group Project for course requirement.
          </p>
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Github className="w-4 h-4" />
            <span>Built with React, Supabase & Tailwind CSS</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
