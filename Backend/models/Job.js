const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
  },
  jobType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Temporary', 'Internship'],
    default: 'Full-time',
  },
  salaryMin: Number,
  salaryMax: Number,
  currency: {
    type: String,
    default: 'USD',
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
  },
  requirements: [{
    type: String,
  }],
  benefits: [{
    type: String,
  }],
  experience: {
    type: String,
    enum: ['Entry-level', 'Mid-level', 'Senior', 'Executive'],
  },
  category: {
    type: String,
    enum: ['IT', 'HR', 'Sales', 'Marketing', 'Design', 'Finance', 'Operations', 'Other'],
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  applicantCount: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  deadline: Date,
}, {
  timestamps: true,
});

// Indexing for performance
jobSchema.index({ title: 'text', description: 'text' });
jobSchema.index({ postedBy: 1 });
jobSchema.index({ isActive: 1 });
jobSchema.index({ category: 1 });
jobSchema.index({ jobType: 1 });
jobSchema.index({ location: 1 });
jobSchema.index({ createdAt: -1 });
jobSchema.index({ isFeatured: 1, createdAt: -1 });

module.exports = mongoose.model('Job', jobSchema);