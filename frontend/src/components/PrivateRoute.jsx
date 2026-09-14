import { Navigate } from 'react-router-dom';
import { getUser } from '../api/client';

// Route guard for authenticated pages. 'roles' restricts a route to specific
// roles and 'requireOrganizer' is kept for existing call sites. This is UI
// convenience only - the backend independently verifies permissions on every
// request.
export default function PrivateRoute({ children, requireOrganizer = false, roles = null }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const user = getUser();

  if (requireOrganizer && !(user && (user.role === 'organizer' || user.role === 'admin'))) {
    return <Navigate to="/" replace />;
  }

  if (roles && !(user && roles.includes(user.role))) {
    return <Navigate to="/" replace />;
  }

  return children;
}
