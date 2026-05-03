import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { jobsAPI } from '../../services/api';

function RecruiterJobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const fetchMyJobs = async () => {
    try {
      setLoading(true);
      setError('');
      // No /jobs/my-jobs endpoint; fetch all and filter client-side
      const response = await jobsAPI.getJobs();
      const allJobs = response.data.data || [];
      const myJobs = allJobs.filter(
        (job) => job.postedBy?._id === user?._id || job.postedBy === user?._id
      );
      setJobs(myJobs);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your jobs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 text-red-700 p-4 rounded-lg max-w-md">
            <p className="font-medium">Error</p>
            <p>{error}</p>
          </div>
          <button
            onClick={fetchMyJobs}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Posted Jobs</h1>
          <Link
            to="/post-job"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Post New Job
          </Link>
        </div>

        {jobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">You haven't posted any jobs yet.</p>
            <Link
              to="/post-job"
              className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Post Your First Job
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {job.title}
                    </h2>
                    <p className="text-gray-600 mt-1">{job.company}</p>
                    <p className="text-gray-500 text-sm mt-1">{job.location}</p>
                    <p className="text-gray-400 text-sm mt-2">
                      Posted: {new Date(job.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Link
                    to={`/recruiter/jobs/${job._id}/applicants`}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    View Applicants
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default RecruiterJobs;