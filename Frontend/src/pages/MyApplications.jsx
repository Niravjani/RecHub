import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import { applicationsAPI } from '../services/api';

// ── Status badge colours ──────────────────────────────────────────────────────
const STATUS_STYLES = {
  applied:     'bg-gray-100 text-gray-800',
  shortlisted: 'bg-blue-100 text-blue-800',
  hired:       'bg-green-100 text-green-800',
  rejected:    'bg-red-100 text-red-800',
  reviewed:    'bg-yellow-100 text-yellow-800',
  interview:   'bg-purple-100 text-purple-800',
  offered:     'bg-emerald-100 text-emerald-800',
};

const STATUSES = ['all', 'applied', 'reviewed', 'shortlisted', 'interview', 'offered', 'hired', 'rejected'];

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      setError('');
      try {
        const params = { page, limit: 10 };
        if (filter !== 'all') params.status = filter;

        const res = await applicationsAPI.getMyApplications(params);
        setApplications(res.data.data || []);
        setPagination({ total: res.data.total, pages: res.data.pages });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load applications');
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [filter, page]);

  // Reset to page 1 when filter changes
  const handleFilterChange = (status) => {
    setFilter(status);
    setPage(1);
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl pb-32">
      <h1 className="text-3xl font-bold mb-6">My Applications</h1>

      {/* ── Filter tabs ── */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => handleFilterChange(s)}
            className={`px-3 py-1 text-sm rounded-full capitalize transition-colors ${
              filter === s
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* ── Loading / error ── */}
      {loading && <div className="text-center text-gray-500 py-8">Loading applications...</div>}
      {error && <div className="text-center text-red-600 py-8">{error}</div>}

      {/* ── Empty state ── */}
      {!loading && !error && applications.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No applications found.</p>
          <Link to="/jobs" className="text-blue-600 hover:underline font-medium">
            Browse open positions →
          </Link>
        </div>
      )}

      {/* ── Application cards ── */}
      {!loading && applications.length > 0 && (
        <div className="space-y-4">
          {applications.map((app) => (
            <Card key={app._id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <Link
                  to={`/jobs/${app.job?._id || app.job}`}
                  className="text-lg font-semibold text-blue-600 hover:underline"
                >
                  {app.jobTitle || app.job?.title || 'Untitled'}
                </Link>
                <p className="text-gray-600 text-sm">
                  {app.company || app.job?.company} · {app.job?.location}
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  Applied {new Date(app.appliedAt).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric',
                  })}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${STATUS_STYLES[app.status] || 'bg-gray-100 text-gray-800'}`}>
                  {app.status}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 rounded border disabled:opacity-40"
          >
            ← Prev
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {pagination.pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            disabled={page >= pagination.pages}
            className="px-3 py-1 rounded border disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default MyApplications;
