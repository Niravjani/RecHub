import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { applicationsAPI, jobsAPI } from '../../services/api';

const statusColors = {
  applied: 'bg-blue-100 text-blue-800',
  reviewed: 'bg-indigo-100 text-indigo-800',
  shortlisted: 'bg-purple-100 text-purple-800',
  interview: 'bg-yellow-100 text-yellow-800',
  offered: 'bg-green-100 text-green-800',
  hired: 'bg-green-200 text-green-900',
  rejected: 'bg-red-100 text-red-800',
};

function JobApplicants() {
  const { jobId } = useParams();
  const [applicants, setApplicants] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApplicants();
  }, [jobId]);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch job details
      const jobResponse = await jobsAPI.getJobById(jobId);
      setJob(jobResponse.data.data);

      // Fetch applicants for this job
      const applicantsResponse = await applicationsAPI.getJobApplications(jobId);
      setApplicants(applicantsResponse.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch applicants');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading applicants...</p>
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
            onClick={fetchApplicants}
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
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/recruiter-dashboard"
            className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
          >
            ← Back to Dashboard
          </Link>

          {job && (
            <div className="bg-white rounded-lg shadow p-6 mt-4">
              <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
              <p className="text-gray-600 mt-1">{job.company}</p>
              <p className="text-gray-500 text-sm mt-1">{job.location}</p>
            </div>
          )}
        </div>

        {/* Applicants Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Applicants ({applicants.length})
            </h2>
          </div>

          {applicants.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No applicants yet for this job.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Candidate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applied Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applicants.map((application) => (
                    <tr key={application._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {application.applicant?.name || application.applicantName || 'Unknown'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-600">
                          {application.applicant?.email || application.applicantEmail || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-500 text-sm">
                          {new Date(application.appliedAt || application.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            statusColors[application.status] || 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {application.status
                            ? application.status.charAt(0).toUpperCase() + application.status.slice(1)
                            : 'Applied'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default JobApplicants;