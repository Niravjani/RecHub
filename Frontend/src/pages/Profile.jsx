import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    headline: '',
    location: '',
    bio: '',
    experience: '',
    education: '',
    resume: '',
    skills: '',
    companyName: '',
    companyWebsite: '',
    companyIndustry: '',
    companySize: '',
  });

  useEffect(() => {
    if (!user) return;

    setForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      headline: user.profile?.headline || '',
      location: user.profile?.location || '',
      bio: user.profile?.bio || '',
      experience: user.profile?.experience || '',
      education: user.profile?.education || '',
      resume: user.profile?.resume || '',
      skills: user.profile?.skills?.join(', ') || '',
      companyName: user.company?.name || '',
      companyWebsite: user.company?.website || '',
      companyIndustry: user.company?.industry || '',
      companySize: user.company?.size || '',
    });
  }, [user]);

  const validateField = (field, value) => {
    const nextErrors = { ...errors };

    if (field === 'name') {
      if (!value.trim()) {
        nextErrors.name = 'Name is required';
      } else if (value.trim().length < 2) {
        nextErrors.name = 'Name must be at least 2 characters';
      } else {
        delete nextErrors.name;
      }
    }

    if (field === 'email') {
      if (!value.trim()) {
        nextErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        nextErrors.email = 'Please enter a valid email';
      } else {
        delete nextErrors.email;
      }
    }

    setErrors(nextErrors);
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const validationErrors = {};
    if (!form.name.trim()) {
      validationErrors.name = 'Name is required';
    }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      validationErrors.email = 'Valid email is required';
    }

    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
      };

      if (user?.role === 'candidate') {
        payload.headline = form.headline.trim();
        payload.location = form.location.trim();
        payload.bio = form.bio.trim();
        payload.experience = form.experience.trim();
        payload.education = form.education.trim();
        payload.resume = form.resume.trim();
        payload.skills = form.skills.split(',').map((skill) => skill.trim()).filter(Boolean);
      }

      if (user?.role === 'recruiter') {
        payload.companyName = form.companyName.trim();
        payload.companyWebsite = form.companyWebsite.trim();
        payload.companyIndustry = form.companyIndustry.trim();
        payload.companySize = form.companySize.trim();
      }

      await updateProfile(payload);
      setMessage('Profile updated successfully.');
      setMessageType('success');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to update profile.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 pb-32">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Profile</h1>
            <p className="text-gray-600 mt-1">Keep your account details and preferences up to date.</p>
          </div>
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-600 shadow-sm transition hover:bg-blue-50"
          >
            Back to dashboard
          </Link>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm">
          {message && (
            <div className={`mb-6 rounded-lg px-4 py-3 text-sm ${
              messageType === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  onBlur={(e) => validateField('name', e.target.value)}
                  className={`w-full rounded-xl border px-4 py-3 text-gray-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 ${
                    errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
                  }`}
                />
                {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onBlur={(e) => validateField('email', e.target.value)}
                  className={`w-full rounded-xl border px-4 py-3 text-gray-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 ${
                    errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
                  }`}
                />
                {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                id="phone"
                type="text"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
                placeholder="(Optional)"
              />
            </div>

            {user?.role === 'candidate' && (
              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="headline" className="block text-sm font-medium text-gray-700 mb-2">
                      Headline
                    </label>
                    <input
                      id="headline"
                      type="text"
                      value={form.headline}
                      onChange={(e) => handleChange('headline', e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
                      placeholder="Product designer with 5+ years experience"
                    />
                  </div>

                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      id="location"
                      type="text"
                      value={form.location}
                      onChange={(e) => handleChange('location', e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
                      placeholder="Remote / New York"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-2">
                    Skills
                  </label>
                  <input
                    id="skills"
                    type="text"
                    value={form.skills}
                    onChange={(e) => handleChange('skills', e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
                    placeholder="React, Node.js, Tailwind CSS"
                  />
                </div>

                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                    Professional Bio
                  </label>
                  <textarea
                    id="bio"
                    value={form.bio}
                    onChange={(e) => handleChange('bio', e.target.value)}
                    rows="4"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
                    placeholder="Write a short professional summary"
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">
                      Experience
                    </label>
                    <input
                      id="experience"
                      type="text"
                      value={form.experience}
                      onChange={(e) => handleChange('experience', e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
                      placeholder="5 years at startup teams"
                    />
                  </div>

                  <div>
                    <label htmlFor="education" className="block text-sm font-medium text-gray-700 mb-2">
                      Education
                    </label>
                    <input
                      id="education"
                      type="text"
                      value={form.education}
                      onChange={(e) => handleChange('education', e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
                      placeholder="BS in Computer Science"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="resume" className="block text-sm font-medium text-gray-700 mb-2">
                    Resume URL
                  </label>
                  <input
                    id="resume"
                    type="url"
                    value={form.resume}
                    onChange={(e) => handleChange('resume', e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
                    placeholder="https://example.com/resume.pdf"
                  />
                </div>
              </div>
            )}

            {user?.role === 'recruiter' && (
              <div className="space-y-6">
                <div className="text-sm font-medium text-gray-800">Company Profile</div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name
                    </label>
                    <input
                      id="companyName"
                      type="text"
                      value={form.companyName}
                      onChange={(e) => handleChange('companyName', e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
                      placeholder="Acme Talent"
                    />
                  </div>

                  <div>
                    <label htmlFor="companyWebsite" className="block text-sm font-medium text-gray-700 mb-2">
                      Company Website
                    </label>
                    <input
                      id="companyWebsite"
                      type="url"
                      value={form.companyWebsite}
                      onChange={(e) => handleChange('companyWebsite', e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
                      placeholder="https://acme.example.com"
                    />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="companyIndustry" className="block text-sm font-medium text-gray-700 mb-2">
                      Industry
                    </label>
                    <input
                      id="companyIndustry"
                      type="text"
                      value={form.companyIndustry}
                      onChange={(e) => handleChange('companyIndustry', e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
                      placeholder="Fintech, Healthcare, SaaS"
                    />
                  </div>

                  <div>
                    <label htmlFor="companySize" className="block text-sm font-medium text-gray-700 mb-2">
                      Company Size
                    </label>
                    <input
                      id="companySize"
                      type="text"
                      value={form.companySize}
                      onChange={(e) => handleChange('companySize', e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
                      placeholder="50-200 employees"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Saving profile...' : 'Save Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
