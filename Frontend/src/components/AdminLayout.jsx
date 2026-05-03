import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/admin/dashboard',
      icon: '📊',
    },
    {
      name: 'Users',
      path: '/admin/users',
      icon: '👥',
    },
    {
      name: 'Jobs',
      path: '/admin/jobs',
      icon: '💼',
    },
    {
      name: 'Applications',
      path: '/admin/applications',
      icon: '📋',
    },
    {
      name: 'Recruiter Approvals',
      path: '/admin/recruiter-approvals',
      icon: '⏳',
    },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gray-900 text-white transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <h1 className={`font-bold text-lg ${!sidebarOpen && 'hidden'}`}>
              Admin Panel
            </h1>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 hover:bg-gray-800 rounded"
            >
              {sidebarOpen ? '←' : '→'}
            </button>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 rounded transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-gray-800 text-gray-300'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                {sidebarOpen && <span className="ml-3">{item.name}</span>}
              </Link>
            ))}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center px-4 py-3 rounded hover:bg-red-600 transition-colors ${
              sidebarOpen ? 'justify-start' : 'justify-center'
            }`}
          >
            <span className="text-xl">🚪</span>
            {sidebarOpen && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {menuItems.find((item) => isActive(item.path))?.name || 'Admin'}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;
