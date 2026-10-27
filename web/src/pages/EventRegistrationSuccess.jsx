import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

const EventRegistrationSuccess = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [eventData, setEventData] = useState(null);
  const [message, setMessage] = useState('');

  const paymentId = searchParams.get('razorpay_payment_id') || searchParams.get('payment_id') || '';
  const email = searchParams.get('email') || '';
  const name = searchParams.get('name') || '';
  const phone = searchParams.get('phone') || searchParams.get('contact') || '';
  const slug = searchParams.get('slug') || '';
  const eventId = searchParams.get('event_id') || searchParams.get('eventId') || '';

  const getApiBaseUrl = () => {
    const raw = import.meta.env.VITE_BASE_URL || import.meta.env.VITE_API_BASE || 'https://happy-life-sx03.onrender.com';
    return raw.replace(/\/api\/v1\/?$/, '') + '/api/v1';
  };

  useEffect(() => {
    window.scrollTo(0, 0);

    const verifyAndLoad = async () => {
      try {
        if (email || paymentId) {
          const baseUrl = getApiBaseUrl();
          const res = await fetch(`${baseUrl}/events/verify-public-registration`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              paymentId,
              email,
              name,
              phone,
              slug,
              eventId,
            }),
          });
          const data = await res.json();
          if (data.success) {
            setEventData(data.data?.event || null);
            setMessage(data.message || 'Seat confirmed successfully!');
          } else {
            setMessage(data.message || 'Payment received. Confirmation email on the way.');
          }
        }
      } catch (err) {
        console.warn('Auto-verification note:', err);
      } finally {
        setLoading(false);
      }
    };

    verifyAndLoad();
  }, [paymentId, email, name, phone, slug, eventId]);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 sm:p-6 text-slate-900">
      <div className="max-w-xl w-full bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.06)] space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
        
        {/* Animated Checkmark Badge */}
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto text-3xl font-black border border-emerald-200 shadow-md">
          ✓
        </div>

        {/* Headline */}
        <div className="space-y-2">
          <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Payment Completed • Seat Reserved
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            You're Officially Registered! 🎉
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
            Thank you for enrolling. Your registration has been verified and your live seat is locked.
          </p>
        </div>

        {/* Email & Credentials Notice Box */}
        <div className="p-4 sm:p-5 bg-gradient-to-br from-blue-50/70 to-indigo-50/40 border border-blue-200 rounded-2xl text-left space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
            <span>📩</span>
            <span>Check Your Email Inbox</span>
          </div>
          <p className="text-xs text-blue-800 leading-relaxed">
            We have emailed your <strong>Zoom / Google Meet joining link</strong>, Meeting ID, Passcode, and your <strong>Student Portal Login Credentials</strong> (Email & Temporary Password) to:
          </p>
          {email && (
            <div className="font-mono text-xs font-bold text-blue-950 bg-white/80 border border-blue-200/80 px-3 py-1.5 rounded-lg inline-block">
              {email}
            </div>
          )}
        </div>

        {/* Primary CTA Buttons */}
        <div className="space-y-3 pt-2">
          {/* WhatsApp Community Join */}
          <a
            href="https://chat.whatsapp.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.99] text-white py-3.5 px-6 rounded-xl font-black text-sm shadow-lg shadow-emerald-500/20 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
            </svg>
            <span>👉 Join WhatsApp Community Group</span>
          </a>

          {/* Go to My Events in Dashboard */}
          <Link
            to="/dashboard/my-events"
            className="w-full bg-[#2171B5] hover:bg-blue-700 active:scale-[0.99] text-white py-3 px-6 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <span>Go to My Events Dashboard</span>
            <span>→</span>
          </Link>
        </div>

        {/* Footer Note */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-4 text-xs text-slate-500">
          <Link to="/login" className="hover:text-[#2171B5] transition font-medium">
            Student Login
          </Link>
          <span>•</span>
          <Link to="/" className="hover:text-[#2171B5] transition font-medium">
            Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventRegistrationSuccess;
