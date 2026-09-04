import { Navigate } from 'react-router-dom';

/**
 * Redirects to /login if there's no auth token in localStorage.
 * This is a client-side convenience guard only — the backend's
 * requireAuth middleware is the real enforcement layer.
 */
export default function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
