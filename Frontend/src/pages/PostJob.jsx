import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const PostJob = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Redirect if not a recruiter
  if (user && user.role !== 'recruiter') {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="bg-red-100 text-red-700 p-4 rounded">
          Access denied. Only recruiters can post jobs.
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Job title is required');
      return false;
    }
    if (!formData.company.trim()) {
      setError('Company name is required');
      return false;
    }
    if (!formData.location.trim()) {
      setError('Location is required');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Job description is required');
      return false;
    }
    if (formData.description.length < 20) {
      setError('Description must be at least 20 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/jobs', formData);
      
      setSuccess('Job posted successfully!');
      setFormData({
        title: '',
        company: '',
        location: '',
        description: '',
      });

      // Redirect to jobs page after 2 seconds
      setTimeout(() => {
        navigate('/jobs');
      }, 2000);
    } catch (err) {
      console.error('Error posting job:', err);
      const responseData = err.response?.data;
      const validationErrors = responseData?.errors;
      const errorMsg = validationErrors && Array.isArray(validationErrors) && validationErrors.length
        ? validationErrors.map((error) => error.msg || error.message).join(', ')
        : responseData?.message || 'Failed to post job';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl pb-32">
      <h1 className="text-3xl font-bold mb-6">Post a New Job</h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 text-green-700 p-4 rounded mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        {/* Job Title */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Senior React Developer"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <p className="text-xs text-gray-500 mt-1">Enter the job title/position</p>
        </div>

        {/* Company Name */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Name
          </label>
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            placeholder="e.g., Acme Corporation"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <p className="text-xs text-gray-500 mt-1">Enter the company name</p>
        </div>

        {/* Location */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g., New York, NY"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <p className="text-xs text-gray-500 mt-1">Enter the job location</p>
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the job role, responsibilities, and requirements..."
            rows="8"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <p className="text-xs text-gray-500 mt-1">Minimum 20 characters required</p>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? 'Posting...' : 'Post Job'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/jobs')}
            className="flex-1 bg-gray-400 text-white py-2 rounded-lg hover:bg-gray-500 transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </form>

      <p className="text-sm text-gray-600 mt-4">
        Your job posting will be visible to all candidates immediately after submission.
      </p>
    </div>
  );
};

export default PostJob;