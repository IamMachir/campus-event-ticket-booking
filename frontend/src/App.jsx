import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Events from './pages/Events';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import ChangePassword from './pages/ChangePassword';
import Bookings from './pages/Bookings';
import CreateEvent from './pages/CreateEvent';
import EventDetail from './pages/EventDetail';
import About from './pages/About';
import CheckIn from './pages/CheckIn';
import Notifications from './pages/Notifications';
import PrivateRoute from './components/PrivateRoute';
import OrganizerDashboard from './pages/OrganizerDashboard';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return <AuthProvider><div><Navbar /><Routes><Route path="/" element={<Events />} /><Route path="/login" element={<Login />} /><Route path="/register" element={<Register />} /><Route path="/forgot-password" element={<ForgotPassword />} /><Route path="/reset-password" element={<ResetPassword />} /><Route path="/events/:id" element={<EventDetail />} /><Route path="/about" element={<About />} /><Route path="/bookings" element={<PrivateRoute><Bookings /></PrivateRoute>} /><Route path="/events/new" element={<PrivateRoute requireOrganizer><CreateEvent /></PrivateRoute>} /><Route path="/check-in" element={<PrivateRoute requireOrganizer><CheckIn /></PrivateRoute>} /><Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} /><Route path="/organizer/dashboard" element={<PrivateRoute requireOrganizer><OrganizerDashboard /></PrivateRoute>} /><Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} /><Route path="/change-password" element={<PrivateRoute><ChangePassword /></PrivateRoute>} /></Routes></div></AuthProvider>;
}
