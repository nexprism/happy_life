import React, { useEffect } from 'react';
import gsap from 'gsap';

const RefundPolicy = () => {
  useEffect(() => {
    gsap.fromTo('.refund-animate', 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.2, ease: 'power3.out' }
    );
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="refund-animate font-montserrat text-amber-600 mb-8 text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors">Refund Policy</h1>
        
        <div className="refund-animate space-y-6 text-base leading-relaxed">
          <p>
            Thank you for enrolling in Happy Life Astro courses and consultations. We strive to provide the highest quality astrology and Vedic wisdom education. Please read our refund policy carefully.
          </p>
          
          <h2 className="text-amber-600 mt-6 text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors">1. Digital Products</h2>
          <p>
            Due to the digital nature of our courses, video classes, e-books, and practice tests, all sales are considered final once the content has been accessed or downloaded.
          </p>
          
          <h2 className="text-amber-600 mt-6 text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors">2. Refund Eligibility</h2>
          <p>
            Refunds may only be granted in exceptional circumstances, such as:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Duplicate payments made by accident.</li>
            <li>Technical issues on our platform that prevent you from accessing the purchased course entirely, which our support team is unable to resolve within 7 working days.</li>
          </ul>

          <h2 className="text-amber-600 mt-6 text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors">3. How to Request a Refund</h2>
          <p>
            If you believe you are eligible for a refund, please contact our support team at{' '}
            <a href="mailto:happylifereport@gmail.com" className="text-amber-600 font-bold hover:underline">
              happylifereport@gmail.com
            </a>{' '}
            within 48 hours of purchase with your transaction details and a clear explanation of the issue.
          </p>
          
          <h2 className="text-amber-600 mt-6 text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors">4. Processing Time</h2>
          <p>
            Approved refunds will be processed within 7-10 business days and will be credited back to the original payment method used during the purchase.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;
