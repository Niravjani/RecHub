import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    setUserMenuOpen(false);
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  const isCandidate = user?.role === 'candidate';
  const isRecruiter = user?.role === 'recruiter';
  const isAdmin = user?.role === 'admin';

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link
            to="/"
            className="text-white text-2xl font-bold hover:text-blue-100 transition-colors"
          >
            RecruitHub
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Main Links */}
            <div className="flex items-center space-x-6">
              <Link
                to="/jobs"
                className="text-blue-100 hover:text-white transition-colors font-medium"
              >
                Jobs
              </Link>

              {isAuthenticated && (
                <>
                  {isCandidate && (
                    <Link
                      to="/dashboard"
                      className="text-blue-100 hover:text-white transition-colors font-medium"
                    >
                      Dashboard
                    </Link>
                  )}

                  {isRecruiter && (
                    <Link
                      to="/recruiter-dashboard"
                      className="text-blue-100 hover:text-white transition-colors font-medium"
                    >
                      Dashboard
                    </Link>
                  )}

                  {isCandidate && (
                    <Link
                      to="/applications"
                      className="text-blue-100 hover:text-white transition-colors font-medium"
                    >
                      My Applications
                    </Link>
                  )}

                  {isAdmin && (
                    <Link
                      to="/admin/dashboard"
                      className="text-yellow-200 hover:text-white transition-colors font-medium bg-orange-600 px-3 py-1 rounded-lg"
                    >
                      🔐 Admin Panel
                    </Link>
                  )}
                </>
              )}
            </div>

            {/* Auth Section */}
            {isAuthenticated ? (
              <div className="relative flex items-center space-x-4 pl-6 border-l border-blue-400">
                {/* User Avatar & Name Button */}
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-2 hover:bg-blue-500 px-3 py-2 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-white text-sm font-semibold">
                      {user?.name}
                    </p>
                    <p className="text-blue-100 text-xs">
                      {isCandidate ? 'Candidate' : isRecruiter ? 'Recruiter' : 'User'}
                    </p>
                  </div>
                  <svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {/* User Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-10">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-gray-800 font-semibold">{user?.name}</p>
                      <p className="text-gray-600 text-xs">{user?.email}</p>
                      <p className="text-gray-600 text-xs capitalize mt-1">
                        Role: {user?.role}
                      </p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors text-sm"
                    >
                      Profile
                    </Link>

                    {isRecruiter && (
                      <Link
                        to="/post-job"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors text-sm"
                      >
                        Post a Job
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors text-sm border-t border-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3 pl-6 border-l border-blue-400">
                <Link
                  to="/login"
                  className="text-white hover:text-blue-100 transition-colors font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-blue-600 bg-white hover:bg-blue-50 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden text-white hover:text-blue-100 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 space-y-2 border-t border-blue-400 pt-4">
            <Link
              to="/jobs"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-white hover:bg-blue-500 px-3 py-2 rounded transition-colors"
            >
              Jobs
            </Link>

            {isAuthenticated ? (
              <>
                {isCandidate && (
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-white hover:bg-blue-500 px-3 py-2 rounded transition-colors"
                  >
                    Dashboard
                  </Link>
                )}

                {isRecruiter && (
                  <Link
                    to="/recruiter-dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-white hover:bg-blue-500 px-3 py-2 rounded transition-colors"
                  >
                    Dashboard
                  </Link>
                )}

                {isCandidate && (
                  <Link
                    to="/applications"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-white hover:bg-blue-500 px-3 py-2 rounded transition-colors"
                  >
                    My Applications
                  </Link>
                )}

                {isRecruiter && (
                  <Link
                    to="/post-job"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-white hover:bg-blue-500 px-3 py-2 rounded transition-colors"
                  >
                    Post a Job
                  </Link>
                )}

                <div className="bg-blue-500 px-3 py-2 rounded mt-2">
                  <p className="text-white text-sm font-semibold">{user?.name}</p>
                  <p className="text-blue-100 text-xs">{user?.email}</p>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full text-left text-white hover:bg-blue-500 px-3 py-2 rounded transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-white hover:bg-blue-500 px-3 py-2 rounded transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-blue-600 bg-white hover:bg-blue-50 px-3 py-2 rounded transition-colors font-medium text-center"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;