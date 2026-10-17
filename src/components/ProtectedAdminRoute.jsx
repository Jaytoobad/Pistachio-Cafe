import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageLoader from './PageLoader';
import NotAuthorized from './NotAuthorized';

// UX-level gate only. Real enforcement is RLS with is_staff() on every table.
export default function ProtectedAdminRoute({ children }) {
  const { user, isStaff, loading } = useAuth();

  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (!isStaff) return <NotAuthorized />;
  return children;
}
