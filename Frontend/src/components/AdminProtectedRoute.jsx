import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

const AdminProtectedRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Checking authentication...</div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Not an admin - redirect to dashboard
  if (user?.role !== 'admin') {
    // Log unauthorized access attempt
    console.warn(`⚠️ Unauthorized access attempt: ${user?.role} tried to access admin panel`);
    return <Navigate to="/dashboard" replace />;
  }

  // Admin - allow access
  return children;
};

export default AdminProtectedRoute;
