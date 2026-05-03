import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import api from '../services/api';

const RecruiterProtectedRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const [recruiterData, setRecruiterData] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'recruiter') {
      setLoadingData(false);
      return;
    }

    // Fetch recruiter data to check approval status
    const fetchRecruiterData = async () => {
      try {
        const response = await api.get('/auth/me');
        setRecruiterData(response.data.data);
      } catch (err) {
        console.error('Error fetching recruiter data:', err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchRecruiterData();
  }, [isAuthenticated, user]);

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Not a recruiter - redirect to dashboard
  if (user?.role !== 'recruiter') {
    return <Navigate to="/dashboard" replace />;
  }

  // Recruiter but not approved - show pending approval page
  if (recruiterData && !recruiterData.isApproved) {
    return <Navigate to="/pending-approval" replace />;
  }

  // Recruiter and approved - allow access
  return children;
};

export default RecruiterProtectedRoute;