// const User = require('../models/User');
// const jwt = require('jsonwebtoken');
// const { validationResult } = require('express-validator');
// const { normalizeRecruiterApproval } = require('../utils/recruiterApproval');

// // Generate JWT Token
// const generateToken = (id) => {
//   return jwt.sign({ id }, process.env.JWT_SECRET, {
//     expiresIn: '30d',
//   });
// };

// // @desc    Register user
// // @route   POST /api/auth/register
// // @access  Public
// exports.register = async (req, res, next) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ success: false, errors: errors.array() });
//     }

//     const { name, email, password, role } = req.body;

//     // Check if user exists
//     const userExists = await User.findOne({ email });
//     if (userExists) {
//       return res.status(400).json({
//         success: false,
//         message: 'User already exists',
//       });
//     }

//     // Create user
//     const user = await User.create({
//       name,
//       email,
//       password,
//       role: role || 'candidate', // Default role is candidate
//     });

//     const token = generateToken(user._id);

//     res.status(201).json({
//       success: true,
//       token,
//       data: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         isApproved: user.isApproved,
//         approvedAt: user.approvedAt,
//         approvedBy: user.approvedBy,
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // @desc    Login user
// // @route   POST /api/auth/login
// // @access  Public
// exports.login = async (req, res, next) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ success: false, errors: errors.array() });
//     }

//     const { email, password } = req.body;

//     // Check for user
//     const user = await User.findOne({ email }).select('+password');
//     if (!user) {
//       console.log(`[LOGIN] User not found: ${email}`);
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid credentials',
//       });
//     }

//     console.log(`[LOGIN] User found: ${email}`);

//     // Check if password matches
//     const isMatch = await user.comparePassword(password);
//     console.log(`[LOGIN] Password match for ${email}: ${isMatch}`);
    
//     if (!isMatch) {
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid credentials',
//       });
//     }

//     await normalizeRecruiterApproval(user);
//     const token = generateToken(user._id);

//     res.status(200).json({
//       success: true,
//       token,
//       data: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         isApproved: user.isApproved,
//         approvedAt: user.approvedAt,
//         approvedBy: user.approvedBy,
//       },
//     });
//   } catch (error) {
//     console.error('[LOGIN] Error:', error);
//     next(error);
//   }
// };

// // @desc    Get current logged in user
// // @route   GET /api/auth/me
// // @access  Private
// exports.getMe = async (req, res, next) => {
//   try {
//     const user = await User.findById(req.user.id);
//     await normalizeRecruiterApproval(user);

//     res.status(200).json({
//       success: true,
//       data: user,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // @desc    Update current logged in user profile
// // @route   PATCH /api/auth/me
// // @access  Private
// exports.updateMe = async (req, res, next) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ success: false, errors: errors.array() });
//     }

//     const user = await User.findById(req.user.id);
//     if (!user) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }

//     const {
//       name,
//       email,
//       phone,
//       headline,
//       location,
//       bio,
//       skills,
//       experience,
//       education,
//       resume,
//       companyName,
//       companyWebsite,
//       companyIndustry,
//       companySize,
//     } = req.body;

//     if (name) user.name = name;
//     if (email) user.email = email.toLowerCase();
//     if (phone !== undefined) user.phone = phone;

//     if (user.role === 'candidate') {
//       user.profile = user.profile || {};
//       if (headline !== undefined) user.profile.headline = headline;
//       if (location !== undefined) user.profile.location = location;
//       if (bio !== undefined) user.profile.bio = bio;
//       if (experience !== undefined) user.profile.experience = experience;
//       if (education !== undefined) user.profile.education = education;
//       if (resume !== undefined) user.profile.resume = resume;
//       if (skills !== undefined) {
//         user.profile.skills = Array.isArray(skills)
//           ? skills.map((skill) => skill.trim()).filter(Boolean)
//           : String(skills).split(',').map((skill) => skill.trim()).filter(Boolean);
//       }
//     }

//     if (user.role === 'recruiter') {
//       user.company = user.company || {};
//       if (companyName !== undefined) user.company.name = companyName;
//       if (companyWebsite !== undefined) user.company.website = companyWebsite;
//       if (companyIndustry !== undefined) user.company.industry = companyIndustry;
//       if (companySize !== undefined) user.company.size = companySize;
//     }

//     await user.save();

//     res.status(200).json({
//       success: true,
//       data: user,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { normalizeRecruiterApproval } = require('../utils/recruiterApproval');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// ================= REGISTER =================
exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password, role } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'candidate',
      isApproved: role === 'recruiter' ? false : true, // ✅ important fix
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// ================= LOGIN =================
exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    await normalizeRecruiterApproval(user);

    // ❗ Important: block unapproved recruiters
    if (user.role === 'recruiter' && !user.isApproved) {
      return res.status(403).json({
        success: false,
        message: 'Recruiter not approved yet',
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// ================= GET ME =================
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    await normalizeRecruiterApproval(user);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// ================= UPDATE PROFILE =================
exports.updateMe = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const {
      name,
      email,
      phone,
      headline,
      location,
      bio,
      skills,
      experience,
      education,
      resume,
      companyName,
      companyWebsite,
      companyIndustry,
      companySize,
    } = req.body;

    // Basic fields
    if (name) user.name = name;
    if (email) user.email = email.toLowerCase();
    if (phone !== undefined) user.phone = phone;

    // Candidate fields
    if (user.role === 'candidate') {
      user.profile = user.profile || {};

      if (headline !== undefined) user.profile.headline = headline;
      if (location !== undefined) user.profile.location = location;
      if (bio !== undefined) user.profile.bio = bio;
      if (experience !== undefined) user.profile.experience = experience;
      if (education !== undefined) user.profile.education = education;
      if (resume !== undefined) user.profile.resume = resume;

      if (skills !== undefined) {
        user.profile.skills = Array.isArray(skills)
          ? skills.map((s) => s.trim()).filter(Boolean)
          : String(skills).split(',').map((s) => s.trim()).filter(Boolean);
      }
    }

    // Recruiter fields
    if (user.role === 'recruiter') {
      user.company = user.company || {};

      if (companyName !== undefined) user.company.name = companyName;
      if (companyWebsite !== undefined) user.company.website = companyWebsite;
      if (companyIndustry !== undefined) user.company.industry = companyIndustry;
      if (companySize !== undefined) user.company.size = companySize;
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};