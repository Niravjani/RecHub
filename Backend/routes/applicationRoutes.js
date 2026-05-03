// const express = require('express');
// const { body, param, query } = require('express-validator');
// const auth = require('../middleware/auth');
// const {
//   applyToJob,
//   getUserApplications,
//   getJobApplications,
//   updateApplicationStatus,
// } = require('../controllers/applicationController');

// const router = express.Router();

// // ─── Validation rule sets ─────────────────────────────────────────────────────

// const VALID_STATUSES = ['applied', 'reviewed', 'shortlisted', 'interview', 'offered', 'hired', 'rejected'];

// const applyValidation = [
//   body('jobId')
//     .notEmpty().withMessage('jobId is required')
//     .isMongoId().withMessage('Invalid job ID'),
//   body('coverLetter')
//     .optional()
//     .isString()
//     .isLength({ max: 2000 }).withMessage('Cover letter cannot exceed 2000 characters'),
//   body('resumeUrl')
//     .optional()
//     .isURL().withMessage('Resume URL must be a valid URL'),
// ];

// const statusValidation = [
//   param('id')
//     .isMongoId().withMessage('Invalid application ID'),
//   body('status')
//     .notEmpty().withMessage('status is required')
//     .isIn(VALID_STATUSES).withMessage(`status must be one of: ${VALID_STATUSES.join(', ')}`),
//   body('feedback')
//     .optional()
//     .isString()
//     .isLength({ max: 1000 }).withMessage('Feedback cannot exceed 1000 characters'),
//   body('rating')
//     .optional()
//     .isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5'),
//   body('note')
//     .optional()
//     .isString()
//     .isLength({ max: 500 }).withMessage('Note cannot exceed 500 characters'),
// ];

// const jobIdParamValidation = [
//   param('jobId').isMongoId().withMessage('Invalid job ID'),
// ];

// const paginationValidation = [
//   query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
//   query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
//   query('status').optional().isIn(VALID_STATUSES).withMessage(`status must be one of: ${VALID_STATUSES.join(', ')}`),
// ];

// // ─── Routes ───────────────────────────────────────────────────────────────────

// // POST   /api/applications             → candidate applies to a job
// router.post('/', auth, applyValidation, applyToJob);

// // GET    /api/applications/me          → candidate views their own applications
// router.get('/me', auth, paginationValidation, getUserApplications);

// // GET    /api/applications/job/:jobId  → recruiter views applications for a job
// router.get('/job/:jobId', auth, [...jobIdParamValidation, ...paginationValidation], getJobApplications);

// // PATCH  /api/applications/:id/status  → recruiter updates application status
// router.patch('/:id/status', auth, statusValidation, updateApplicationStatus);

// module.exports = router;




const express = require('express');
const { body, param, query } = require('express-validator');

const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck'); // 👈 ADD THIS

const {
  applyToJob,
  getUserApplications,
  getJobApplications,
  getAllApplications, // 👈 ADD THIS (admin)
  updateApplicationStatus,
} = require('../controllers/applicationController');

const router = express.Router();

// ─── Constants ────────────────────────────────────────────────────────────────

const VALID_STATUSES = [
  'applied',
  'reviewed',
  'shortlisted',
  'interview',
  'offered',
  'hired',
  'rejected'
];

// ─── Validation ───────────────────────────────────────────────────────────────

const applyValidation = [
  param('jobId')
    .isMongoId().withMessage('Invalid job ID'),

  body('coverLetter')
    .optional()
    .isString()
    .isLength({ max: 2000 }),

  body('resumeUrl')
    .optional()
    .isURL().withMessage('Resume must be valid URL'),
];

const jobIdParamValidation = [
  param('jobId').isMongoId().withMessage('Invalid job ID'),
];

const paginationValidation = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(VALID_STATUSES),
];

// ─── ROUTES ───────────────────────────────────────────────────────────────────

// ✅ 1. Candidate applies
// POST /api/apply/:jobId
router.post(
  '/apply/:jobId',
  auth,
  roleCheck('candidate'),
  applyValidation,
  applyToJob
);

// ✅ 2. Candidate sees own applications
router.get(
  '/me',
  auth,
  roleCheck('candidate'),
  paginationValidation,
  getUserApplications
);

// ✅ 3. Recruiter sees job applications
// GET /api/applications/job/:jobId
router.get(
  '/job/:jobId',
  auth,
  roleCheck('recruiter', 'admin'),
  [...jobIdParamValidation, ...paginationValidation],
  getJobApplications
);

// ✅ 4. Admin sees ALL applications
// GET /api/applications/all
router.get(
  '/all',
  auth,
  roleCheck('admin'),
  paginationValidation,
  getAllApplications
);

// ✅ 5. Recruiter or admin updates status
router.patch(
  '/:id/status',
  auth,
  roleCheck('recruiter', 'admin'),
  [
    param('id').isMongoId(),
    body('status').isIn(VALID_STATUSES)
  ],
  updateApplicationStatus
);

module.exports = router;