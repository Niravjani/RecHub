import { useState, useEffect } from 'react';
import JobCard from '../components/JobCard';
import { jobsAPI } from '../services/api';

const JobListings = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await jobsAPI.getJobs();
        const jobsData = response.data.data || [];
        setJobs(jobsData);
      } catch (err) {
        console.error('Failed to load jobs:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load jobs');
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">Loading jobs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Job Listings</h1>
      {jobs.length === 0 ? (
        <div className="text-center text-gray-500">No jobs available</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map(job => (
            <JobCard key={job._id || job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
};

export default JobListings;