import React, { useEffect } from 'react';
import gsap from 'gsap';

const Terms = () => {
  useEffect(() => {
    gsap.fromTo('.terms-animate',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.2, ease: 'power3.out' }
    );
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="terms-animate font-montserrat text-amber-600 mb-8 text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors">Terms & Conditions</h1>

        <div className="terms-animate space-y-6 text-base leading-relaxed">
          <p><strong>Effective Date:</strong> January 1, 2026</p>
          <p>
            Welcome to Happy Life Astro. By accessing or using our platform, you agree to be bound by these Terms and Conditions. Please read them carefully.
          </p>

          <h2 className="text-amber-600 mt-6 text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors">1. Use of the Platform</h2>
          <p>
            Happy Life Astro provides educational astrology courses, mentorship programs, consultations, and study materials. You agree to use the platform only for lawful purposes and in a way that respects intellectual property and community guidelines.
          </p>

          <h2 className="text-amber-600 mt-6 text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors">2. User Accounts</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials. You must immediately notify us of any unauthorized use of your account.
          </p>

          <h2 className="text-amber-600 mt-6 text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors">3. Intellectual Property</h2>
          <p>
            All content on the Happy Life Astro platform, including video lessons, audio sessions, e-books, practice test series, certifications, and logos, is the exclusive property of Happy Life Astro. You may not reproduce, record, distribute, or modify any content without prior written permission.
          </p>

          <h2 className="text-amber-600 mt-6 text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors">4. Educational Disclaimer</h2>
          <p>
            Happy Life Astro strives to provide insightful and authentic astrological knowledge and guidance. Astrological readings and consultations are for personal guidance and educational purposes and should not replace professional medical, legal, or financial advice.
          </p>

          <h2 className="text-amber-600 mt-6 text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors">5. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. Your continued use of the platform after any changes indicates your acceptance of the new terms.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Terms;
