import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('candidate');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const getPasswordStrength = (pwd) => {
    if (!pwd) return 0;
    let strength = 0;
    if (pwd.length >= 6) strength++;
    if (pwd.length >= 8) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[!@#$%^&*]/.test(pwd)) strength++;
    return strength;
  };

  const validateField = (field, value) => {
    const newErrors = { ...errors };

    if (field === 'name') {
      if (!value) {
        newErrors.name = 'Name is required';
      } else if (value.trim().length < 2) {
        newErrors.name = 'Name must be at least 2 characters';
      } else {
        delete newErrors.name;
      }
    }

    if (field === 'email') {
      if (!value) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        newErrors.email = 'Invalid email format';
      } else {
        delete newErrors.email;
      }
    }

    if (field === 'password') {
      if (!value) {
        newErrors.password = 'Password is required';
      } else if (value.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      } else {
        delete newErrors.password;
      }
      setPasswordStrength(getPasswordStrength(value));
      if (confirmPassword && value !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      } else if (confirmPassword) {
        delete newErrors.confirmPassword;
      }
    }

    if (field === 'confirmPassword') {
      if (!value) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (value !== password) {
        newErrors.confirmPassword = 'Passwords do not match';
      } else {
        delete newErrors.confirmPassword;
      }
    }

    setErrors(newErrors);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!name || name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Valid email is required';
    }

    if (!password || password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      await register({ name, email, password, role });
      setMessage('Account created successfully! Redirecting to login...');
      setMessageType('success');
      setTimeout(() => navigate('/login'), 1500);
    } catch (error) {
      const serverErrors = error.response?.data?.errors;
      if (serverErrors?.length) {
        setMessage(serverErrors.map((e) => e.msg).join(', '));
      } else {
        setMessage(error.response?.data?.message || 'Signup failed. Please try again.');
      }
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const strengthLabels = ['', 'Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = [
    '',
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-blue-500',
    'bg-green-500',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Left Side - Brand & Features */}
          <div className="hidden md:block">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">RecruitHub</h1>
              <p className="text-gray-600">Your gateway to career growth or hiring excellence</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">For Job Seekers</p>
                  <p className="text-sm text-gray-600">Apply to jobs and track your applications</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">For Recruiters</p>
                  <p className="text-sm text-gray-600">Post jobs and manage applicants</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Free to Use</p>
                  <p className="text-sm text-gray-600">No hidden fees or subscriptions required</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Signup Form */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h2>
            <p className="text-gray-600 mb-6">Join thousands of professionals on RecruitHub</p>

            {/* Message Alert */}
            {message && (
              <div className={`mb-6 p-4 rounded-lg flex items-start space-x-3 ${
                messageType === 'error'
                  ? 'bg-red-50 border border-red-200'
                  : 'bg-green-50 border border-green-200'
              }`}>
                {messageType === 'error' ? (
                  <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
                <p className={messageType === 'error' ? 'text-red-700' : 'text-green-700'}>
                  {message}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Account Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  I'm a...
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`flex items-center space-x-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                    role === 'candidate'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="role"
                      value="candidate"
                      checked={role === 'candidate'}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm font-medium text-gray-700">Job Seeker</span>
                  </label>

                  <label className={`flex items-center space-x-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                    role === 'recruiter'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="role"
                      value="recruiter"
                      checked={role === 'recruiter'}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm font-medium text-gray-700">Recruiter</span>
                  </label>
                </div>
              </div>

              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    validateField('name', e.target.value);
                  }}
                  onBlur={() => validateField('name', name)}
                  placeholder="John Doe"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.name
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300 bg-white'
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    validateField('email', e.target.value);
                  }}
                  onBlur={() => validateField('email', email)}
                  placeholder="you@example.com"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.email
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300 bg-white'
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      validateField('password', e.target.value);
                    }}
                    onBlur={() => validateField('password', password)}
                    placeholder="••••••••"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors pr-10 ${
                      errors.password
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-300 bg-white'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-14-14zM17.448 7.246l.896.447C18.896 8.167 20 10.355 20 12.617 20 17.955 15.582 22 10 22S0 17.955 0 12.617c0-.897.156-1.762.45-2.592l.898.450A9.111 9.111 0 001 12.617C1 17.429 5.03 21 10 21s9-3.571 9-8.383a8.981 8.981 0 00-.552-3.378zM5.5 10.75a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>
                {password && (
                  <div className="mt-2">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="h-1 flex-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${strengthColors[passwordStrength]}`}
                          style={{ width: `${(passwordStrength / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-600">
                        {strengthLabels[passwordStrength]}
                      </span>
                    </div>
                  </div>
                )}
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      validateField('confirmPassword', e.target.value);
                    }}
                    onBlur={() => validateField('confirmPassword', confirmPassword)}
                    placeholder="••••••••"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors pr-10 ${
                      errors.confirmPassword
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-300 bg-white'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-14-14zM17.448 7.246l.896.447C18.896 8.167 20 10.355 20 12.617 20 17.955 15.582 22 10 22S0 17.955 0 12.617c0-.897.156-1.762.45-2.592l.898.450A9.111 9.111 0 001 12.617C1 17.429 5.03 21 10 21s9-3.571 9-8.383a8.981 8.981 0 00-.552-3.378zM5.5 10.75a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || Object.keys(errors).length > 0}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? (
                  <span className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Creating account...</span>
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            {/* Footer Links */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-center text-gray-600 text-sm">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;