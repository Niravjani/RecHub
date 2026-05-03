import { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';
import AdminLayout from '../components/AdminLayout';

const AdminApplications = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  const statuses = [
    'all',
    'applied',
    'reviewed',
    'shortlisted',
    'interview',
    'offered',
    'hired',
    'rejected',
  ];

  const statusColors = {
    applied: 'bg-blue-100 text-blue-800',
    reviewed: 'bg-indigo-100 text-indigo-800',
    shortlisted: 'bg-purple-100 text-purple-800',
    interview: 'bg-yellow-100 text-yellow-800',
    offered: 'bg-green-100 text-green-800',
    hired: 'bg-green-200 text-green-900',
    rejected: 'bg-red-100 text-red-800',
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [selectedStatus, applications]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllApplications();
      setApplications(response.data.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load applications');
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    if (selectedStatus === 'all') {
      setFilteredApplications(applications);
    } else {
      setFilteredApplications(
        applications.filter(app => app.status === selectedStatus)
      );
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      setUpdatingId(appId);
      await adminAPI.updateApplicationStatus(appId, { status: newStatus });
      
      // Update local state
      setApplications(applications.map(app =>
        app._id === appId ? { ...app, status: newStatus } : app
      ));
      
      setSuccess('Application status updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update application status');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-96">
          <div className="text-gray-500 text-lg">Loading applications...</div>
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
          <h2 className="text-3xl font-bold text-gray-900">Application Monitoring</h2>
          <button
            onClick={fetchApplications}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>

        {/* Status Filter */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter by Status</h3>
          <div className="flex flex-wrap gap-2">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-lg transition-colors font-medium text-sm ${
                  selectedStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                {applications.filter(a => a.status === status || status === 'all').length > 0 && (
                  <span className="ml-2">
                    ({applications.filter(a =>
                      status === 'all' ? true : a.status === status
                    ).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {filteredApplications.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Applicant
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Job Title
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Recruiter
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Current Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Update Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Applied Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredApplications.map((app) => (
                    <tr key={app._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        <div>
                          <p className="font-semibold">{app.applicant?.name || app.applicantName}</p>
                          <p className="text-gray-600 text-xs">{app.applicant?.email || app.applicantEmail}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {app.job?.title || app.jobTitle}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {app.job?.company || app.company}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div>
                          <p className="font-medium">{app.job?.postedBy?.name || 'N/A'}</p>
                          <p className="text-gray-500 text-xs">{app.job?.postedBy?.email || ''}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            statusColors[app.status] || 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <select
                          value={app.status}
                          onChange={(e) => handleStatusChange(app._id, e.target.value)}
                          disabled={updatingId === app._id}
                          className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {statuses.filter(s => s !== 'all').map(status => (
                            <option key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No applications found
                {selectedStatus !== 'all' && ` with status "${selectedStatus}"`}
              </p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-gray-600 text-sm">Total Applications</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{applications.length}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-sm">Shortlisted</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {applications.filter(a => a.status === 'shortlisted').length}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-sm">Hired</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {applications.filter(a => a.status === 'hired').length}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-sm">Rejected</p>
              <p className="text-3xl font-bold text-red-600 mt-2">
                {applications.filter(a => a.status === 'rejected').length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminApplications;
