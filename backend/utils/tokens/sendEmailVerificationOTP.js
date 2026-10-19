import sendEmail from "../sendEmail.js";

const sendEmailVerificationOTP = async (req, user) => {
  const otp = Math.floor(1000 + Math.random() * 9000);
  const otpVerificationLink = `${process.env.FRONTEND_HOST || ''}/account/verify-email`;

  if (user?.email) {
    await sendEmail(
      user.email,
      `Dear ${user.name || user.fullName || 'User'}, your verification OTP is ${otp}. Verification link: ${otpVerificationLink}`,
      "OTP - Verify your account"
    );
  }

  return otp;
};

export { sendEmailVerificationOTP };
