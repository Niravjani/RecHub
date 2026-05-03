import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { applicationsAPI, jobsAPI } from '../services/api';

// Status badge
const STATUS_STYLES = {
  applied:     'bg-gray-100 text-gray-800',
  shortlisted: 'bg-blue-100 text-blue-800',
  hired:       'bg-green-100 text-green-800',
  rejected:    'bg-red-100 text-red-800',
  reviewed:    'bg-yellow-100 text-yellow-800',
  interview:   'bg-purple-100 text-purple-800',
  offered:     'bg-emerald-100 text-emerald-800',
};

const StatCard = ({ label, value, colour }) => (
  <div className={`rounded-lg p-5 ${colour}`}>
    <p className="text-3xl font-bold">{value}</p>
    <p className="text-sm mt-1 capitalize">{label}</p>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const isCandidate = user?.role === 'candidate';

  const [recent, setRecent] = useState([]);
  const [stats, setStats] = useState({});
  const [loadingApps, setLoadingApps] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  // Candidates: fetch recent applications + compute simple stats
  useEffect(() => {
    if (!isCandidate) return;

    const load = async () => {
      setLoadingApps(true);
      try {
        const res = await applicationsAPI.getMyApplications({ limit: 5 });
        const apps = res.data.data || [];
        setRecent(apps);

        // Compute per-status counts from the full list (total per page is at most 5;
        // for a real dashboard you'd hit a dedicated stats endpoint — good next step)
        const counts = {};
        apps.forEach((a) => {
          counts[a.status] = (counts[a.status] || 0) + 1;
        });
        setStats({ total: res.data.total, ...counts });
      } catch {
        // non-critical — dashboard still works without stats
      } finally {
        setLoadingApps(false);
      }
    };

    load();
  }, [isCandidate]);

  // Fetch jobs
  useEffect(() => {
    const loadJobs = async () => {
      setLoadingJobs(true);
      try {
        const res = await jobsAPI.getJobs();
        const allJobs = res.data.data || [];
        if (isCandidate) {
          // Show first 3 available jobs
          setJobs(allJobs.slice(0, 3));
        } else {
          // Recruiter: show jobs created by them
          setJobs(allJobs.filter(job => job.recruiter === user._id));
        }
      } catch {
        // non-critical
      } finally {
        setLoadingJobs(false);
      }
    };

    loadJobs();
  }, [isCandidate, user]);

  return (
    <div className="container mx-auto p-6 max-w-5xl pb-32">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
      <p className="text-gray-600 mb-8">
        Welcome back, <span className="font-semibold text-gray-800">{user?.name}</span>!
      </p>

      {/* ── Candidate view ──────────────────────────────────────── */}
      {isCandidate && (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="total applied" value={stats.total ?? '—'} colour="bg-white shadow-md" />
            <StatCard label="shortlisted"   value={stats.shortlisted ?? 0} colour="bg-indigo-50" />
            <StatCard label="interview"     value={stats.interview   ?? 0} colour="bg-purple-50" />
            <StatCard label="offered / hired" value={(stats.offered ?? 0) + (stats.hired ?? 0)} colour="bg-green-50" />
          </div>

          {/* Recent applications */}
          <div className="bg-white shadow-md rounded-lg p-5 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Recent Applications</h2>
              <Link to="/applications" className="text-sm text-blue-600 hover:underline">
                View all →
              </Link>
            </div>

            {loadingApps && <p className="text-sm text-gray-500">Loading...</p>}

            {!loadingApps && recent.length === 0 && (
              <p className="text-sm text-gray-500">
                No applications yet.{' '}
                <Link to="/jobs" className="text-blue-600 hover:underline">Browse jobs</Link>.
              </p>
            )}

            {!loadingApps && recent.length > 0 && (
              <ul className="divide-y">
                {recent.map((app) => (
                  <li key={app._id} className="py-3 flex items-center justify-between">
                    <div>
                      <Link
                        to={`/jobs/${app.job?._id || app.job}`}
                        className="font-medium text-gray-800 hover:text-blue-600"
                      >
                        {app.jobTitle || app.job?.title}
                      </Link>
                      <p className="text-xs text-gray-500">{app.company || app.job?.company}</p>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full capitalize ${STATUS_STYLES[app.status] || 'bg-gray-100 text-gray-800'}`}>
                      {app.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Available Jobs */}
          <div className="bg-white shadow-md rounded-lg p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Available Jobs</h2>
              <Link to="/jobs" className="text-sm text-blue-600 hover:underline">
                View all →
              </Link>
            </div>

            {loadingJobs && <p className="text-sm text-gray-500">Loading...</p>}

            {!loadingJobs && jobs.length === 0 && (
              <p className="text-sm text-gray-500">No jobs available.</p>
            )}

            {!loadingJobs && jobs.length > 0 && (
              <ul className="divide-y">
                {jobs.map((job) => (
                  <li key={job._id} className="py-3">
                    <Link to={`/jobs/${job._id}`} className="block">
                      <div className="font-medium text-gray-800 hover:text-blue-600">{job.title}</div>
                      <p className="text-xs text-gray-500">{job.company}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      {/* ── Recruiter view ──────────────────────────────────────── */}
      {user?.role === 'recruiter' && (
        <>
          {/* Actions */}
          <div className="bg-white shadow-md rounded-lg p-5 mb-6">
            <h2 className="text-lg font-semibold mb-4">Actions</h2>
            <div className="space-y-3">
              <Link to="/post-job" className="block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-center font-medium">
                Post Job
              </Link>
              <Link to="/recruiter-dashboard" className="block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 text-center font-medium">
                Full Dashboard →
              </Link>
            </div>
          </div>

          {/* Jobs Created */}
          <div className="bg-white shadow-md rounded-lg p-5 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Recent Jobs</h2>
              <Link to="/recruiter-dashboard" className="text-sm text-blue-600 hover:underline">
                View all →
              </Link>
            </div>

            {loadingJobs && <p className="text-sm text-gray-500">Loading...</p>}

            {!loadingJobs && jobs.length === 0 && (
              <p className="text-sm text-gray-500">No jobs created yet.</p>
            )}

            {!loadingJobs && jobs.length > 0 && (
              <ul className="divide-y">
                {jobs.map((job) => (
                  <li key={job._id} className="py-3 flex items-center justify-between">
                    <div>
                      <Link to={`/jobs/${job._id}`} className="font-medium text-gray-800 hover:text-blue-600">
                        {job.title}
                      </Link>
                      <p className="text-xs text-gray-500">{job.company}</p>
                    </div>
                    <Link to={`/applicants/${job._id}`} className="text-sm text-blue-600 hover:underline">
                      View Applicants
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      {/* ── Account card (all roles) ──────────────────────────── */}
      <div className="bg-white shadow-md rounded-lg p-5">
        <h2 className="text-lg font-semibold mb-2">Account</h2>
        <p className="text-sm text-gray-600">Email: <span className="text-gray-800">{user?.email}</span></p>
        <p className="text-sm text-gray-600 capitalize">Role: <span className="text-gray-800">{user?.role}</span></p>
      </div>
    </div>
  );
};

export default Dashboard;