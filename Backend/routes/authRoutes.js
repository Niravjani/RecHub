const express = require('express');
const { body } = require('express-validator');
const {
  register,
  login,
  getMe,
  updateMe,
} = require('../controllers/authController');

// ✅ NEW — import the two new password-reset handlers
const {
  forgotPassword,
  resetPassword,
} = require("../controllers/authPasswordController");

const router = express.Router();
const auth = require('../middleware/auth');

// Validation rules
const registerValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['candidate', 'recruiter']).withMessage('Invalid role specified'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').exists().withMessage('Password is required'),
];

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', auth, getMe);
router.patch('/me', auth, [
  body('name').optional().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').optional().isEmail().withMessage('Please provide a valid email'),
  body('phone').optional().trim(),
  body('headline').optional().trim(),
  body('location').optional().trim(),
  body('bio').optional().trim(),
  body('skills').optional().trim(),
  body('companyName').optional().trim(),
  body('companyWebsite').optional().trim(),
  body('companyIndustry').optional().trim(),
  body('companySize').optional().trim(),
], updateMe);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password",  resetPassword);
 

module.exports = router;