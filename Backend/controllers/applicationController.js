// const { validationResult } = require('express-validator');
// const Application = require('../models/Application');
// const Job = require('../models/Job');

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// const RECRUITER_ROLES = ['recruiter', 'admin'];

// /** Roles allowed to update status (not candidates). */
// const assertRecruiter = (user, res) => {
//   if (!RECRUITER_ROLES.includes(user.role)) {
//     res.status(403).json({
//       success: false,
//       message: 'Only recruiters can perform this action',
//     });
//     return false;
//   }
//   return true;
// };

// // ─── @desc    Apply to a job
// // ─── @route   POST /api/applications
// // ─── @access  Private — candidates
// exports.applyToJob = async (req, res, next) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ success: false, errors: errors.array() });
//     }

//     const { jobId, coverLetter, resumeUrl } = req.body;

//     const job = await Job.findById(jobId);
//     if (!job) {
//       return res.status(404).json({ success: false, message: 'Job not found' });
//     }
//     if (!job.isActive) {
//       return res.status(400).json({
//         success: false,
//         message: 'This job is no longer accepting applications',
//       });
//     }

//     const duplicate = await Application.findOne({
//       job: jobId,
//       applicant: req.user._id,
//     });

//     if (duplicate) {
//       return res.status(400).json({
//         success: false,
//         message: 'You have already applied to this job',
//       });
//     }

//     const application = await Application.create({
//       job: jobId,
//       jobTitle: job.title,
//       company: job.company,
//       applicant: req.user._id,
//       applicantName: req.user.name,
//       applicantEmail: req.user.email,
//       coverLetter,
//       resumeUrl,
//       status: 'applied',
//     });

//     await Job.findByIdAndUpdate(jobId, { $inc: { applicantCount: 1 } });

//     return res.status(201).json({
//       success: true,
//       data: application,
//     });
//   } catch (error) {
//     if (error.code === 11000) {
//       return res.status(400).json({
//         success: false,
//         message: 'You have already applied to this job',
//       });
//     }
//     next(error);
//   }
// };

// // ─── @desc    Get current user's applications
// // ─── @route   GET /api/applications/me
// // ─── @access  Private — candidates
// exports.getUserApplications = async (req, res, next) => {
//   try {
//     const { status, page = 1, limit = 10 } = req.query;

//     const filter = { applicant: req.user._id };
//     if (status) filter.status = status;

//     const skip = (Number(page) - 1) * Number(limit);

//     const [applications, total] = await Promise.all([
//       Application.find(filter)
//         .populate('job', 'title company location jobType salaryMin salaryMax isActive deadline')
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(Number(limit)),
//       Application.countDocuments(filter),
//     ]);

//     return res.status(200).json({
//       success: true,
//       count: applications.length,
//       total,
//       pages: Math.ceil(total / Number(limit)),
//       currentPage: Number(page),
//       data: applications,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // ─── @desc    Get all applications for a job
// // ─── @route   GET /api/applications/job/:jobId
// // ─── @access  Private — recruiter (job owner) or admin
// exports.getJobApplications = async (req, res, next) => {
//   try {
//     if (!assertRecruiter(req.user, res)) return;

//     const { status, page = 1, limit = 20 } = req.query;
//     const { jobId } = req.params;

//     // Verify the job belongs to this recruiter (unless admin)
//     const job = await Job.findById(jobId);
//     if (!job) {
//       return res.status(404).json({ success: false, message: 'Job not found' });
//     }
//     if (req.user.role !== 'admin' && job.postedBy.toString() !== req.user._id.toString()) {
//       return res.status(403).json({ success: false, message: 'Not authorised to view applications for this job' });
//     }

//     const filter = { job: jobId };
//     if (status) filter.status = status;

//     const skip = (Number(page) - 1) * Number(limit);

//     const [applications, total] = await Promise.all([
//       Application.find(filter)
//         .populate('applicant', 'name email phone profile')
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(Number(limit)),
//       Application.countDocuments(filter),
//     ]);

//     return res.status(200).json({
//       success: true,
//       count: applications.length,
//       total,
//       pages: Math.ceil(total / Number(limit)),
//       currentPage: Number(page),
//       job: { id: job._id, title: job.title, company: job.company },
//       data: applications,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // ─── @desc    Update an application's status
// // ─── @route   PATCH /api/applications/:id/status
// // ─── @access  Private — recruiter (job owner) or admin
// exports.updateApplicationStatus = async (req, res, next) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ success: false, errors: errors.array() });
//     }

//     if (!assertRecruiter(req.user, res)) return;

//     const { status, feedback, rating, note } = req.body;

//     const application = await Application.findById(req.params.id).populate('job', 'postedBy');
//     if (!application) {
//       return res.status(404).json({ success: false, message: 'Application not found' });
//     }

//     // Only job owner or admin can update
//     if (
//       req.user.role !== 'admin' &&
//       application.job.postedBy.toString() !== req.user._id.toString()
//     ) {
//       return res.status(403).json({
//         success: false,
//         message: 'Not authorised to update this application',
//       });
//     }

//     // Set updater for middleware
//     application._updatedBy = req.user._id;

