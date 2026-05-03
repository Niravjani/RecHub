import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { applicationsAPI, jobsAPI } from '../services/api';

// ── Status badge colours ──────────────────────────────────────────────────────
const STATUS_STYLES = {
  applied:     'bg-gray-100 text-gray-800',
  shortlisted: 'bg-blue-100 text-blue-800',
  hired:       'bg-green-100 text-green-800',
  rejected:    'bg-red-100 text-red-800',
  reviewed:    'bg-yellow-100 text-yellow-800',
  interview:   'bg-purple-100 text-purple-800',
  offered:     'bg-emerald-100 text-emerald-800',
};

const ApplicantsList = () => {
  const { jobId } = useParams();
  const [applicants, setApplicants] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchData();
  }, [jobId]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch job details
      const jobRes = await jobsAPI.getJobById(jobId);
      setJob(jobRes.data.data);

      // Fetch applicants
      const appRes = await applicationsAPI.getJobApplications(jobId);
      setApplicants(appRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (applicationId, newStatus) => {
    try {
      await applicationsAPI.updateStatus(applicationId, { status: newStatus });
      setApplicants(applicants.map(app =>
        app._id === applicationId ? { ...app, status: newStatus } : app
      ));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  // Filter applicants by status
  const filteredApplicants = filterStatus === 'all'
    ? applicants
    : applicants.filter(app => app.status === filterStatus);

  return (
    <div className="container mx-auto p-6 max-w-5xl pb-32">
      {/* Back Button */}
      <Link to="/recruiter-dashboard" className="text-blue-600 hover:underline mb-6 inline-block font-medium">
        ← Back to Dashboard
      </Link>

      {/* Header */}
      {job && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-1">{job.title}</h1>
          <p className="text-gray-600">{job.company} · {job.location}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center text-gray-500 py-12">
          Loading applicants...
        </div>
      )}

      {!loading && !error && applicants.length === 0 && (
        <div className="bg-white shadow-md rounded-lg p-12">
          <div className="text-center">
            <p className="text-gray-500 text-lg">No applicants yet.</p>
          </div>
        </div>
      )}

      {!loading && applicants.length > 0 && (
        <>
          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {['all', 'applied', 'shortlisted', 'rejected', 'hired'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Results Count */}
          <p className="text-sm text-gray-600 mb-4">
            Showing {filteredApplicants.length} of {applicants.length} applicants
          </p>

          {/* Applicants List */}
          <div className="space-y-4">
            {filteredApplicants.map((app) => (
              <div
                key={app._id}
                className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Applicant Info */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">
                      {app.applicant?.name || 'Unknown'}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {app.applicant?.email || 'No email'}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>Applied {new Date(app.appliedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}</span>
                      {app.coverLetter && (
                        <span>Cover Letter: {app.coverLetter.substring(0, 30)}...</span>
                      )}
                    </div>
                  </div>

                  {/* Status and Actions */}
                  <div className="flex items-center gap-4">
                    <span className={`text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap ${STATUS_STYLES[app.status] || 'bg-gray-100 text-gray-800'}`}>
                      {app.status}
                    </span>

                    <div className="flex gap-2 flex-wrap">
                      {app.status !== 'shortlisted' && app.status !== 'hired' && app.status !== 'rejected' && (
                        <button
                          onClick={() => updateStatus(app._id, 'shortlisted')}
                          className="bg-indigo-600 text-white px-3 py-1 rounded text-xs hover:bg-indigo-700 transition-colors whitespace-nowrap font-medium"
                        >
                          Shortlist
                        </button>
                      )}
                      {app.status !== 'rejected' && app.status !== 'hired' && (
                        <button
                          onClick={() => updateStatus(app._id, 'rejected')}
                          className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition-colors whitespace-nowrap font-medium"
                        >
                          Reject
                        </button>
                      )}
                      {app.status !== 'hired' && (
                        <button
                          onClick={() => updateStatus(app._id, 'hired')}
                          className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition-colors whitespace-nowrap font-medium"
                        >
                          Hire
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ApplicantsList;