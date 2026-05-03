import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobsAPI, applicationsAPI } from '../services/api';

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applicantStats, setApplicantStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs' or 'applicants'

  useEffect(() => {
    if (user?.role !== 'recruiter') return;
    fetchRecruiterData();
  }, [user]);

  const fetchRecruiterData = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch all jobs
      const jobsResponse = await jobsAPI.getJobs();
      const allJobs = jobsResponse.data.data || [];

      // Filter jobs created by this recruiter (Job model uses postedBy)
      const recruiterJobs = allJobs.filter(
        (job) => job.postedBy?._id === user._id || job.postedBy === user._id
      );
      setJobs(recruiterJobs);

      // Fetch applicant count for each job
      const stats = {};
      for (const job of recruiterJobs) {
        try {
          const appResponse = await applicationsAPI.getJobApplications(job._id);
          const applications = appResponse.data.data || [];
          
          stats[job._id] = {
            total: applications.length,
            applied: applications.filter((a) => a.status === 'applied').length,
            shortlisted: applications.filter((a) => a.status === 'shortlisted').length,
            rejected: applications.filter((a) => a.status === 'rejected').length,
            hired: applications.filter((a) => a.status === 'hired').length,
          };
        } catch (err) {
          console.error(`Error fetching applicants for job ${job._id}:`, err);
          stats[job._id] = { total: 0 };
        }
      }
      setApplicantStats(stats);
    } catch (err) {
      console.error('Error fetching recruiter data:', err);
      setError(err.response?.data?.message || 'Failed to load recruiter data');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'recruiter') {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="bg-red-100 text-red-700 p-6 rounded-lg">
          <p className="font-semibold">Access Denied</p>
          <p>This page is only accessible to recruiters.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="text-center py-12">
          <div className="text-gray-500">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl pb-32">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Recruiter Dashboard</h1>
        <p className="text-gray-600">Manage your job postings and applicants</p>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white shadow-md rounded-lg p-6">
          <p className="text-gray-600 text-sm font-medium">Total Jobs</p>
          <p className="text-3xl font-bold text-blue-600">{jobs.length}</p>
        </div>
        <div className="bg-white shadow-md rounded-lg p-6">
          <p className="text-gray-600 text-sm font-medium">Total Applicants</p>
          <p className="text-3xl font-bold text-green-600">
            {Object.values(applicantStats).reduce((sum, stat) => sum + (stat.total || 0), 0)}
          </p>
        </div>
        <div className="bg-white shadow-md rounded-lg p-6">
          <p className="text-gray-600 text-sm font-medium">Shortlisted</p>
          <p className="text-3xl font-bold text-indigo-600">
            {Object.values(applicantStats).reduce((sum, stat) => sum + (stat.shortlisted || 0), 0)}
          </p>
        </div>
        <div className="bg-white shadow-md rounded-lg p-6">
          <p className="text-gray-600 text-sm font-medium">Hired</p>
          <p className="text-3xl font-bold text-emerald-600">
            {Object.values(applicantStats).reduce((sum, stat) => sum + (stat.hired || 0), 0)}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Actions</h2>
        <Link
          to="/post-job"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + Post New Job
        </Link>
      </div>

      {/* Jobs List */}
      {jobs.length === 0 ? (
        <div className="bg-white shadow-md rounded-lg p-12">
          <div className="text-center">
            <p className="text-gray-500 text-lg mb-4">You haven't posted any jobs yet.</p>
            <Link
              to="/post-job"
              className="inline-block text-blue-600 hover:underline font-medium"
            >
              Post your first job →
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => {
            const stats = applicantStats[job._id] || { total: 0 };
            return (
              <div
                key={job._id}
                className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                {/* Job Header */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-1">
                      {job.title}
                    </h3>
                    <p className="text-gray-600">{job.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Posted</p>
                    <p className="text-sm font-medium text-gray-700">
                      {new Date(job.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                {/* Applicant Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6 py-4 border-y border-gray-200">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Applied</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.applied || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Shortlisted</p>
                    <p className="text-2xl font-bold text-indigo-600">
                      {stats.shortlisted || 0}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Rejected</p>
                    <p className="text-2xl font-bold text-red-600">{stats.rejected || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Hired</p>
                    <p className="text-2xl font-bold text-green-600">{stats.hired || 0}</p>
                  </div>
                </div>

                {/* Job Description Preview */}
                <p className="text-gray-700 mb-6 line-clamp-2">
                  {job.description}
                </p>

                {/* Actions */}
                <div className="flex gap-3">
                  <Link
                    to={`/jobs/${job._id}`}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg text-center hover:bg-gray-300 transition-colors font-medium"
                  >
                    View Job
                  </Link>
                  <button
                    disabled={stats.total === 0}
                    onClick={() => {}}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Link to={`/applicants/${job._id}`} className="block">
                      View Applicants ({stats.total})
                    </Link>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecruiterDashboard;