//     // Optional note (used inside middleware)
//     if (note) application._note = note;

//     // Update status (middleware will validate + push history)
//     if (status) application.status = status;

//     // Optional recruiter inputs
//     if (feedback !== undefined) application.feedback = feedback;
//     if (rating !== undefined) application.rating = rating;

//     // Set reviewed fields if first time
//     if (!application.reviewedAt) {
//       application.reviewedAt = new Date();
//       application.reviewedBy = req.user._id;
//     }

//     await application.save();

//     const updated = await Application.findById(application._id)
//       .populate('applicant', 'name email');

//     return res.status(200).json({
//       success: true,
//       data: updated,
//     });

//   } catch (error) {
//     if (error.message && error.message.startsWith('Invalid status transition')) {
//       return res.status(400).json({
//         success: false,
//         message: error.message,
//       });
//     }

//     return res.status(500).json({
//       success: false,
//       message: error.message || 'Server Error',
//     });
//   }
// };





const { validationResult } = require('express-validator');
const Application = require('../models/Application');
const Job = require('../models/Job');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const RECRUITER_ROLES = ['recruiter', 'admin'];

/** Only recruiters or admins can perform certain actions */
const assertRecruiter = (user, res) => {
  if (!RECRUITER_ROLES.includes(user.role)) {
    res.status(403).json({
      success: false,
      message: 'Only recruiters can perform this action',
    });
    return false;
  }
  return true;
};

// ─── @desc    Apply to a job
// ─── @route   POST /api/applications/apply/:jobId
// ─── @access  Private — candidates
exports.applyToJob = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // jobId comes from the route param, optional fields from body
    const { jobId } = req.params;
    const { coverLetter, resumeUrl } = req.body;

    // 1. Find the job
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // 2. Check if job is still active
    if (!job.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This job is no longer accepting applications',
      });
    }

    // 3. Prevent duplicate application (double-check before DB unique index)
    const duplicate = await Application.findOne({
      job: jobId,
      applicant: req.user._id,
    });
    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied to this job',
      });
    }

    // 4. Create the application
    const application = await Application.create({
      job: jobId,
      jobTitle: job.title,
      company: job.company,
      applicant: req.user._id,
      applicantName: req.user.name,
      applicantEmail: req.user.email,
      coverLetter,
      resumeUrl,
      status: 'applied',
    });

    // 5. Increment applicant count on the job
    await Job.findByIdAndUpdate(jobId, { $inc: { applicantCount: 1 } });

    return res.status(201).json({
      success: true,
      data: application,
    });
  } catch (error) {
    // Catch DB-level duplicate (unique index)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied to this job',
      });
    }
    next(error);
  }
};

// ─── @desc    Get current user's own applications
// ─── @route   GET /api/applications/me
// ─── @access  Private — candidates
exports.getUserApplications = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { applicant: req.user._id };
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .populate('job', 'title company location jobType salaryMin salaryMax isActive deadline')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Application.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      count: applications.length,
      total,
      pages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Get all applications for a specific job
// ─── @route   GET /api/applications/job/:jobId
// ─── @access  Private — recruiter (job owner) or admin
exports.getJobApplications = async (req, res, next) => {
  try {
    if (!assertRecruiter(req.user, res)) return;

    const { status, page = 1, limit = 20 } = req.query;
    const { jobId } = req.params;

    // 1. Find the job
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Match Job model field: postedBy
    if (req.user.role !== 'admin' && job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorised to view applications for this job',
      });
    }

    const filter = { job: jobId };
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .populate('applicant', 'name email phone profile')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Application.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      count: applications.length,
      total,
      pages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      job: { id: job._id, title: job.title, company: job.company },
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Get ALL applications (admin only)
// ─── @route   GET /api/applications/all
// ─── @access  Private — admin only
exports.getAllApplications = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admins only.',
      });
    }

    const { status, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .populate('applicant', 'name email')
        .populate({
          path: 'job',
          select: 'title company postedBy',
          populate: { path: 'postedBy', select: 'name email' },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Application.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      count: applications.length,
      total,
      pages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Update an application's status
// ─── @route   PATCH /api/applications/:id/status
// ─── @access  Private — recruiter (job owner) or admin
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    if (!assertRecruiter(req.user, res)) return;

    const { status, feedback, rating, note } = req.body;

    // Populate job's postedBy field for ownership check
    const application = await Application.findById(req.params.id).populate('job', 'postedBy');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Match Job model field: postedBy
    if (
      req.user.role !== 'admin' &&
      application.job.postedBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorised to update this application',
      });
    }

    // Pass updater + note to pre('save') middleware via instance properties
    application._updatedBy = req.user._id;
    if (note) application._note = note;

    if (status) application.status = status;
    if (feedback !== undefined) application.feedback = feedback;
    if (rating !== undefined) application.rating = rating;

    if (!application.reviewedAt) {
      application.reviewedAt = new Date();
      application.reviewedBy = req.user._id;
    }

    await application.save();

    const updated = await Application.findById(application._id)
      .populate('applicant', 'name email');

    return res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    if (error.message && error.message.startsWith('Invalid status transition')) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};