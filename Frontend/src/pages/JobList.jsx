import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobsAPI, applicationsAPI } from '../services/api';

const JobList = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('');

  // Apply modal state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applyForm, setApplyForm] = useState({
    coverLetter: '',
    resumeUrl: '',
  });
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await jobsAPI.getJobs();
      setJobs(response.data.data || []);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError(err.response?.data?.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  // Filter jobs based on search and location
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = 
      filterLocation === '' || 
      job.location.toLowerCase().includes(filterLocation.toLowerCase());
    
    return matchesSearch && matchesLocation;
  });

  const openApplyModal = (job) => {
    setSelectedJob(job);
    setShowApplyModal(true);
    setApplyForm({ coverLetter: '', resumeUrl: '' });
    setApplyError('');
  };

  const closeApplyModal = () => {
    setShowApplyModal(false);
    setSelectedJob(null);
    setApplyForm({ coverLetter: '', resumeUrl: '' });
    setApplyError('');
  };

  const handleApplyChange = (e) => {
    const { name, value } = e.target;
    setApplyForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setApplyError('');

    if (!applyForm.coverLetter.trim()) {
      setApplyError('Cover letter is required');
      return;
    }

    if (!applyForm.resumeUrl.trim()) {
      setApplyError('Resume URL is required');
      return;
    }

    if (applyForm.coverLetter.length < 20) {
      setApplyError('Cover letter must be at least 20 characters');
      return;
    }

    setApplying(true);
    try {
      await applicationsAPI.apply(selectedJob._id, {
        coverLetter: applyForm.coverLetter,
        resumeUrl: applyForm.resumeUrl,
      });

      alert('Application submitted successfully!');
      closeApplyModal();
    } catch (err) {
      console.error('Error applying:', err);
      const msg = err.response?.data?.message || 'Failed to submit application';
      setApplyError(msg);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl pb-32">
      <h1 className="text-3xl font-bold mb-2">Job Listings</h1>
      <p className="text-gray-600 mb-6">Browse all open positions</p>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-6">
          {error}
        </div>
      )}

      {/* Search and Filter Section */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search by Title/Company */}
          <input
            type="text"
            placeholder="Search by title or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Filter by Location */}
          <input
            type="text"
            placeholder="Filter by location..."
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Refresh Button */}
          <button
            onClick={fetchJobs}
            className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Results Info */}
      {!loading && (
        <p className="text-sm text-gray-600 mb-4">
          Showing {filteredJobs.length} of {jobs.length} jobs
        </p>
      )}

      {/* Jobs List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-500">Loading jobs...</div>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="bg-white shadow-md rounded-lg p-8">
          <div className="text-center">
            <p className="text-gray-500 text-lg">
              {jobs.length === 0 ? 'No jobs available at the moment.' : 'No jobs match your search criteria.'}
            </p>
            {jobs.length > 0 && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterLocation('');
                }}
                className="mt-4 text-blue-600 hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredJobs.map((job) => (
            <div key={job._id} className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow">
              {/* Job Header */}
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-1">
                  {job.title}
                </h2>
                <p className="text-blue-600 font-medium">{job.company}</p>
                <p className="text-gray-500 text-sm">{job.location}</p>
              </div>

              {/* Job Description Preview */}
              <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                {job.description}
              </p>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Link
                  to={`/jobs/${job._id}`}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg text-center hover:bg-gray-300 transition-colors font-medium"
                >
                  View Details
                </Link>
                {user?.role === 'candidate' && (
                  <button
                    onClick={() => openApplyModal(job)}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Apply
                  </button>
                )}
                {!user && (
                  <Link
                    to="/login"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-center hover:bg-blue-700 transition-colors font-medium"
                  >
                    Login to Apply
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Apply Modal */}
      {showApplyModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg">
              <h3 className="text-2xl font-bold">Apply for {selectedJob.title}</h3>
              <p className="text-blue-100 mt-1">{selectedJob.company} · {selectedJob.location}</p>
            </div>

            <form onSubmit={handleApplySubmit} className="p-6">
              {/* Cover Letter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Letter
                </label>
                <textarea
                  name="coverLetter"
                  value={applyForm.coverLetter}
                  onChange={handleApplyChange}
                  placeholder="Tell the recruiter why you're interested in this role..."
                  rows="5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Minimum 20 characters</p>
              </div>

              {/* Resume URL */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resume URL
                </label>
                <input
                  type="url"
                  name="resumeUrl"
                  value={applyForm.resumeUrl}
                  onChange={handleApplyChange}
                  placeholder="https://example.com/your-resume.pdf"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Link to your resume/CV</p>
              </div>

              {/* Error Message */}
              {applyError && (
                <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">
                  {applyError}
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeApplyModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applying}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {applying ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobList;
