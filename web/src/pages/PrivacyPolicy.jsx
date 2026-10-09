import React, { useEffect } from 'react';
import gsap from 'gsap';

const PrivacyPolicy = () => {
  useEffect(() => {
    gsap.fromTo('.privacy-animate',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.2, ease: 'power3.out' }
    );
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="privacy-animate text-4xl md:text-5xl font-newsreader font-bold text-amber-600 mb-8">Privacy Policy</h1>

        <div className="privacy-animate space-y-6 text-base leading-relaxed">
          <p><strong>Effective Date:</strong> January 1, 2026</p>
          <p>
            At Happy Life Astro, we take your privacy and data security seriously. This Privacy Policy explains how we collect, use, and protect your personal information when you use our website, mobile application, and astrology learning platform.
          </p>

          <h2 className="text-xl font-bold text-amber-600 mt-6">1. Information We Collect</h2>
          <p>
            We may collect personal information such as your name, email address, phone number, date of birth, time of birth, place of birth (for astrological analysis and consultations), and payment details when you register for an account, book a consultation, or purchase a course.
          </p>

          <h2 className="text-xl font-bold text-amber-600 mt-6">2. How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>To provide and maintain our astrology courses, certifications, and educational services.</li>
            <li>To generate accurate astrological charts, reports, and personalized consultations.</li>
            <li>To process your orders, enrollments, and payment receipts securely.</li>
            <li>To communicate important updates, account verification OTPs, and support messages.</li>
            <li>To enhance and secure our online learning platform and student dashboard.</li>
          </ul>

          <h2 className="text-xl font-bold text-amber-600 mt-6">3. Data Protection & Security</h2>
          <p>
            We implement strict security measures including encrypted data transmission (HTTPS/TLS), secure authentication, and access control policies to safeguard your personal and astrological information.
          </p>

          <h2 className="text-xl font-bold text-amber-600 mt-6">4. Third-Party Services</h2>
          <p>
            We partner with trusted payment gateways (such as Razorpay) and secure video streaming providers. We do not sell or rent your personal data to third parties.
          </p>

          <h2 className="text-xl font-bold text-amber-600 mt-6">5. Account Deletion & Data Rights</h2>
          <p>
            You have the right to access, update, or request the deletion of your account and personal data at any time through your dashboard or by reaching out to our support team.
          </p>

          <h2 className="text-xl font-bold text-amber-600 mt-6">6. Contact Us</h2>
          <p>
            If you have questions or inquiries regarding our Privacy Policy or data handling, please contact us at{' '}
            <a href="mailto:happylifereport@gmail.com" className="text-amber-600 font-bold hover:underline">
              happylifereport@gmail.com
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
