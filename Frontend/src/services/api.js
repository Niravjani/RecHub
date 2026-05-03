// import axios from 'axios';

// const api = axios.create({
//   baseURL: 'http://localhost:5000/api',
// });

// // Add token to requests if available
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// export const authAPI = {
//   login: (data) => api.post('/auth/login', data),
//   register: (data) => api.post('/auth/register', data),
//   updateProfile: (data) => api.patch('/auth/me', data),
// };

// export const jobsAPI = {
//   getJobs: () => api.get('/jobs'),
//   getJobById: (id) => api.get(`/jobs/${id}`),
// };

// export const applicationsAPI = {
//   apply: (data) => api.post('/applications', data),
//   getMyApplications: (params = {}) => api.get('/applications/me', { params }),
//   getJobApplications: (jobId, params = {}) => api.get(`/applications/job/${jobId}`, { params }),
//   updateStatus: (id, data) => api.patch(`/applications/${id}/status`, data),
// };

// // Admin APIs
// export const adminAPI = {
//   // Users
//   getAllUsers: (params = {}) => api.get('/admin/users', { params }),
//   updateUserRole: (userId, data) => api.patch(`/admin/users/${userId}/role`, data),

//   // Jobs
//   getAllJobs: (params = {}) => api.get('/admin/jobs', { params }),
//   deleteJob: (jobId) => api.delete(`/admin/jobs/${jobId}`),

//   // Applications
//   getAllApplications: (params = {}) => api.get('/admin/applications', { params }),
//   updateApplicationStatus: (appId, data) => api.patch(`/admin/applications/${appId}/status`, data),

//   // Recruiter Approvals
//   getPendingRecruiters: (params = {}) => api.get('/admin/recruiters/pending', { params }),
//   approveRecruiter: (recruiterId) => api.patch(`/admin/recruiters/${recruiterId}/approve`),
//   rejectRecruiter: (recruiterId, data) => api.patch(`/admin/recruiters/${recruiterId}/reject`, data),

//   // Dashboard Stats
//   getStats: () => api.get('/admin/stats'),
// };

// export default api;


import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  updateProfile: (data) => api.patch('/auth/me', data),
};

export const jobsAPI = {
  getJobs: () => api.get('/jobs'),
  getJobById: (id) => api.get(`/jobs/${id}`),
};

export const applicationsAPI = {
  apply: (jobId, data = {}) => api.post(`/applications/apply/${jobId}`, data),
  getMyApplications: (params = {}) => api.get('/applications/me', { params }),
  getJobApplications: (jobId, params = {}) => api.get(`/applications/job/${jobId}`, { params }),
  getAllApplications: (params = {}) => api.get('/applications/all', { params }),
  updateStatus: (id, data) => api.patch(`/applications/${id}/status`, data),
};

export const adminAPI = {
  // Users
  getAllUsers: (params = {}) => api.get('/admin/users', { params }),
  updateUserRole: (userId, data) => api.patch(`/admin/users/${userId}/role`, data),

  // Jobs
  getAllJobs: (params = {}) => api.get('/admin/jobs', { params }),
  deleteJob: (jobId) => api.delete(`/admin/jobs/${jobId}`),

  // Applications — FIXED: was /admin/applications → corrected to /applications/all
  getAllApplications: (params = {}) => api.get('/applications/all', { params }),

  // Application Status — FIXED: was /admin/applications/:id/status
  updateApplicationStatus: (appId, data) => api.patch(`/applications/${appId}/status`, data),

  // Recruiter Approvals
  getPendingRecruiters: (params = {}) => api.get('/admin/recruiters/pending', { params }),
  approveRecruiter: (recruiterId) => api.patch(`/admin/recruiters/${recruiterId}/approve`),
  rejectRecruiter: (recruiterId, data) => api.patch(`/admin/recruiters/${recruiterId}/reject`, data),

  // Dashboard Stats
  getStats: () => api.get('/admin/stats'),
};

export default api;