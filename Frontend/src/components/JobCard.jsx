import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { applicationsAPI } from '../services/api';

const JobCard = ({ job }) => {
  const { user } = useAuth();
  const isCandidate = user?.role === 'candidate';

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ aboutYourself: '', resumeUrl: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateForm = () => {
    if (!formData.aboutYourself.trim()) {
      setError('Please tell us about yourself');
      return false;
    }
    if (!formData.resumeUrl.trim()) {
      setError('Resume URL is required');
      return false;
    }
    if (formData.aboutYourself.length < 20) {
      setError('Please write at least 20 characters about yourself');
      return false;
    }
    return true;
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await applicationsAPI.apply({ ...formData, jobId: job._id });
      setShowModal(false);
      setFormData({ aboutYourself: '', resumeUrl: '' });
      alert('Application submitted successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to apply');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200">
        {/* Header with Company Badge */}
        <div className="p-6 pb-4">
          {/* Company and Location Row */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">{job.company}</p>
              <div className="flex items-center gap-2 mt-1">
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
                <span className="text-sm text-gray-600">{job.location}</span>
              </div>
            </div>
            {job.type && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                {job.type}
              </span>
            )}
          </div>

          {/* Job Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
            {job.title}
          </h2>

          {/* Job Description Preview */}
          {job.description && (
            <p className="text-gray-600 text-sm line-clamp-2 mb-4">
              {job.description}
            </p>
          )}

          {/* Salary and Experience */}
          <div className="flex flex-wrap gap-4 mb-4">
            {job.salary && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.16 5.314l4.897-.957A1 1 0 0 1 14 5.316V7.5a1 1 0 0 1-.97 1 7 7 0 0 0-6.929 6.929 1 1 0 0 1-1 .97H2.5a1 1 0 0 1-.995-1.1A9 9 0 0 1 8.16 5.314Z" />
                </svg>
                <span className="text-sm font-semibold text-gray-800">{job.salary}</span>
              </div>
            )}
            {job.experienceLevel && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.5 1.5H5.75A2.25 2.25 0 0 0 3.5 3.75v12.5A2.25 2.25 0 0 0 5.75 18.5h8.5a2.25 2.25 0 0 0 2.25-2.25V6.5m-12-3h8m-8 4h8m-8 4h5" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-sm font-semibold text-gray-800">{job.experienceLevel}</span>
              </div>
            )}
          </div>

          {/* Tags/Skills */}
          {job.skills && job.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {job.skills.slice(0, 3).map((skill, index) => (
                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                  {skill}
                </span>
              ))}
              {job.skills.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                  +{job.skills.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer with Actions */}
        <div className="bg-gray-50 px-6 py-4 flex gap-3 border-t border-gray-100">
          <Link 
            to={`/jobs/${job._id}`} 
            className="flex-1 text-center text-blue-600 hover:text-blue-700 font-semibold py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors"
          >
            View Details
          </Link>
          {isCandidate && (
            <button
              onClick={() => setShowModal(true)}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-2 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 active:scale-95 shadow-md"
            >
              Apply Now
            </button>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8 rounded-t-2xl">
              <h3 className="text-3xl font-bold">Apply Now</h3>
              <p className="text-blue-100 mt-2">{job.title}</p>
              <p className="text-blue-100 text-sm opacity-90">{job.company} • {job.location}</p>
            </div>

            {/* Form */}
            <form onSubmit={handleApply} className="p-8 space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm flex items-start gap-3">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

             {/* Write about yourself */}
<div>
  <label className="block text-sm font-semibold text-gray-900 mb-3">
    About yourself
  </label>
  <textarea
    value={formData.aboutYourself}
    onChange={(e) => setFormData({ ...formData, aboutYourself: e.target.value })}
    placeholder="Tell us about your experience, skills, and why you're interested in this role..."
    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none transition-colors"
    rows="5"
    required
  />
  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
    <span className="text-blue-600">ℹ</span>
    Minimum 20 characters (Share your skills and interest)
  </p>
</div>

              {/* Resume URL */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Resume / CV URL
                </label>
                <input
                  type="url"
                  value={formData.resumeUrl}
                  onChange={(e) => setFormData({ ...formData, resumeUrl: e.target.value })}
                  placeholder="https://drive.google.com/... or https://dropbox.com/..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors"
                  required
                />
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <span className="text-blue-600">ℹ</span>
                  Share a link to your resume (Google Drive, Dropbox, etc.)
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Application</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default JobCard;