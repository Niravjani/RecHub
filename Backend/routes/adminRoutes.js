const express = require('express');
const { body, param } = require('express-validator');
const auth = require('../middleware/auth');
const {
  getAllUsers,
  updateUserRole,
  getAllJobs,
  deleteJob,
  getAllApplications,
  updateApplicationStatus,
  getStats,
  getPendingRecruiters,
  approveRecruiter,
  rejectRecruiter,
} = require('../controllers/adminController');

const router = express.Router();

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Only admins can access this resource',
    });
  }
  next();
};

// ─── Validation rule sets ─────────────────────────────────────────────────────

const updateRoleValidation = [
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['candidate', 'recruiter', 'admin'])
    .withMessage('Invalid role specified'),
];

const updateApplicationStatusValidation = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['applied', 'reviewed', 'shortlisted', 'interview', 'offered', 'hired', 'rejected'])
    .withMessage('Invalid status specified'),
];

// ─── Routes ───────────────────────────────────────────────────────────────────

// GET    /api/admin/stats              → get dashboard statistics
router.get('/stats', auth, isAdmin, getStats);

// GET    /api/admin/users              → get all users
router.get('/users', auth, isAdmin, getAllUsers);

// PATCH  /api/admin/users/:userId/role → update user role
router.patch('/users/:userId/role', auth, isAdmin, updateRoleValidation, updateUserRole);

// GET    /api/admin/jobs               → get all jobs
router.get('/jobs', auth, isAdmin, getAllJobs);

// DELETE /api/admin/jobs/:jobId        → delete a job
router.delete('/jobs/:jobId', auth, isAdmin, deleteJob);

// GET    /api/admin/applications       → get all applications
router.get('/applications', auth, isAdmin, getAllApplications);

// PATCH  /api/admin/applications/:appId/status → update application status
router.patch(
  '/applications/:appId/status',
  auth,
  isAdmin,
  updateApplicationStatusValidation,
  updateApplicationStatus
);

// GET    /api/admin/recruiters/pending      → get pending recruiter approvals
router.get('/recruiters/pending', auth, isAdmin, getPendingRecruiters);

// PATCH  /api/admin/recruiters/:recruiterId/approve → approve recruiter
router.patch('/recruiters/:recruiterId/approve', auth, isAdmin, approveRecruiter);

// PATCH  /api/admin/recruiters/:recruiterId/reject  → reject recruiter
router.patch('/recruiters/:recruiterId/reject', auth, isAdmin, rejectRecruiter);

module.exports = router;
