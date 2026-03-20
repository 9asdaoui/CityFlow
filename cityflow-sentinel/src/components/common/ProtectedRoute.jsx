import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute({ auth }) {
  if (!auth.isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}
