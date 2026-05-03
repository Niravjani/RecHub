const express = require('express');
const { body } = require('express-validator');
const {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
} = require('../controllers/jobController');

const router = express.Router();
const auth = require('../middleware/auth');

// Validation rules
const jobValidation = [
  body('title').notEmpty().withMessage('Job title is required'),
  body('company').notEmpty().withMessage('Company name is required'),
  body('location').notEmpty().withMessage('Location is required'),
  body('description').notEmpty().withMessage('Job description is required'),
];

router.get('/', getJobs);
router.get('/:id', getJob);
router.post('/', auth, jobValidation, createJob);
router.put('/:id', auth, jobValidation, updateJob);
router.delete('/:id', auth, deleteJob);

module.exports = router;