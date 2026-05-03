const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User   = require("../models/User"); // adjust path to match your project

// ─────────────────────────────────────────────────────────────────
//  POST /api/auth/forgot-password
// ─────────────────────────────────────────────────────────────────
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await User.findOne({ email });

    // Always return the same generic response to prevent user enumeration
    if (!user) {
      return res.status(200).json({
        message: "If an account exists, a reset link has been sent.",
      });
    }

    // 1. Generate a plain (unhashed) random token — sent to user
    const resetToken = crypto.randomBytes(32).toString("hex");

    // 2. Hash the token before saving to DB — never store plain tokens
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // 3. Persist hashed token + 15-min expiry
    user.resetPasswordToken  = hashedToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    // 4. Build reset URL using the PLAIN token (user needs it unhashed)
    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

    // TODO: Replace console.log with your email service (SendGrid, Nodemailer, etc.)
    console.log("─── PASSWORD RESET LINK ───");
    console.log(resetUrl);
    console.log("────────────────────────────");

    return res.status(200).json({
      message: "If an account exists, a reset link has been sent.",
    });
  } catch (err) {
    console.error("forgotPassword error:", err);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
};

// ─────────────────────────────────────────────────────────────────
//  POST /api/auth/reset-password
// ─────────────────────────────────────────────────────────────────
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: "Token and new password are required." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    // 1. Hash the incoming plain token to compare against DB
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // 2. Find user whose token matches AND hasn't expired
    const user = await User.findOne({
      resetPasswordToken:  hashedToken,
      resetPasswordExpire: { $gt: Date.now() }, // must still be in the future
    });

    if (!user) {
      return res.status(400).json({
        message: "Reset link is invalid or has expired. Please request a new one.",
      });
    }

    // 3. Hash new password
    const salt         = await bcrypt.genSalt(10);
    user.password      = await bcrypt.hash(password, salt);

    // 4. Clear reset token fields
    user.resetPasswordToken  = null;
    user.resetPasswordExpire = null;

    await user.save();

    return res.status(200).json({ message: "Password reset successful." });
  } catch (err) {
    console.error("resetPassword error:", err);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
};

module.exports = { forgotPassword, resetPassword };