import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';

const Events = lazy(() => import('./pages/Events'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Profile = lazy(() => import('./pages/Profile'));
const ChangePassword = lazy(() => import('./pages/ChangePassword'));
const Bookings = lazy(() => import('./pages/Bookings'));
const CreateEvent = lazy(() => import('./pages/CreateEvent'));
const EventDetail = lazy(() => import('./pages/EventDetail'));
const About = lazy(() => import('./pages/About'));
const CheckIn = lazy(() => import('./pages/CheckIn'));
const Notifications = lazy(() => import('./pages/Notifications'));
const SavedEvents = lazy(() => import('./pages/SavedEvents'));
const NotificationPreferences = lazy(() => import('./pages/NotificationPreferences'));
const Appearance = lazy(() => import('./pages/Appearance'));
const OrganizerDashboard = lazy(() => import('./pages/OrganizerDashboard'));

function RouteLoading() {
  return <div className="min-h-screen flex items-center justify-center pt-16"><div className="w-10 h-10 border-4 border-astu-500/30 border-t-astu-400 rounded-full animate-spin" /></div>;
}

export default function App() {
  return <AuthProvider><div><Navbar /><Suspense fallback={<RouteLoading />}><Routes><Route path="/" element={<Events />} /><Route path="/login" element={<Login />} /><Route path="/register" element={<Register />} /><Route path="/forgot-password" element={<ForgotPassword />} /><Route path="/reset-password" element={<ResetPassword />} /><Route path="/events/:id" element={<EventDetail />} /><Route path="/about" element={<About />} /><Route path="/bookings" element={<PrivateRoute><Bookings /></PrivateRoute>} /><Route path="/saved-events" element={<PrivateRoute roles={['student']}><SavedEvents /></PrivateRoute>} /><Route path="/events/new" element={<PrivateRoute requireOrganizer><CreateEvent /></PrivateRoute>} /><Route path="/check-in" element={<PrivateRoute requireOrganizer><CheckIn /></PrivateRoute>} /><Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} /><Route path="/notification-preferences" element={<PrivateRoute><NotificationPreferences /></PrivateRoute>} /><Route path="/appearance" element={<PrivateRoute><Appearance /></PrivateRoute>} /><Route path="/organizer/dashboard" element={<PrivateRoute requireOrganizer><OrganizerDashboard /></PrivateRoute>} /><Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} /><Route path="/change-password" element={<PrivateRoute><ChangePassword /></PrivateRoute>} /></Routes></Suspense></div></AuthProvider>;
}
