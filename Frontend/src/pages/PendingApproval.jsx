import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PendingApproval = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-xl shadow-2xl p-12 text-center space-y-6">
          {/* Icon */}
          <div className="text-6xl">⏳</div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-900">
            Account Pending Approval
          </h1>

          {/* Message */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <p className="text-yellow-800 text-lg font-medium mb-2">
              Your recruiter account is under review
            </p>
            <p className="text-yellow-700">
              Our admin team is verifying your company details and credentials. 
              This usually takes 24-48 hours.
            </p>
          </div>

          {/* What's happening */}
          <div className="bg-blue-50 rounded-lg p-6 text-left space-y-3">
            <h2 className="font-semibold text-gray-900 text-lg mb-3">
              What happens next?
            </h2>
            <div className="space-y-3">
              <div className="flex gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="font-medium text-gray-900">Admin Review</p>
                  <p className="text-gray-600 text-sm">
                    We verify company information and recruiter credentials
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-2xl">📧</span>
                <div>
                  <p className="font-medium text-gray-900">Get Notified</p>
                  <p className="text-gray-600 text-sm">
                    You'll receive an email once your account is approved
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-2xl">🚀</span>
                <div>
                  <p className="font-medium text-gray-900">Start Hiring</p>
                  <p className="text-gray-600 text-sm">
                    Post jobs and manage applications immediately after approval
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Support */}
          <div className="bg-gray-50 rounded-lg p-6">
            <p className="text-gray-700 mb-3">
              Need help? Contact our support team
            </p>
            <a
              href="mailto:support@recruitment.com"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              support@recruitment.com
            </a>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-6">
            <button
              onClick={handleLogout}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Logout
            </button>
            <button
              onClick={() => navigate('/jobs')}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              View Jobs
            </button>
          </div>

          {/* Info */}
          <p className="text-gray-600 text-sm pt-4">
            You won't be able to post jobs or manage applications until your account is approved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PendingApproval;
