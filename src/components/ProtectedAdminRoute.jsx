import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageLoader from './PageLoader';
import NotAuthorized from './NotAuthorized';

// UX-level gate only. Real enforcement is RLS with is_staff() on every table.
// Unauthenticated users are sent to /admin/login with the route they were trying
// to reach so they can be returned there after signing in.
export default function ProtectedAdminRoute({ children }) {
  const { user, isStaff, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/admin/login" state={{ from: location }} replace />;
  if (!isStaff) return <NotAuthorized />;
  return children;
}
