import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

/**
 * EmailService handles sending different types of emails from different sender addresses for Happy Life Astro.
 * 
 * Transactional: noreply@happylifeastro.school (process.env.TransactionalEmail / process.env.TransactionalEmailPass)
 * Founder/Casual: founder@happylifeastro.school (process.env.FounderEmail / process.env.FounderEmailPass)
 * Support: support@happylifeastro.school (process.env.SupportEmail / process.env.SupportEmailPass)
 */
class EmailService {
  constructor() {
    // Log environment variables for debugging (avoid logging passwords in production)
    //console.log("SMTP Configuration:", {
    //   host: process.env.SMTP_HOST,
    //   port: process.env.SMTP_PORT,
    //   secure: process.env.SMTP_SECURE,
    //   TransactionalEmail: process.env.TransactionalEmail,
    //   FounderEmail: process.env.FounderEmail,
    //   SupportEmail: process.env.SupportEmail,
    // });

    // Prepare transporters for each sender
    this.transporters = {
      transactional: nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.TransactionalEmail,
          pass: process.env.TransactionalEmailPass,
        },
      }),
      founder: nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.FounderEmail,
          pass: process.env.FounderEmailPass,
        },
      }),
      support: nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SupportEmail,
          pass: process.env.SupportEmailPass,
        },
      }),
    };
  }

  /**
   * Helper to get the correct "from" field for each type of email.
   */
  getFrom(type = "transactional") {
    const appName = process.env.EMAIL_SENDER_NAME || "Happy Life Astro";
    switch (type) {
      case "transactional":
        return `"${appName}" <${process.env.TransactionalEmail || "noreply@happylifeastro.school"}>`;
      case "founder":
        return `"Dr. Yogesh Sharma (${appName})" <${process.env.FounderEmail || "founder@happylifeastro.school"}>`;
      case "support":
        return `"${appName} Support" <${process.env.SupportEmail || "support@happylifeastro.school"}>`;
      default:
        return `"${appName}" <${process.env.TransactionalEmail || "noreply@happylifeastro.school"}>`;
    }
  }

  /**
   * Helper to get the correct transporter for each type of email.
   */
  getTransporter(type = "transactional") {
    if (type === "transactional") return this.transporters.transactional;
    if (type === "founder") return this.transporters.founder;
    if (type === "support") return this.transporters.support;
    return this.transporters.transactional;
  }

  /**
   * Send OTP/verification email (Transactional)
   */
  async sendOtpEmail(email, otp, userName = 'User') {
    const mailOptions = {
      from: this.getFrom("transactional"),
      to: email,
      subject: 'Happy Life Astro - Your OTP for Verification',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>OTP Verification - Happy Life Astro</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 30px 10px;">
                <table role="presentation" style="width: 100%; max-width: 550px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 30px 40px; text-align: center;">
                      <h1 style="color: #fbbf24; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 1px;">HAPPY LIFE ASTRO</h1>
                      <p style="color: #94a3b8; margin: 6px 0 0 0; font-size: 13px; font-weight: 500;">Account Verification Code</p>
                    </td>
                  </tr>
                  <!-- Content -->
                  <tr>
                    <td style="padding: 36px 40px; color: #334155;">
                      <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.5;">
                        Hello <strong style="color: #0f172a;">${userName}</strong>,
                      </p>
                      <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #475569;">
                        Please use the following One-Time Password (OTP) to complete your verification on Happy Life Astro:
                      </p>
                      
                      <!-- OTP Box -->
                      <div style="background: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 10px; padding: 20px; text-align: center; margin: 24px 0;">
                        <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #2563eb;">${otp}</span>
                        <p style="margin: 8px 0 0 0; font-size: 12px; color: #64748b;">Valid for 10 minutes</p>
                      </div>

                      <p style="margin: 24px 0 0 0; font-size: 13px; line-height: 1.5; color: #64748b;">
                        If you didn't request this code, you can safely ignore this email or contact our support team.
                      </p>
                    </td>
                  </tr>
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                      <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.5;">
                        This is an automated security message from <strong>Happy Life Astro</strong>.<br>
                        Need help? Contact <a href="mailto:${process.env.SupportEmail || 'support@happylifeastro.school'}" style="color: #2563eb; text-decoration: none;">${process.env.SupportEmail || 'support@happylifeastro.school'}</a>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    try {
      const info = await this.getTransporter("transactional").sendMail(mailOptions);
      //console.log('✅ OTP email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Error sending OTP email:', error);
      throw new Error(`Failed to send OTP email: ${error.message}`);
    }
  }

  /**
   * Send password reset email (Transactional)
   */
  async sendPasswordResetEmail(email, resetToken, userName) {
    const resetUrl = `${process.env.FRONTEND_URL || "https://happylifeastro.school"
      }/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: this.getFrom("transactional"),
      to: email,
      subject: "Password Reset Request",
      html: `
       <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset - Happy Life Astro</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td style="padding: 20px 0;">
                <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #191a17; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                    
                    <!-- Header with Logo -->
                    <tr>
                        <td style="background-color: #2171B5; padding: 30px 40px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">Happy Life Astro</h1>
                            <p style="color: #e0e0e0; margin: 5px 0 0 0; font-size: 14px;">Password Reset Request</p>
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 40px; color: #ffffff;">
                            <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.5;">
                                Hello <strong style="color: #60a5fa;">${userName}</strong>,
                            </p>
                            
                            <p style="margin: 0 0 25px 0; font-size: 16px; line-height: 1.5;">
                                We received a request to reset your password for your Happy Life Astro account. If you made this request, click the button below to create a new password.
                            </p>
                            
                            <!-- Reset Button -->
                            <table role="presentation" style="margin: 30px 0;">
                                <tr>
                                    <td style="text-align: center;">
                                        <a href="${resetUrl}" style="display: inline-block; padding: 15px 30px; background-color: #2171B5; color: #ffffff; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px; text-align: center; transition: background-color 0.3s ease;">
                                            Reset My Password
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Alternative Link -->
                            <div style="background-color: #2a2b28; padding: 20px; border-radius: 8px; margin: 25px 0;">
                                <p style="margin: 0 0 10px 0; font-size: 14px; color: #cccccc;">
                                    If the button doesn't work, copy and paste this link into your browser:
                                </p>
                                <p style="margin: 0; word-break: break-all; font-size: 14px;">
                                    <a href="${resetUrl}" style="color: #60a5fa; text-decoration: underline;">${resetUrl}</a>
                                </p>
                            </div>
                            
                            <!-- Security Notice -->
                            <div style="border-left: 4px solid #2171B5; padding-left: 20px; margin: 25px 0;">
                                <p style="margin: 0 0 10px 0; font-size: 14px; color: #ff9999; font-weight: bold;">
                                    ⏰ Important Security Notice
                                </p>
                                <p style="margin: 0; font-size: 14px; line-height: 1.4; color: #cccccc;">
                                    This reset link will expire in <strong>1 hour</strong> for your security.
                                </p>
                            </div>
                            
                            <p style="margin: 25px 0 0 0; font-size: 16px; line-height: 1.5;">
                                If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #0f100e; padding: 30px 40px; text-align: center; border-top: 2px solid #2171B5;">
                            <p style="margin: 0 0 15px 0; color: #60a5fa; font-size: 18px; font-weight: bold;">
                                Happy Life Astro
                            </p>
                            <p style="margin: 0; font-size: 12px; color: #888888; line-height: 1.4;">
                                This is an automated email, please do not reply.<br>
                                If you need help, contact our support team.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
      `,
    };

    try {
      const info = await this.getTransporter("transactional").sendMail(mailOptions);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("❌ Error sending email:", error);
      throw new Error(`Failed to send reset email: ${error.message}`);
    }
  }

  /**
   * Send order confirmation email (Transactional)
   */
  async sendOrderConfirmationEmail(email, name, password) {
    const mailOptions = {
      from: this.getFrom("transactional"),
      to: email,
      subject: "Course Enrollment Confirmation",
      html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>Happy Life Astro - Course Enrollment Confirmation</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>Thank you for enrolling in our course! Your enrollment is now confirmed and you can start learning right away.</p>
        ${
        password !== null && password !== undefined && password !== ''
          ? `
          <p>Your login details are as follows:</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Password:</strong> ${password}</p>
          <a href="${process.env.FRONTEND_URL || 'https://happylifeastro.school'}/login" style="padding: 10px 15px; background-color: #2171B5; color: white; border: none; border-radius: 5px; cursor: pointer; text-decoration: none;">
            Login to your account
          </a>
          `
          : ''
        }
        <p>Once logged in, you can access your enrolled courses from your dashboard and begin your learning journey.</p>
        <p>If you have any questions or need assistance, feel free to contact our support team.</p>
        <hr />
        <p style="font-size: 12px; color: #777;">This is an automated email from Happy Life Astro, please do not reply.</p>
      </div>
      `,
    };

    try {
      const info = await this.getTransporter("transactional").sendMail(mailOptions);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("❌ Error sending email:", error);
      throw new Error(
        `Failed to send order confirmation email: ${error.message}`
      );
    }
  }

  /**
   * Send enrollment mail (not order confirmation, just enrollment info)
   */
  async sendEnrollmentMail(email, name, courseTitle) {
    const mailOptions = {
      from: this.getFrom("transactional"),
      to: email,
      subject: "Welcome to Happy Life Astro – Enrollment Successful!",
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Enrollment Successful - Happy Life Astro</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arial', sans-serif; background-color: #ffffff; color: #000000; line-height: 1.6; }
        .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 2px solid #2171B5; }
        .header { background-color: #1e293b; color: #ffffff; padding: 30px 40px; text-align: center; }
        .logo { font-size: 28px; font-weight: bold; letter-spacing: 1px; margin-bottom: 5px; color: #60a5fa; }
        .tagline { font-size: 14px; font-weight: normal; opacity: 0.9; }
        .content { padding: 40px; background-color: #ffffff; }
        .greeting { font-size: 20px; font-weight: bold; margin-bottom: 25px; color: #000000; }
        .message-text { font-size: 16px; margin-bottom: 20px; color: #333333; }
        .highlight-box { background-color: #f8fafc; border-left: 4px solid #2171B5; padding: 20px; margin: 30px 0; }
        .highlight-text { font-size: 16px; font-style: italic; color: #000000; }
        .course-title { font-size: 18px; font-weight: bold; color: #2171B5; margin-bottom: 10px; }
        .download-section { text-align: center; margin: 40px 0; padding: 30px 20px; background-color: #1e293b; color: #ffffff; border-radius: 8px; }
        .download-title { font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #ffffff; }
        .download-btn { display: inline-block; padding: 12px 25px; background-color: #2171B5; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 16px; border-radius: 5px; }
        .signature { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; }
        .signature-text { font-size: 16px; margin-bottom: 5px; }
        .signature-name { font-weight: bold; color: #000000; }
        .footer { background-color: #0f172a; color: #ffffff; padding: 20px 40px; text-align: center; }
        .support-info { font-size: 14px; margin-bottom: 10px; }
        .support-email { color: #60a5fa; text-decoration: none; font-weight: bold; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">HAPPY LIFE ASTRO</div>
            <div class="tagline">Online Learning Platform</div>
        </div>
        <div class="content">
            <div class="greeting">Hi ${name},</div>
            <p class="message-text">Congratulations! You have been successfully enrolled in:</p>
            <div class="course-title">${courseTitle || "Your Course"}</div>
            <div class="highlight-box">
                <p class="highlight-text">We're thrilled to have you join us. Your learning journey starts now!</p>
            </div>
          
            <div class="download-section">
                <div class="download-title">Access Your Course</div>
                <a href="${process.env.FRONTEND_URL || 'https://happylifeastro.school'}/dashboard" class="download-btn" target="_blank">Go to Student Dashboard</a>
            </div>
            <p class="message-text">If you have any questions or need assistance, our support team is here for you.</p>
            <div class="signature">
                <p class="signature-text">Warm regards,</p>
                <p class="signature-name">Happy Life Astro Team</p>
            </div>
        </div>
        <div class="footer">
            <p class="support-info">Need help? Contact us at</p>
            <a href="mailto:${process.env.SupportEmail || 'support@happylifeastro.school'}" class="support-email">${process.env.SupportEmail || 'support@happylifeastro.school'}</a>
        </div>
    </div>
</body>
</html>
      `,
    };

    try {
      const info = await this.getTransporter("transactional").sendMail(mailOptions);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("❌ Error sending enrollment mail:", error);
      throw new Error(`Failed to send enrollment mail: ${error.message}`);
    }
  }

  /**
   * Send event registration email (Founder for event/casual, Transactional if login details)
   * If password is provided, it's a new user, so use transactional. Otherwise, use founder.
   */
  async sendEventRegistrationEmail(email, name, eventDetails, password = null) {
    // If password is present, it's a transactional email (new user), else it's a founder/casual info email
    const fromType = password ? "transactional" : "founder";

    // Format human-readable date & time
    let formattedDate = "";
    if (eventDetails.startDate) {
      try {
        const d = new Date(eventDetails.startDate);
        formattedDate = d.toLocaleString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
      } catch (e) {
        formattedDate = String(eventDetails.startDate);
      }
    }

    const online = eventDetails.onlineLink || {};
    const hasOnlineLink = Boolean(online.url);
    const venue = eventDetails.venue || {};
    const venueAddress = [venue.name, venue.address, venue.city, venue.country]
      .filter(Boolean)
      .join(", ");

    const mailOptions = {
      from: this.getFrom(fromType),
      to: email,
      subject: `Registration Confirmed: ${eventDetails.title}`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Event Registration Confirmation</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
          <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f8fafc; padding: 24px 0;">
            <tr>
              <td align="center" style="padding: 16px;">
                <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 32px 36px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Happy Life Astro</h1>
                      <div style="display: inline-block; background-color: rgba(255,255,255,0.2); color: #ffffff; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; padding: 4px 12px; border-radius: 9999px; margin-top: 10px;">
                        Event Registration Confirmed
                      </div>
                    </td>
                  </tr>

                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 36px 36px 24px 36px;">
                      <p style="margin: 0 0 16px 0; font-size: 16px; color: #334155;">
                        Hello <strong>${name || "Attendee"}</strong>,
                      </p>
                      <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #475569;">
                        You have successfully registered for <strong>${eventDetails.title}</strong>! Below are your session and joining details:
                      </p>

                      <!-- Event Info Box -->
                      <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f1f5f9; border-radius: 12px; margin-bottom: 24px;">
                        <tr>
                          <td style="padding: 18px 20px;">
                            ${formattedDate ? `
                              <div style="font-size: 12px; color: #64748b; margin-bottom: 4px; font-weight: 600; text-transform: uppercase;">Date & Time</div>
                              <div style="font-size: 15px; color: #0f172a; font-weight: 700; margin-bottom: 12px;">📅 ${formattedDate}</div>
                            ` : ''}
                            ${venueAddress ? `
                              <div style="font-size: 12px; color: #64748b; margin-bottom: 4px; font-weight: 600; text-transform: uppercase;">Location / Venue</div>
                              <div style="font-size: 14px; color: #0f172a; font-weight: 600;">📍 ${venueAddress}</div>
                            ` : ''}
                          </td>
                        </tr>
                      </table>

                      <!-- Online Meeting Details Card (Highlighted) -->
                      ${hasOnlineLink ? `
                        <div style="background-color: #eff6ff; border: 2px solid #bfdbfe; border-radius: 14px; padding: 24px; margin-bottom: 24px;">
                          <div style="font-size: 12px; font-weight: 800; color: #1d4ed8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">
                            🎥 Online Live Session Details
                          </div>
                          
                          <table role="presentation" style="width: 100%; border-collapse: collapse; font-size: 14px; color: #1e293b; margin-bottom: 18px;">
                            ${online.platform ? `
                              <tr>
                                <td style="padding: 6px 0; color: #64748b; font-weight: 600; width: 120px;">Platform:</td>
                                <td style="padding: 6px 0; font-weight: 700; text-transform: uppercase;">${online.platform}</td>
                              </tr>
                            ` : ''}
                            ${online.meetingId ? `
                              <tr>
                                <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Meeting ID:</td>
                                <td style="padding: 6px 0; font-family: monospace; font-size: 15px; font-weight: 700; color: #0f172a;">${online.meetingId}</td>
                              </tr>
                            ` : ''}
                            ${online.password ? `
                              <tr>
                                <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Passcode / Key:</td>
                                <td style="padding: 6px 0; font-family: monospace; font-size: 15px; font-weight: 700; color: #0f172a;">${online.password}</td>
                              </tr>
                            ` : ''}
                          </table>

                          <!-- Join Button -->
                          <div style="text-align: center; margin-top: 8px;">
                            <a href="${online.url}" target="_blank" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 15px; box-shadow: 0 4px 12px rgba(37,99,235,0.3);">
                              👉 Join Live Meeting
                            </a>
                          </div>
                          <div style="text-align: center; margin-top: 10px;">
                            <a href="${online.url}" target="_blank" style="font-size: 12px; color: #2563eb; word-break: break-all;">
                              ${online.url}
                            </a>
                          </div>
                        </div>
                      ` : ''}

                      <!-- Login Credentials (if new user created) -->
                      ${password ? `
                        <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px; padding: 18px 20px; margin-bottom: 24px;">
                          <div style="font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 8px;">
                            Your Portal Login Credentials:
                          </div>
                          <div style="font-size: 13px; color: #334155; margin-bottom: 4px;"><strong>Email:</strong> ${email}</div>
                          <div style="font-size: 13px; color: #334155;"><strong>Temporary Password:</strong> <code style="background-color: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${password}</code></div>
                        </div>
                      ` : ''}

                      <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5;">
                        Please save this email for your reference. If you have any questions or need technical support before the event, reply to this email or reach out to our team.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8fafc; padding: 24px 36px; text-align: center; border-top: 1px solid #e2e8f0;">
                      <p style="margin: 0 0 6px 0; font-size: 12px; color: #94a3b8; font-weight: 600;">
                        Happy Life Astro • Guidance & Learning
                      </p>
                      <p style="margin: 0; font-size: 11px; color: #cbd5e1;">
                        This is an automated confirmation sent upon successful event registration.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    try {
      const info = await this.getTransporter(fromType).sendMail(mailOptions);
      //console.log("✅ Event registration email sent:", info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("❌ Error sending email:", error);
      throw new Error(
        `Failed to send event registration email: ${error.message}`
      );
    }
  }

  /**
   * Send job proposal email to job creator (job feature is user-to-user, not from platform)
   * This email is sent from the applicant to the job creator, using the applicant's email as the "from" address.
   * Happy Life Astro only relays the email, it is not a proposal to Happy Life Astro.
   */
  async sendJobProposalEmail(jobCreatorEmail, jobCreatorName, jobTitle, proposalDetails, applicant) {
    // applicant: { name, email }
    const attachments = [];
    if (proposalDetails.cv) {
      attachments.push({
        filename: "CV.pdf",
        path: proposalDetails.cv, // Should be a file path or URL accessible to the server
      });
    }

    const mailOptions = {
      from: this.getFrom("support"),
      to: jobCreatorEmail,
      replyTo: applicant.email,
      subject: `New Proposal for Your Job: "${jobTitle}" from ${applicant.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          <h2>New Proposal for Your Job</h2>
          <p>Hello <strong>${jobCreatorName}</strong>,</p>
          <p><strong>${applicant.name}</strong> has submitted a proposal for your job post: <strong>${jobTitle}</strong>.</p>
          <p><strong>Proposal Details:</strong></p>
          <ul>
            <li><strong>Cover Letter:</strong> ${proposalDetails.coverLetter || "N/A"}</li>
            <li><strong>Proposed Amount:</strong> ${proposalDetails.proposedAmount ? proposalDetails.proposedAmount : "N/A"}</li>
            <li><strong>Status:</strong> ${proposalDetails.status || "pending"}</li>
            <li><strong>Submitted At:</strong> ${proposalDetails.submittedAt ? new Date(proposalDetails.submittedAt).toLocaleString() : "N/A"}</li>
            <li><strong>Applicant Email:</strong> ${applicant.email}</li>
          </ul>
          ${proposalDetails.cv
          ? `<p><strong>CV is attached to this email.</strong></p>`
          : ""
        }
          <p>You can reply directly to this email to contact the applicant.</p>
          <hr />
          <p style="font-size: 12px; color: #777;">This is an automated email, please do not reply.</p>
        </div>
      `,
      attachments,
      replyTo: applicant.email,
    };

    try {
      const info = await this.getTransporter("support").sendMail(mailOptions);
      //console.log("✅ Job proposal email relayed to job creator:", info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("❌ Error relaying job proposal email:", error);
      throw new Error(`Failed to relay job proposal email: ${error.message}`);
    }
  }
}

export default new EmailService();
