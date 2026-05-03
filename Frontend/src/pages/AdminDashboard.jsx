import { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';
import AdminLayout from '../components/AdminLayout';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getStats();
      setStats(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load stats');
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, bgColor }) => (
    <div className={`${bgColor} rounded-lg shadow-md p-6 text-white`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-200 text-sm font-medium">{title}</p>
          <p className="text-4xl font-bold mt-2">{value || 0}</p>
        </div>
        <div className="text-5xl opacity-50">{icon}</div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-96">
          <div className="text-gray-500 text-lg">Loading dashboard...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard
            title="Total Users"
            value={stats?.totalUsers}
            icon="👥"
            bgColor="bg-blue-500"
          />
          <StatCard
            title="Total Jobs"
            value={stats?.totalJobs}
            icon="💼"
            bgColor="bg-green-500"
          />
          <StatCard
            title="Total Applications"
            value={stats?.totalApplications}
            icon="📋"
            bgColor="bg-purple-500"
          />
          <StatCard
            title="Candidates"
            value={stats?.totalCandidates}
            icon="🎯"
            bgColor="bg-orange-500"
          />
          <StatCard
            title="Pending Recruiters"
            value={stats?.pendingRecruiters}
            icon="⏳"
            bgColor="bg-red-500"
          />
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* User Roles Breakdown */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">User Breakdown</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Candidates</span>
                <span className="font-semibold text-lg">{stats?.usersByRole?.candidate || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Recruiters</span>
                <span className="font-semibold text-lg">{stats?.usersByRole?.recruiter || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Admins</span>
                <span className="font-semibold text-lg">{stats?.usersByRole?.admin || 0}</span>
              </div>
            </div>
          </div>

          {/* Application Status Breakdown */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Application Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Applied</span>
                <span className="font-semibold text-lg">{stats?.applicationStatus?.applied || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Shortlisted</span>
                <span className="font-semibold text-lg">{stats?.applicationStatus?.shortlisted || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Hired</span>
                <span className="font-semibold text-lg text-green-600">{stats?.applicationStatus?.hired || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Rejected</span>
                <span className="font-semibold text-lg text-red-600">{stats?.applicationStatus?.rejected || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <a
              href="/admin/users"
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center font-medium"
            >
              Manage Users
            </a>
            <a
              href="/admin/jobs"
              className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-center font-medium"
            >
              Manage Jobs
            </a>
            <a
              href="/admin/applications"
              className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-center font-medium"
            >
              Monitor Applications
            </a>
            <a
              href="/admin/recruiter-approvals"
              className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-center font-medium relative"
            >
              Recruiter Approvals
              {stats?.pendingRecruiters > 0 && (
                <span className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {stats?.pendingRecruiters}
                </span>
              )}
            </a>
            <button
              onClick={fetchStats}
              className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
