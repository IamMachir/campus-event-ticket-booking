import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-emerald-700 text-white px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
      <Link to="/" className="font-bold text-lg">Campus Events</Link>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <Link to="/">Events</Link>
        <Link to="/events/new">Create Event</Link>
        <Link to="/bookings">My Bookings</Link>
        <Link to="/check-in">Check-In</Link>
        <Link to="/organizer/dashboard">Organizer Dashboard</Link>
        <Link to="/login">Login</Link>
        <Link to="/about">About</Link>
      </div>
    </nav>
  );
}
