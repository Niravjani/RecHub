import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import RecruiterProtectedRoute from './components/RecruiterProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import JobList from './pages/JobList';
import JobDetails from './pages/JobDetails';
import MyApplications from './pages/MyApplications';
import ApplicantsList from './pages/ApplicantsList';
import PostJob from './pages/PostJob';
import RecruiterDashboard from './pages/RecruiterDashboard';
import PendingApproval from './pages/PendingApproval';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminJobs from './pages/AdminJobs';
import AdminApplications from './pages/AdminApplications';
import AdminRecruiterApprovals from './pages/AdminRecruiterApprovals';
import Footer from './components/Footer';
import RecruiterJobs from './pages/recruiter/RecruiterJobs';
import JobApplicants from './pages/recruiter/JobApplicants';
import ForgotPassword from "./pages/Forgotpassword";
import ResetPassword from "./pages/Resetpassword";   

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* Public routes */}
          
<Route path="/login" element={<Login />} />
<Route path="/register" element={<Signup />} />
<Route path="/jobs" element={<JobList />} />
<Route path="/jobs/:id" element={<JobDetails />} />
<Route path="/forgot-password" element={<ForgotPassword />} />        
<Route path="/reset-password/:token" element={<ResetPassword />} />    

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/applications"
            element={
              <ProtectedRoute>
                <MyApplications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/applicants/:jobId"
            element={
              <ProtectedRoute>
                <ApplicantsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/post-job"
            element={
              <RecruiterProtectedRoute>
                <PostJob />
              </RecruiterProtectedRoute>
            }
          />
          <Route
            path="/recruiter-dashboard"
            element={
              <RecruiterProtectedRoute>
                <RecruiterDashboard />
              </RecruiterProtectedRoute>
            }
          />

          {/* Pending Approval Page */}
          <Route
            path="/pending-approval"
            element={
              <ProtectedRoute>
                <PendingApproval />
              </ProtectedRoute>
            }
          />

          {/* Admin routes - Protected by admin role */}
          <Route
            path="/admin/dashboard"
            element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminProtectedRoute>
                <AdminUsers />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/jobs"
            element={
              <AdminProtectedRoute>
                <AdminJobs />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/applications"
            element={
              <AdminProtectedRoute>
                <AdminApplications />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/recruiter-approvals"
            element={
              <AdminProtectedRoute>
                <AdminRecruiterApprovals />
              </AdminProtectedRoute>
            }
          />

          <Route path="/recruiter/jobs" element={<RecruiterJobs />} />
          <Route path="/recruiter/jobs/:jobId/applicants" element={<JobApplicants />} />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/jobs" replace />} />
        </Routes>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;