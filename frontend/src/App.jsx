import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Events from './pages/Events';
import Login from './pages/Login';
import Bookings from './pages/Bookings';

export default function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Events />} />
        <Route path="/login" element={<Login />} />
        <Route path="/bookings" element={<Bookings />} />
      </Routes>
    </div>
  );
}
