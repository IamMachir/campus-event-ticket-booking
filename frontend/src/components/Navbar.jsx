import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-emerald-700 text-white px-6 py-4 flex justify-between items-center">
      <Link to="/" className="font-bold text-lg">Campus Events</Link>
      <div className="flex gap-4 text-sm">
        <Link to="/">Events</Link>
        <Link to="/events/new">Create Event</Link>
        <Link to="/bookings">My Bookings</Link>
        <Link to="/login">Login</Link>
        <Link to="/about">About</Link>
      </div>
    </nav>
  );
}
