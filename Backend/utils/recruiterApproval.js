const isRecruiterApproved = (user) => {
  if (!user || user.role !== 'recruiter') {
    return false;
  }

  const rawUser = typeof user.toObject === 'function' ? user.toObject() : user;
  const hasIsApprovedField = Object.prototype.hasOwnProperty.call(rawUser, 'isApproved');

  // Legacy recruiter records created before the approval system existed
  // should still be considered approved.
  if (!hasIsApprovedField) {
    return true;
  }

  return Boolean(user.isApproved) ||
    Boolean(user.approvedAt) ||
    Boolean(user.approvedBy) ||
    user.status === 'approved';
};

const normalizeRecruiterApproval = async (user) => {
  if (!user || user.role !== 'recruiter') {
    return user;
  }

  const approved = isRecruiterApproved(user);

  if (approved && !user.isApproved) {
    user.isApproved = true;
    if (typeof user.save === 'function') {
      await user.save({ validateBeforeSave: false });
    }
  } else {
    user.isApproved = approved;
  }

  return user;
};

module.exports = {
  isRecruiterApproved,
  normalizeRecruiterApproval,
};