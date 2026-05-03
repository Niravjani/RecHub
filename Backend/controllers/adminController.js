const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { validationResult } = require('express-validator');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin only)
exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role } = req.query;

    let query = {};
    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role
// @route   PATCH /api/admin/users/:userId/role
// @access  Private (Admin only)
exports.updateUserRole = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { userId } = req.params;
    const { role } = req.body;

    // Validate role
    if (!['candidate', 'recruiter', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all jobs (admin view)
// @route   GET /api/admin/jobs
// @access  Private (Admin only)
exports.getAllJobs = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    let query = {};
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    const jobs = await Job.find(query)
      .populate('postedBy', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Job.countDocuments(query);

    res.status(200).json({
      success: true,
      count: jobs.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: jobs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete job (admin)
// @route   DELETE /api/admin/jobs/:jobId
// @access  Private (Admin only)
exports.deleteJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    await job.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Job deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all applications (admin view)
// @route   GET /api/admin/applications
// @access  Private (Admin only)
exports.getAllApplications = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const applications = await Application.find(query)
      .populate('applicant', 'name email')
      .populate('job', 'title company')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Application.countDocuments(query);

    res.status(200).json({
      success: true,
      count: applications.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update application status (admin)
// @route   PATCH /api/admin/applications/:appId/status
// @access  Private (Admin only)
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { appId } = req.params;
    const { status } = req.body;

    const VALID_STATUSES = [
      'applied',
      'reviewed',
      'shortlisted',
      'interview',
      'offered',
      'hired',
      'rejected',
    ];

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
      });
    }

    const application = await Application.findById(appId);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    application.status = status;
    await application.save();

    await application.populate('applicant', 'name email');
    await application.populate('job', 'title company');

    res.status(200).json({
      success: true,
      message: 'Application status updated successfully',
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending recruiter approvals
// @route   GET /api/admin/recruiters/pending
// @access  Private (Admin only)
exports.getPendingRecruiters = async (req, res, next) => {
  try {
    const pendingRecruiters = await User.find({
      role: 'recruiter',
      isApproved: false,
    })
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: pendingRecruiters.length,
      data: pendingRecruiters,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve recruiter
// @route   PATCH /api/admin/recruiters/:recruiterId/approve
// @access  Private (Admin only)
exports.approveRecruiter = async (req, res, next) => {
  try {
    const { recruiterId } = req.params;

    const recruiter = await User.findById(recruiterId);
    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter not found',
      });
    }

    if (recruiter.role !== 'recruiter') {
      return res.status(400).json({
        success: false,
        message: 'User is not a recruiter',
      });
    }

    recruiter.isApproved = true;
    recruiter.approvedBy = req.user.id;
    recruiter.approvedAt = new Date();
    await recruiter.save();

    res.status(200).json({
      success: true,
      message: 'Recruiter approved successfully',
      data: recruiter,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject recruiter
// @route   PATCH /api/admin/recruiters/:recruiterId/reject
// @access  Private (Admin only)
exports.rejectRecruiter = async (req, res, next) => {
  try {
    const { recruiterId } = req.params;
    const { reason } = req.body;

    const recruiter = await User.findById(recruiterId);
    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter not found',
      });
    }

    if (recruiter.role !== 'recruiter') {
      return res.status(400).json({
        success: false,
        message: 'User is not a recruiter',
      });
    }

    // Optionally delete the recruiter if rejected
    // Or keep them with rejection reason
    await User.findByIdAndDelete(recruiterId);

    res.status(200).json({
      success: true,
      message: 'Recruiter rejected and removed',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

exports.getStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalJobs = await Job.countDocuments();
    const totalApplications = await Application.countDocuments();
    const pendingRecruiters = await User.countDocuments({
      role: 'recruiter',
      isApproved: false,
    });

    // Users by role
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
        },
      },
    ]);

    // Applications by status
    const applicationStatus = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Count total candidates
    const totalCandidates = await User.countDocuments({ role: 'candidate' });

    // Format response
    const usersByRoleObj = {
      candidate: 0,
      recruiter: 0,
      admin: 0,
    };
    usersByRole.forEach(item => {
      usersByRoleObj[item._id] = item.count;
    });

    const applicationStatusObj = {
      applied: 0,
      reviewed: 0,
      shortlisted: 0,
      interview: 0,
      offered: 0,
      hired: 0,
      rejected: 0,
    };
    applicationStatus.forEach(item => {
      applicationStatusObj[item._id] = item.count;
    });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalJobs,
        totalApplications,
        totalCandidates,
        pendingRecruiters,
        usersByRole: usersByRoleObj,
        applicationStatus: applicationStatusObj,
      },
    });
  } catch (error) {
    next(error);
  }
};
