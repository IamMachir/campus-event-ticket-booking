import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Events from './pages/Events';
import Login from './pages/Login';
import Bookings from './pages/Bookings';
import CreateEvent from './pages/CreateEvent';
import EventDetail from './pages/EventDetail';
import About from './pages/About';
import CheckIn from './pages/CheckIn';
import PrivateRoute from './components/PrivateRoute';
import OrganizerDashboard from './pages/OrganizerDashboard';

export default function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Events />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/bookings"
          element={
            <PrivateRoute>
              <Bookings />
            </PrivateRoute>
          }
        />
        <Route
          path="/events/new"
          element={
            <PrivateRoute>
              <CreateEvent />
            </PrivateRoute>
          }
        />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/about" element={<About />} />
        <Route
          path="/check-in"
          element={
            <PrivateRoute>
              <CheckIn />
            </PrivateRoute>
          }
        />
        <Route
          path="/organizer/dashboard"
          element={
            <PrivateRoute>
              <OrganizerDashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </div>
  );
}
