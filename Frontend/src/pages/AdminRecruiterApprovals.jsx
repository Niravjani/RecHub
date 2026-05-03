import { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';
import AdminLayout from '../components/AdminLayout';

const AdminRecruiterApprovals = () => {
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    fetchPendingRecruiters();
  }, []);

  const fetchPendingRecruiters = async () => {
    try {
      setLoading(true);
      console.log('Fetching pending recruiters...');
      const response = await adminAPI.getPendingRecruiters();
      console.log('Response:', response.data);
      setRecruiters(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching recruiters:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to load pending recruiters';
      setError(errorMsg);
      setRecruiters([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (recruiterId) => {
    try {
      setProcessingId(recruiterId);
      await adminAPI.approveRecruiter(recruiterId);
      
      // Remove from list
      setRecruiters(recruiters.filter(r => r._id !== recruiterId));
      setConfirmAction(null);
      
      setSuccess('Recruiter approved successfully! They can now post jobs.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve recruiter');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (recruiterId) => {
    try {
      setProcessingId(recruiterId);
      await adminAPI.rejectRecruiter(recruiterId, { reason: 'Rejected by admin' });
      
      // Remove from list
      setRecruiters(recruiters.filter(r => r._id !== recruiterId));
      setConfirmAction(null);
      
      setSuccess('Recruiter rejected and removed from system.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject recruiter');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-96">
          <div className="text-gray-500 text-lg">Loading pending recruiters...</div>
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
          <h2 className="text-3xl font-bold text-gray-900">Recruiter Approvals</h2>
          <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 rounded-lg">
            <span className="text-xl">⏳</span>
            <span className="font-semibold text-yellow-800">{recruiters.length} Pending</span>
          </div>
        </div>

        {/* Pending Recruiters */}
        {recruiters.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Applied Date
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recruiters.map((recruiter) => (
                    <tr key={recruiter._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {recruiter.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {recruiter.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {recruiter.company?.name || 'Not provided'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(recruiter.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-center">
                        {confirmAction === recruiter._id ? (
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleApprove(recruiter._id)}
                              disabled={processingId === recruiter._id}
                              className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50"
                            >
                              {processingId === recruiter._id ? 'Approving...' : 'Approve'}
                            </button>
                            <button
                              onClick={() => handleReject(recruiter._id)}
                              disabled={processingId === recruiter._id}
                              className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-50"
                            >
                              {processingId === recruiter._id ? 'Rejecting...' : 'Reject'}
                            </button>
                            <button
                              onClick={() => setConfirmAction(null)}
                              className="px-3 py-1 bg-gray-400 text-white rounded text-xs hover:bg-gray-500"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmAction(recruiter._id)}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                          >
                            Review
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg mb-2">✅ No pending approvals</p>
            <p className="text-gray-400">All recruiters have been approved or rejected</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminRecruiterApprovals;
