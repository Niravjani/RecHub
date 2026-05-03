import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobsAPI, applicationsAPI } from '../services/api';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyForm, setApplyForm] = useState({
    coverLetter: '',
    resumeUrl: '',
  });
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await jobsAPI.getJobById(id);
        setJob(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load job details');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

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
      await applicationsAPI.apply(id, {
        coverLetter: applyForm.coverLetter,
        resumeUrl: applyForm.resumeUrl,
      });

      setApplied(true);
      setShowApplyModal(false);
      setApplyForm({ coverLetter: '', resumeUrl: '' });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to apply';
      if (msg.includes('already applied')) {
        setApplied(true);
      }
      setApplyError(msg);
    } finally {
      setApplying(false);
    }
  };

  // ── Salary display helper ──
  const formatSalary = () => {
    if (!job.salaryMin && !job.salaryMax) return null;
    const fmt = (n) => `$${Number(n).toLocaleString()}`;
    if (job.salaryMin && job.salaryMax) return `${fmt(job.salaryMin)} – ${fmt(job.salaryMax)}`;
    if (job.salaryMin) return `From ${fmt(job.salaryMin)}`;
    return `Up to ${fmt(job.salaryMax)}`;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="text-center py-12">
          <div className="text-gray-500">Loading job details...</div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="bg-red-100 text-red-700 p-6 rounded-lg">
          <p className="font-semibold mb-2">Error</p>
          <p>{error || 'Job not found'}</p>
          <Link to="/jobs" className="text-red-600 hover:underline mt-4 block">
            ← Back to jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl pb-32">
      {/* Back Button */}
      <Link to="/jobs" className="text-blue-600 hover:underline mb-6 inline-block font-medium">
        ← Back to jobs
      </Link>

      {/* Job Header Card */}
      <div className="bg-white shadow-md rounded-lg p-8 mb-6">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">{job.title}</h1>
          <p className="text-xl text-blue-600 font-semibold">{job.company}</p>
          <p className="text-gray-600 text-lg">{job.location}</p>
        </div>

        {/* Meta Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {job.jobType && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">
              {job.jobType}
            </span>
          )}
          {job.experience && (
            <span className="bg-purple-100 text-purple-800 text-xs font-medium px-3 py-1 rounded-full">
              {job.experience}
            </span>
          )}
          {job.category && (
            <span className="bg-gray-100 text-gray-800 text-xs font-medium px-3 py-1 rounded-full">
              {job.category}
            </span>
          )}
        </div>

        {/* Salary */}
        {formatSalary() && (
          <p className="text-lg text-gray-800 mb-6">
            <span className="font-semibold">Salary:</span> {formatSalary()}
          </p>
        )}

        {/* Action Button */}
        <div className="pt-6 border-t border-gray-200">
          {!user && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <p className="text-blue-700">
                Please <Link to="/login" className="underline font-semibold">login</Link> to apply for this job.
              </p>
            </div>
          )}
          {user?.role === 'candidate' && (
            <button
              onClick={() => setShowApplyModal(true)}
              disabled={applied}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {applied ? '✓ Application Submitted' : 'Apply Now'}
            </button>
          )}
          {user?.role === 'recruiter' && (
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
              <p className="text-gray-700">You are viewing this as a recruiter. Candidates can apply to this job.</p>
            </div>
          )}
        </div>
      </div>

      {/* Description Card */}
      <div className="bg-white shadow-md rounded-lg p-8 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Description</h2>
        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
          {job.description}
        </p>
      </div>

      {/* Requirements Card */}
      {job.requirements?.length > 0 && (
        <div className="bg-white shadow-md rounded-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Requirements</h2>
          <ul className="list-disc list-inside space-y-2">
            {job.requirements.map((req, i) => (
              <li key={i} className="text-gray-700">
                {req}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Benefits Card */}
      {job.benefits?.length > 0 && (
        <div className="bg-white shadow-md rounded-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Benefits</h2>
          <ul className="list-disc list-inside space-y-2">
            {job.benefits.map((b, i) => (
              <li key={i} className="text-gray-700">
                {b}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recruiter Info Card */}
      {job.postedBy && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">About the Recruiter</h3>
          <div className="space-y-2">
            <p className="text-gray-700 font-medium">
              {job.postedBy.name}
            </p>
            <p className="text-gray-600">
              {job.postedBy.email}
            </p>
          </div>
        </div>
      )}

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg">
              <h3 className="text-2xl font-bold">Apply for {job.title}</h3>
              <p className="text-blue-100 mt-1">{job.company} · {job.location}</p>
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
                  onClick={() => setShowApplyModal(false)}
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

export default JobDetails;