import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Events from './pages/Events';
import Login from './pages/Login';
import Bookings from './pages/Bookings';
import CreateEvent from './pages/CreateEvent';
import EventDetail from './pages/EventDetail';

export default function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Events />} />
        <Route path="/login" element={<Login />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/events/new" element={<CreateEvent />} />
        <Route path="/events/:id" element={<EventDetail />} />
      </Routes>
    </div>
  );
}
