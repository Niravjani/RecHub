import { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';
import AdminLayout from '../components/AdminLayout';

const AdminJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllJobs();
      setJobs(response.data.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load jobs');
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    try {
      setDeletingId(jobId);
      await adminAPI.deleteJob(jobId);
      
      // Update local state
      setJobs(jobs.filter(job => job._id !== jobId));
      setConfirmDelete(null);
      
      setSuccess('Job deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete job');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-96">
          <div className="text-gray-500 text-lg">Loading jobs...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
              ✕
            </button>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex justify-between items-center">
            <span>{success}</span>
            <button onClick={() => setSuccess(null)} className="text-green-700 hover:text-green-900">
              ✕
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-gray-900">Job Management</h2>
          <button
            onClick={fetchJobs}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>

        {/* Jobs Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {jobs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Job Title</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Company</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Location</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Posted By</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Posted Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {jobs.map((job) => (
                    <tr key={job._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{job.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{job.company}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{job.location}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {job.postedBy?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          job.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {job.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-center">
                        {confirmDelete === job._id ? (
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleDeleteJob(job._id)}
                              disabled={deletingId === job._id}
                              className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-50"
                            >
                              {deletingId === job._id ? 'Deleting...' : 'Confirm'}
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="px-2 py-1 bg-gray-400 text-white rounded text-xs hover:bg-gray-500"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(job._id)}
                            className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No jobs found</p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600 text-sm">Total Jobs</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{jobs.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600 text-sm">Active Jobs</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {jobs.filter(j => j.isActive).length}
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminJobs;
