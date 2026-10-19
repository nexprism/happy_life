import crypto from 'crypto';
import User from '../models/user.js';
import sendEmail from '../utils/sendEmail.js';

// Cryptographically secure 6-digit OTP
const generateOtp = () => crypto.randomInt(100000, 1000000).toString();

// SEND OTP
export const sendOtp = async (req, res) => {
  try {
    const { email, phone, type } = req.body;

    if (!type || (type !== 'email' && type !== 'mobile')) {
      return res.status(400).json({ success: false, message: "Type must be 'email' or 'mobile'" });
    }

    if (type === 'mobile') {
      return res.status(501).json({ 
        success: false, 
        message: 'SMS OTP service is currently not supported. Please use email verification.' 
      });
    }

    const identifier = email;
    if (!identifier) {
      return res.status(400).json({ success: false, message: "email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    let otp = generateOtp();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    user.otpAttempts = 0; // reset attempts
    await user.save();

    await sendEmail(email, `Your OTP is ${otp}`, 'OTP Verification');

    return res.status(200).json({ success: true, message: `OTP sent to your email` });
  } catch (err) {
    console.error('❌ sendOtp Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// VERIFY OTP
export const verifyOtp = async (req, res) => {
  try {
    const { email, phone, otp } = req.body;

    if (!otp || (!email && !phone)) {
      return res.status(400).json({ success: false, message: "OTP and email or phone are required" });
    }

    // Increment in Mongo atomically, so concurrent guesses share one budget.
    const user = await User.findOneAndUpdate(email ? { email } : { phone },
      { $inc: { otpAttempts: 1 } }, { new: true });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check failed attempts cap (max 5)
    if (user.otpAttempts > 5) {
      user.otp = null;
      user.otpExpiry = null;
      user.otpAttempts = 0;
      await user.save();
      return res.status(429).json({ 
        success: false, 
        message: 'Too many failed attempts. Please request a new OTP.' 
      });
    }

    if (user.otp !== otp || user.otpExpiry < Date.now()) {
      await user.save();
      const remaining = Math.max(0, 5 - user.otpAttempts);
      return res.status(400).json({ 
        success: false, 
        message: `Invalid or expired OTP. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.` 
      });
    }

    // Mark verified
    if (email) user.emailVerified = true;
    if (phone) user.mobileVerified = true;

    // Clear OTP fields & attempts
    user.otp = null;
    user.otpExpiry = null;
    user.otpAttempts = 0;
    await user.save();

    return res.status(200).json({ success: true, message: 'OTP verified successfully' });
  } catch (err) {
    console.error('❌ verifyOtp Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};
