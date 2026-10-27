import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { isReservedSlug } from "../constants/reservedSlugs";
import {
  Calendar,
  Clock,
  Hourglass,
  User as UserIcon,
  Play,
  Video as VideoIcon,
  Image as ImageIcon,
  VolumeX,
} from "lucide-react";
import {
  LotusChakraIcon,
  CelestialZodiacWheel,
  getVedicIcon,
} from "../components/VedicIcons";
import LandingRegisterButton from "../components/LandingRegisterButton";

// Dynamic Base URL and Media URL Helpers
import { getApiBaseUrl, resolveMediaUrl } from "../utils/mediaUrl";
export { getApiBaseUrl, resolveMediaUrl };

// Container width mapping helper
const getSectionWidthClass = (maxWidth) => {
  switch (maxWidth) {
    case "4xl": return "max-w-4xl";
    case "5xl": return "max-w-5xl";
    case "6xl": return "max-w-6xl";
    case "7xl": return "max-w-7xl";
    case "full": return "max-w-full";
    default: return "max-w-7xl";
  }
};

// Authentic SVG Brand Icons for Happy Life
const BrandSocialIcon = ({ network, className = "w-4 h-4" }) => {
  const net = (network || "").toLowerCase();
  if (net === "facebook") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    );
  }
  if (net === "twitter" || net === "x") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    );
  }
  if (net === "instagram") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    );
  }
  if (net === "youtube") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    );
  }
  return null;
};

export default function BuilderTemplateView() {
  const { slug } = useParams();
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dynamic form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    source: "Instagram",
    notes: "",
  });
  const [submittingLead, setSubmittingLead] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);
  const [leadError, setLeadError] = useState("");
  const [showWhatsappModal, setShowWhatsappModal] = useState(false);
  const [whatsappCommunityLink, setWhatsappCommunityLink] = useState("https://chat.whatsapp.com/invite");

  // FAQ accordion open states
  const [openFaq, setOpenFaq] = useState({});

  const toggleFaq = (index) => {
    setOpenFaq((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  useEffect(() => {
    let isCancelled = false;

    // Fetch site-wide public settings (e.g. WhatsApp community link)
    const fetchSettings = async () => {
      try {
        const baseUrl = getApiBaseUrl();
        const res = await fetch(`${baseUrl}/settings`);
        const data = await res.json();
        if (!isCancelled && data?.settings?.whatsappCommunityLink) {
          setWhatsappCommunityLink(data.settings.whatsappCommunityLink);
        }
      } catch (err) {
        console.error("Failed to load settings in builder view", err);
      }
    };
    fetchSettings();

    const fetchTemplate = async () => {
      if (!slug || isReservedSlug(slug)) {
        if (!isCancelled) {
          setError("Not found");
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        const baseUrl = getApiBaseUrl();
        const res = await fetch(`${baseUrl}/builder/public/${slug}`);
        const data = await res.json();

        if (isCancelled) return;

        if (data.success && data.data) {
          setTemplate(data.data);
          if (data.data.seo?.metaTitle || data.data.name) {
            document.title = data.data.seo?.metaTitle || data.data.name;
          }
        } else {
          setError(data.message || "Landing page not found");
        }
      } catch {
        if (!isCancelled) {
          setError("Failed to load landing page");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchTemplate();

    return () => {
      isCancelled = true;
    };
  }, [slug]);

  const handleInputChange = (fieldName, value) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const buildPrefilledPaymentUrl = (rawLink = "", details = {}) => {
    try {
      let trimmed = (rawLink || "").trim();
      if (!trimmed) return "";

      // If user provided raw Razorpay button/page ID (e.g. "pl_TrHUsASr37CJvl")
      if (/^pl_[a-zA-Z0-9]+$/i.test(trimmed)) {
        trimmed = `https://pages.razorpay.com/${trimmed}/view`;
      }

      const fullUrl = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
      const url = new URL(fullUrl);

      const { email, phone, name } = details;
      if (email && email.trim()) {
        url.searchParams.set("email", email.trim().toLowerCase());
      }
      if (phone) {
        const cleanPhone = String(phone).replace(/\D/g, "").slice(-10);
        url.searchParams.set("phone", cleanPhone || String(phone).trim());
        url.searchParams.set("contact", cleanPhone || String(phone).trim());
      }
      if (name && name.trim()) {
        url.searchParams.set("name", name.trim());
        url.searchParams.set("full_name", name.trim());
      }
      return url.toString();
    } catch (err) {
      console.warn("Failed to construct prefilled payment URL:", err);
      const targetUrl = (rawLink || "").trim();
      return /^https?:\/\//i.test(targetUrl) ? targetUrl : `https://${targetUrl}`;
    }
  };

  const handleLeadSubmit = async (e, paymentLink = "") => {
    e.preventDefault();
    setLeadError("");
    setLeadSuccess(false);

    if (!formData.name || !formData.email || !formData.phone) {
      setLeadError("Please fill in your name, email, and phone number.");
      return;
    }

    try {
      setSubmittingLead(true);
      const baseUrl = getApiBaseUrl();
      const hasPayment = Boolean(paymentLink && typeof paymentLink === "string" && paymentLink.trim());
      const res = await fetch(`${baseUrl}/builder/public/${slug}/lead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          paymentLink: paymentLink ? paymentLink.trim() : "",
          hasPaymentLink: hasPayment,
        }),
      });
      const data = await res.json();

      if (data.success) {
        if (hasPayment) {
          const targetUrl = data.redirectUrl || buildPrefilledPaymentUrl(paymentLink, formData);
          window.location.href = targetUrl;
          return;
        }

        setLeadSuccess(true);
        setShowWhatsappModal(true);
        setFormData({
          name: "",
          email: "",
          phone: "",
          source: "Instagram",
          notes: "",
        });
      } else {
        setLeadError(data.message || "Failed to submit. Please try again.");
      }
    } catch {
      setLeadError("Network error. Please try again later.");
    } finally {
      setSubmittingLead(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#2171B5] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold tracking-wider text-slate-500 uppercase">
            Loading experience...
          </p>
        </div>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-slate-900 p-6 relative overflow-hidden">
        <div className="max-w-md text-center space-y-5 relative z-10">
          <div className="w-20 h-20 bg-blue-50 border border-blue-200 text-[#2171B5] rounded-3xl flex items-center justify-center mx-auto text-3xl font-black shadow-md">
            404
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Page Not Found
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            The page you are looking for doesn't exist, is in draft mode, or has been relocated.
          </p>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-block px-6 py-3 bg-[#2171B5] hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition shadow-lg shadow-blue-600/20 active:scale-95"
            >
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-[#2171B5] selection:text-white font-sans relative overflow-x-hidden">
      {/* Optional Custom Injected CSS */}
      {template.customCss && <style>{template.customCss}</style>}

      {/* --- HEADER --- */}
      {template.headerConfig?.enabled && (() => {
        const shadowVal = Number(
          template.headerConfig.shadowIntensity ??
          (template.headerConfig.ctaButton?.variant?.match(/shadow_(\d+)/)?.[1]) ??
          (template.customCss?.match(/\[HL_NAVBAR_SHADOW:(\d+)\]/)?.[1]) ??
          0
        );
        const navShadow = shadowVal > 0
          ? `0px ${Math.max(2, Math.round(shadowVal * 0.55))}px ${Math.round(shadowVal * 0.75)}px -${Math.max(1, Math.round(shadowVal * 0.2))}px rgba(0, 0, 0, ${(0.06 + (shadowVal / 60) * 0.18).toFixed(2)}), 0px 4px 6px -2px rgba(0, 0, 0, 0.05)`
          : undefined;

        return (
          <header
            style={navShadow ? { boxShadow: navShadow } : undefined}
            className={`sticky top-0 z-50 backdrop-blur-xl bg-white/95 border-b border-slate-200 ${
              navShadow ? "" : "shadow-xs"
            } transition-all`}
          >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center hover:opacity-85 transition">
                <img
                  src={resolveMediaUrl(template.headerConfig.logoUrl || "/logos/osa_logo.png")}
                  alt={template.headerConfig.siteTitle || "Happy Life"}
                  className="h-9 md:h-11 w-auto object-contain"
                  onError={(e) => {
                    e.currentTarget.src = "/logos/osa_logo.png";
                  }}
                />
              </Link>
              {template.headerConfig.siteTitle && template.headerConfig.siteTitle !== "Happy Life" && (
                <span className="font-extrabold text-lg tracking-tight text-slate-900">
                  {template.headerConfig.siteTitle}
                </span>
              )}
            </div>

            <div className="flex items-center gap-6">
              {template.headerConfig.navLinks && template.headerConfig.navLinks.length > 0 && (
                <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600">
                  {template.headerConfig.navLinks.map((lnk, i) => (
                    <a
                      key={i}
                      href={lnk.url || "#"}
                      className="hover:text-[#2171B5] transition font-medium tracking-wide"
                    >
                      {lnk.label}
                    </a>
                  ))}
                </nav>
              )}

              {template.headerConfig.ctaButton?.text && (
                <a
                  href={template.headerConfig.ctaButton.url || "#lead-form"}
                  className="px-5 py-2.5 bg-[#2171B5] hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-blue-600/20 transition active:scale-95"
                >
                  {template.headerConfig.ctaButton.text}
                </a>
              )}
            </div>
          </div>
        </header>
        );
      })()}

      {/* --- SECTIONS --- */}
      <main className="space-y-0">
        {template.sections.map((section, sIdx) => {
          const isTwoCol = section.layout === "2-column";

          return (
            <section
              key={section.id || sIdx}
              style={{
                backgroundColor: section.backgroundColor || "#ffffff",
                color: section.textColor || "#0F172A",
              }}
              className="py-16 sm:py-24 relative overflow-hidden border-b border-slate-100"
            >
              <div className={`${getSectionWidthClass(section.maxWidth)} mx-auto px-4 sm:px-6 lg:px-8 relative z-10`}>
                {/* 1-Column vs 2-Column Responsive Layout */}
                {(() => {
                  const isWhyJoinSelfContained =
                    section.columns[0]?.components[0]?.content?.style === "whyJoin" &&
                    (!section.columns[1] || section.columns[1].components.length === 0);

                  return (
                    <div
                      className={
                        isTwoCol && !isWhyJoinSelfContained
                          ? "grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center"
                          : `${getSectionWidthClass(section.maxWidth)} mx-auto space-y-8`
                      }
                    >
                      {section.columns
                        .filter((_, cIdx) => !(isWhyJoinSelfContained && cIdx === 1))
                        .map((column, cIdx) => (
                    <div
                      key={column.id || cIdx}
                      className={`space-y-8 ${
                        isTwoCol && cIdx === 0
                          ? "text-left"
                          : isTwoCol && cIdx === 1
                          ? "w-full"
                          : ""
                      }`}
                    >
                      {column.components.map((comp, compIdx) => (
                        <div key={comp.id || compIdx}>
                          {/* 1. HERO COMPONENT */}
                          {comp.type === "hero" && (
                            comp.content.style === "webinar" || comp.content.eventDate ? (
                              <div
                                className="relative overflow-hidden rounded-[28px] lg:rounded-3xl bg-gradient-to-b from-[#06152B] via-[#091D38] to-[#051326] lg:bg-gradient-to-r lg:from-[#071322] lg:via-[#0d2238] lg:to-[#17436b] text-white p-5 sm:p-6 lg:p-12 min-h-[80vh] lg:min-h-0 shadow-2xl border border-blue-900/40"
                                style={
                                  comp.content.backgroundImage
                                    ? {
                                        backgroundImage: `linear-gradient(rgba(7, 19, 34, 0.85), rgba(7, 19, 34, 0.95)), url(${resolveMediaUrl(comp.content.backgroundImage)})`,
                                        backgroundSize: "cover",
                                        backgroundPosition: "center",
                                      }
                                    : {}
                                }
                              >
                                {/* Cosmic Glow */}
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-400/10 via-transparent to-transparent pointer-events-none" />

                                {/* --- MOBILE / PHONE SPECIFIC HERO LAYOUT (Matches Screenshot 2) --- */}
                                <div className="block lg:hidden relative z-10 flex flex-col justify-between h-full min-h-[76vh] text-left">
                                  {/* Top: Title & Subtitle */}
                                  <div>
                                    {/* Title */}
                                    <h1 className="text-[25px] sm:text-[27px] font-black text-white font-serif tracking-tight leading-[1.2]">
                                      {comp.content.title || "Mega Astrology Webinar"}
                                    </h1>

                                    {/* Subtitle */}
                                    <p className="mt-3.5 text-[12.5px] text-[#CAD5E2] leading-[1.6] font-normal">
                                      {comp.content.subtitle ||
                                        "Enhance your astrological understanding with our 2 Days webinar, seamlessly integrating traditional Vedic astrology with practical, modern applications. Learn to interpret birth charts and celestial influences under the guidance of Astro Arun Pandit."}
                                    </p>
                                  </div>

                                  {/* Center: Mentor Image with Celestial Zodiac Wheel */}
                                  <div className="relative flex items-center justify-center my-4 h-[225px] rounded-2xl overflow-hidden bg-[#030C19] border border-blue-900/40 shadow-inner">
                                    <div className="absolute inset-0 flex items-center justify-center text-blue-400/30 pointer-events-none scale-110">
                                      <CelestialZodiacWheel className="w-56 h-56 sm:w-60 sm:h-60" />
                                    </div>
                                    <img
                                      src={resolveMediaUrl(
                                        comp.content.mentorImage && comp.content.mentorImage !== "/hero_image_2.png"
                                          ? comp.content.mentorImage
                                          : "/mentor.png"
                                      )}
                                      alt={comp.content.mentorName || "Mentor"}
                                      className="relative z-10 max-h-[220px] w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)]"
                                      onError={(e) => {
                                        e.target.src = "/mentor.png";
                                      }}
                                    />
                                  </div>

                                  {/* Lower Center: 4 Metadata Rows with spacious gaps & clear alignment */}
                                  <div className="space-y-3.5 my-2">
                                    <div className="flex items-center text-[13px]">
                                      <div className="w-[42%] flex items-center gap-2.5 text-slate-200">
                                        <Calendar className="w-[17px] h-[17px] text-[#60A5FA] shrink-0" />
                                        <span className="font-semibold text-slate-200">Date</span>
                                      </div>
                                      <div className="w-[58%] font-bold text-white text-left pl-2 tracking-wide">
                                        {comp.content.eventDate || "24 Oct, 2026"}
                                      </div>
                                    </div>

                                    <div className="flex items-center text-[13px]">
                                      <div className="w-[42%] flex items-center gap-2.5 text-slate-200">
                                        <Clock className="w-[17px] h-[17px] text-[#60A5FA] shrink-0" />
                                        <span className="font-semibold text-slate-200">Time</span>
                                      </div>
                                      <div className="w-[58%] font-bold text-white text-left pl-2 tracking-wide">
                                        {comp.content.eventTime || "01:00 PM"}
                                      </div>
                                    </div>

                                    <div className="flex items-center text-[13px]">
                                      <div className="w-[42%] flex items-center gap-2.5 text-slate-200">
                                        <Hourglass className="w-[17px] h-[17px] text-[#60A5FA] shrink-0" />
                                        <span className="font-semibold text-slate-200">Duration</span>
                                      </div>
                                      <div className="w-[58%] font-bold text-white text-left pl-2 tracking-wide">
                                        {comp.content.duration || "4 Hours"}
                                      </div>
                                    </div>

                                    <div className="flex items-center text-[13px]">
                                      <div className="w-[42%] flex items-center gap-2.5 text-slate-200">
                                        <UserIcon className="w-[17px] h-[17px] text-[#60A5FA] shrink-0" />
                                        <span className="font-semibold text-slate-200">Mentor</span>
                                      </div>
                                      <div className="w-[58%] font-bold text-white text-left pl-2 tracking-wide">
                                        {comp.content.mentorName || "Astro Arun Pandit"}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Bottom: Full Width CTA Register Button */}
                                  <div className="pt-3">
                                    <a
                                      href={comp.content.buttonLink || comp.content.ctaLink || "#lead-form"}
                                      className="w-full py-3.5 sm:py-4 px-5 bg-white text-purple-700 hover:bg-slate-50 rounded-xl font-extrabold text-sm text-center shadow-lg shadow-black/25 flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer"
                                    >
                                      <span className="text-[#7E22CE] font-bold text-sm">Register Now</span>
                                      {comp.content.originalPrice && (
                                        <span className="line-through text-slate-400 text-xs font-semibold">
                                          {comp.content.originalPrice}
                                        </span>
                                      )}
                                      <span className="text-[#7E22CE] font-black text-sm">
                                        {comp.content.discountPrice || "₹99/-"}
                                      </span>
                                    </a>
                                  </div>
                                </div>

                                {/* --- DESKTOP / PC HERO LAYOUT (hidden lg:grid - Unchanged for PC) --- */}
                                <div className="hidden lg:grid relative z-10 grid-cols-12 gap-8 items-center">
                                  {/* Left Details */}
                                  <div className="lg:col-span-7 space-y-5 text-left">
                                    {comp.content.badge && (
                                      <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-300 bg-blue-900/50 border border-blue-700/50 rounded-full">
                                        {comp.content.badge}
                                      </span>
                                    )}
                                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white font-serif tracking-tight leading-tight">
                                      {comp.content.title || "Mega Astrology Webinar"}
                                    </h1>
                                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                                      {comp.content.subtitle ||
                                        "Enhance your astrological understanding with our 2 Days webinar, seamlessly integrating traditional Vedic astrology with practical, modern applications. Learn to interpret birth charts and celestial influences under the guidance of Astro Arun Pandit."}
                                    </p>

                                    {/* 4 Metadata Items */}
                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                      <div className="flex items-center gap-2.5 text-xs text-slate-200">
                                        <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
                                        <div>
                                          <span className="text-[10px] text-slate-400 block uppercase font-semibold">Date</span>
                                          <span className="font-bold text-white text-xs sm:text-sm">{comp.content.eventDate || "24 Oct, 2026"}</span>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2.5 text-xs text-slate-200">
                                        <Clock className="w-4 h-4 text-blue-400 shrink-0" />
                                        <div>
                                          <span className="text-[10px] text-slate-400 block uppercase font-semibold">Time</span>
                                          <span className="font-bold text-white text-xs sm:text-sm">{comp.content.eventTime || "01:00 PM"}</span>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2.5 text-xs text-slate-200">
                                        <Hourglass className="w-4 h-4 text-blue-400 shrink-0" />
                                        <div>
                                          <span className="text-[10px] text-slate-400 block uppercase font-semibold">Duration</span>
                                          <span className="font-bold text-white text-xs sm:text-sm">{comp.content.duration || "4 Hours"}</span>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2.5 text-xs text-slate-200">
                                        <UserIcon className="w-4 h-4 text-blue-400 shrink-0" />
                                        <div>
                                          <span className="text-[10px] text-slate-400 block uppercase font-semibold">Mentor</span>
                                          <span className="font-bold text-white text-xs sm:text-sm">{comp.content.mentorName || "Astro Arun Pandit"}</span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Price Button CTA */}
                                    <div className="pt-3">
                                      <a
                                        href={comp.content.buttonLink || comp.content.ctaLink || "#lead-form"}
                                        className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-white text-purple-900 hover:bg-slate-100 rounded-xl font-black text-sm shadow-xl transition transform hover:scale-105 active:scale-95 cursor-pointer"
                                      >
                                        <span>Register Now</span>
                                        {comp.content.originalPrice && (
                                          <span className="line-through text-slate-400 text-xs">
                                            {comp.content.originalPrice}
                                          </span>
                                        )}
                                        <span className="text-purple-700 font-extrabold text-sm sm:text-base">
                                          {comp.content.discountPrice || "₹99/-"}
                                        </span>
                                      </a>
                                    </div>
                                  </div>

                                  {/* Right Cutout Column */}
                                  <div className="lg:col-span-5 relative flex items-center justify-center min-h-[260px] sm:min-h-[340px]">
                                    <div className="absolute inset-0 flex items-center justify-center text-blue-400/40 pointer-events-none scale-110">
                                      <CelestialZodiacWheel className="w-64 h-64 sm:w-80 sm:h-80" />
                                    </div>
                                    <img
                                      src={resolveMediaUrl(comp.content.mentorImage || "/mentor.png")}
                                      alt={comp.content.mentorName || "Mentor"}
                                      className="relative z-10 max-h-[280px] sm:max-h-[340px] object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]"
                                      onError={(e) => {
                                        e.target.src = "/mentor.png";
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-6">
                                {comp.content.badge && (
                                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide bg-blue-50 text-[#2171B5] border border-blue-200 shadow-xs">
                                    <span className="w-2 h-2 rounded-full bg-[#2171B5] animate-ping" />
                                    <span>{comp.content.badge}</span>
                                  </div>
                                )}

                                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.12] text-slate-900">
                                  {comp.content.title}
                                </h1>

                                <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed font-normal">
                                  {comp.content.subtitle}
                                </p>

                                {comp.content.bulletPoints &&
                                  comp.content.bulletPoints.length > 0 && (
                                    <ul className="space-y-3 pt-2">
                                      {comp.content.bulletPoints.map((bp, bpi) => (
                                        <li
                                          key={bpi}
                                          className="flex items-center gap-3 text-sm text-slate-700"
                                        >
                                          <div className="w-5 h-5 rounded-full bg-blue-50 text-[#2171B5] flex items-center justify-center shrink-0 text-xs font-bold border border-blue-200">
                                            ✓
                                          </div>
                                          <span className="font-medium">{bp}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  )}

                                <div className="pt-4 flex flex-wrap gap-4 items-center">
                                  {comp.content.ctaText && (
                                    <a
                                      href={comp.content.ctaLink || "#lead-form"}
                                      className="px-7 py-3.5 bg-[#2171B5] hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-blue-600/25 transition active:scale-95 cursor-pointer"
                                    >
                                      {comp.content.ctaText}
                                    </a>
                                  )}
                                </div>
                              </div>
                            )
                          )}

                          {/* 2. LEAD FORM COMPONENT */}
                          {comp.type === "leadForm" && (
                            <div
                              id="lead-form"
                              className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-9 shadow-[0_10px_35px_rgba(0,0,0,0.06)] relative overflow-hidden text-slate-800"
                            >
                              <div className="space-y-2 mb-6 relative z-10 text-left">
                                {comp.content.badge && (
                                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#2171B5] bg-blue-50 px-3 py-1 rounded-full border border-blue-200 shadow-xs">
                                    {comp.content.badge}
                                  </span>
                                )}
                                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                  {comp.content.title || "Request Free Consultation"}
                                </h3>
                                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                                  {comp.content.subtitle ||
                                    "Complete this short form and our senior advisor will reach out."}
                                </p>
                              </div>

                              {leadSuccess ? (
                                <div className="p-7 rounded-2xl bg-gradient-to-br from-emerald-50 via-green-50/70 to-emerald-50/30 border border-emerald-200 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
                                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold border border-emerald-200 shadow-xs">
                                    ✓
                                  </div>
                                  <div className="space-y-1">
                                    <h4 className="text-xl font-black text-emerald-900">
                                      Enquiry Received!
                                    </h4>
                                    <p className="text-xs sm:text-sm text-emerald-700 leading-relaxed max-w-sm mx-auto">
                                      {comp.content.successMessage ||
                                        "Thank you! Our dedicated counselor will contact you shortly."}
                                    </p>
                                  </div>

                                  <div className="pt-2">
                                    <a
                                      href={whatsappCommunityLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="w-full bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.99] text-white py-3 px-4 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                                      </svg>
                                      <span>Join WhatsApp Community</span>
                                    </a>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => setLeadSuccess(false)}
                                    className="text-xs text-[#2171B5] hover:text-blue-800 hover:underline pt-2 font-semibold cursor-pointer block mx-auto"
                                  >
                                    Submit another enquiry →
                                  </button>
                                </div>
                              ) : (
                                <form 
                                  onSubmit={(e) => handleLeadSubmit(e, comp.content?.paymentLink)} 
                                  className="space-y-4 relative z-10 text-left"
                                >
                                  {leadError && (
                                    <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-medium">
                                      {leadError}
                                    </div>
                                  )}

                                  {/* Dynamic Fields Engine */}
                                  {(comp.content.fields && comp.content.fields.length > 0
                                    ? comp.content.fields
                                    : [
                                        { name: "name", label: "Full Name", type: "text", required: true, placeholder: "e.g. Rahul Sharma" },
                                        { name: "email", label: "Email Address", type: "email", required: true, placeholder: "e.g. rahul@example.com" },
                                        { name: "phone", label: "Mobile Number", type: "tel", required: true, placeholder: "+91 XXXXX" },
                                        {
                                          name: "source",
                                          label: "Where did you find out about us?",
                                          type: "select",
                                          required: true,
                                          options: [
                                            "Instagram",
                                            "YouTube",
                                            "LinkedIn",
                                            "Google Search",
                                            "Facebook",
                                            "Twitter / X",
                                            "Friend / Referral",
                                            "Other",
                                          ],
                                          placeholder: "Select social media / referral channel...",
                                        },
                                        { name: "notes", label: "Your Goal or Query", type: "textarea", required: false, placeholder: "Tell us about your learning goals..." },
                                      ]
                                  ).map((field, fIdx) => (
                                    <div key={fIdx} className="space-y-1.5">
                                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                                        {field.label}{" "}
                                        {field.required && <span className="text-red-500">*</span>}
                                      </label>

                                      {/* SELECT DROPDOWN */}
                                      {field.type === "select" ? (
                                        <div className="relative">
                                          <select
                                            required={field.required}
                                            value={formData[field.name] || ""}
                                            onChange={(e) =>
                                              handleInputChange(field.name, e.target.value)
                                            }
                                            className="w-full appearance-none px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-[#2171B5] focus:ring-2 focus:ring-[#2171B5]/20 transition pr-10 cursor-pointer shadow-xs"
                                          >
                                            <option value="" disabled className="text-slate-400">
                                              {field.placeholder || "Select option..."}
                                            </option>
                                            {(field.options || []).map((opt, optIdx) => (
                                              <option
                                                key={optIdx}
                                                value={opt}
                                                className="text-slate-800 py-1"
                                              >
                                                {opt}
                                              </option>
                                            ))}
                                          </select>
                                          <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                          </div>
                                        </div>
                                      ) : field.type === "textarea" ? (
                                        /* TEXTAREA */
                                        <textarea
                                          rows={2}
                                          required={field.required}
                                          placeholder={field.placeholder || "Enter details..."}
                                          value={formData[field.name] || ""}
                                          onChange={(e) =>
                                            handleInputChange(field.name, e.target.value)
                                          }
                                          className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#2171B5] focus:ring-2 focus:ring-[#2171B5]/20 transition shadow-xs"
                                        />
                                      ) : (
                                        /* TEXT / EMAIL / TEL INPUT */
                                        <input
                                          type={field.type || "text"}
                                          required={field.required}
                                          placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                                          value={formData[field.name] || ""}
                                          onChange={(e) =>
                                            handleInputChange(field.name, e.target.value)
                                          }
                                          className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#2171B5] focus:ring-2 focus:ring-[#2171B5]/20 transition shadow-xs"
                                        />
                                      )}
                                    </div>
                                  ))}

                                  <button
                                    type="submit"
                                    disabled={submittingLead}
                                    className="w-full mt-2 py-3.5 bg-[#2171B5] hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl text-sm shadow-lg shadow-blue-600/25 transition active:scale-98 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                                  >
                                    {submittingLead ? (
                                      <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>
                                          {comp.content?.paymentLink?.trim()
                                            ? "Redirecting to Payment..."
                                            : "Submitting..."}
                                        </span>
                                      </>
                                    ) : (
                                      comp.content.buttonText || (comp.content?.paymentLink?.trim() ? "Complete Registration & Pay →" : "Claim Free Consultation →")
                                    )}
                                  </button>

                                  {comp.content.guaranteeText && (
                                    <p className="text-[11px] text-center text-slate-500 font-medium pt-1">
                                      {comp.content.guaranteeText}
                                    </p>
                                  )}
                                </form>
                              )}
                            </div>
                          )}

                          {/* 3. STATS COMPONENT */}
                          {comp.type === "stats" && (
                            <div className="space-y-6">
                              {comp.content.title && (
                                <div className="space-y-1">
                                  <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                                    {comp.content.title}
                                  </h3>
                                  {comp.content.subtitle && (
                                    <p className="text-xs sm:text-sm text-slate-500">
                                      {comp.content.subtitle}
                                    </p>
                                  )}
                                </div>
                              )}
                              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {(comp.content.stats || []).map((st, sti) => (
                                  <div
                                    key={sti}
                                    className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-[#2171B5] text-center space-y-1.5 transition shadow-xs hover:shadow-md"
                                  >
                                    <span className="text-2xl sm:text-3xl font-black text-[#2171B5]">
                                      {st.number}
                                    </span>
                                    <p className="text-xs font-semibold text-slate-600 tracking-wide">
                                      {st.label}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* 4. ABOUT COMPONENT (Why Join Webinar) */}
                          {/* 4. ABOUT COMPONENT (Why Join Webinar) */}
                          {comp.type === "about" && (
                            comp.content.style === "whyJoin" || comp.content.benefits ? (() => {
                              const align = comp.content.align || "center";
                              const isCenter = align === "center";
                              const isRight = align === "right";
                              const textAlignClass = isCenter ? "text-center" : isRight ? "text-right" : "text-left";

                              const titleSizeClass =
                                comp.content.titleFontSize === "2xl" ? "text-2xl sm:text-3xl" :
                                comp.content.titleFontSize === "3xl" ? "text-3xl sm:text-4xl" :
                                comp.content.titleFontSize === "5xl" ? "text-4xl sm:text-5xl lg:text-6xl" :
                                comp.content.titleFontSize === "6xl" ? "text-5xl sm:text-6xl lg:text-7xl" :
                                "text-3xl sm:text-4xl lg:text-5xl font-extrabold";

                              const subtitleSizeClass =
                                comp.content.subtitleFontSize === "xs" ? "text-xs sm:text-sm" :
                                comp.content.subtitleFontSize === "sm" ? "text-sm sm:text-base" :
                                comp.content.subtitleFontSize === "lg" ? "text-lg sm:text-xl" :
                                "text-sm sm:text-base";

                              const pointersSizeClass =
                                comp.content.pointersFontSize === "sm" ? "text-sm sm:text-base" :
                                comp.content.pointersFontSize === "lg" ? "text-lg sm:text-xl" :
                                comp.content.pointersFontSize === "xl" ? "text-xl sm:text-2xl" :
                                "text-base sm:text-lg";

                              const iconSizeClass =
                                comp.content.iconSize === "sm" ? "w-6 h-6 shrink-0" :
                                comp.content.iconSize === "lg" ? "w-10 h-10 shrink-0" :
                                comp.content.iconSize === "xl" ? "w-12 h-12 shrink-0" :
                                "w-8 h-8 sm:w-9 sm:h-9 shrink-0";

                              // Check for sibling video in this section if videoUrl isn't provided directly
                              const siblingVideo = section.columns
                                ?.flatMap((c) => c.components)
                                ?.find((c) => c.id !== comp.id && c.type === "video");

                              const videoUrl = comp.content.videoUrl || siblingVideo?.content?.videoUrl;
                              const imageUrl = comp.content.imageUrl || comp.content.videoPoster || siblingVideo?.content?.imageUrl || "/hero_image_2.png";
                              const videoTitle = comp.content.title || siblingVideo?.content?.title || "Webinar Video";
                              const videoPos = comp.content.videoPosition || "belowHeading";
                              const hasVideo = videoPos !== "none" && (videoUrl || imageUrl);

                              const renderWebinarVideo = () => (
                                <div className="max-w-2xl mx-auto my-6 w-full">
                                  <div className="rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-amber-200/80 bg-slate-900 shadow-2xl relative aspect-video flex items-center justify-center group">
                                    {videoUrl && (videoUrl.includes("youtube") || videoUrl.includes("youtu.be")) ? (
                                      <iframe
                                        src={videoUrl.replace("watch?v=", "embed/")}
                                        title={videoTitle}
                                        className="w-full h-full border-0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                      />
                                    ) : (
                                      <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-blue-950">
                                        <img
                                          src={resolveMediaUrl(imageUrl)}
                                          alt={videoTitle}
                                          className="w-full h-full object-cover opacity-75"
                                        />
                                        <div className="absolute w-16 h-16 rounded-full bg-white/95 text-purple-900 flex items-center justify-center shadow-2xl pl-1 group-hover:scale-110 transition cursor-pointer">
                                          <Play className="w-7 h-7 fill-purple-900" />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );

                              return (
                                <div className="w-full">
                                  {/* --- MOBILE LAYOUT (block lg:hidden) - COMPLETELY UNTOUCHED & PRESERVED --- */}
                                  <div className={`block lg:hidden space-y-6 ${textAlignClass}`}>
                                    <div className="max-w-2xl mx-auto">
                                      <h2 className={`${titleSizeClass} text-slate-900 tracking-tight leading-tight`}>
                                        {comp.content.title || "Why join the webinar?"}
                                      </h2>
                                      <p className={`${subtitleSizeClass} text-slate-500 mt-2.5 leading-relaxed font-normal`}>
                                        {comp.content.subtitle || "This webinar will help you leverage the impact of stars in day-to-day life."}
                                      </p>
                                    </div>

                                    {/* Video placed below heading on phone */}
                                    {hasVideo && videoPos === "belowHeading" && renderWebinarVideo()}

                                    {/* Key Benefits Pointers on phone */}
                                    <div className="max-w-xl mx-auto space-y-4 pt-2 text-left">
                                      {(comp.content.benefits || [
                                        "Make confident and informed life decisions.",
                                        "Manage stress and anxiety more effectively.",
                                        "Fulfil your dreams like buying your own house.",
                                        "Enhance your health and well-being through spiritual insights.",
                                        "Get logical and practical remedies to tackle life's challenges.",
                                        "Maintain stronger relationships with family and friends."
                                      ]).map((benefit, bIdx) => (
                                        <div key={bIdx} className="flex items-start gap-4">
                                          <div className="shrink-0 mt-0.5">
                                            <LotusChakraIcon className={iconSizeClass} />
                                          </div>
                                          <p className={`${pointersSizeClass} font-semibold text-slate-800 leading-snug pt-0.5`}>
                                            {benefit}
                                          </p>
                                        </div>
                                      ))}
                                    </div>

                                    {/* Video placed below pointers on phone */}
                                    {hasVideo && videoPos === "belowPointers" && renderWebinarVideo()}

                                    {/* Phone CTA Button */}
                                    {comp.content.buttonText && (
                                      <div className={`pt-4 ${isCenter ? "flex justify-center" : isRight ? "flex justify-end" : "flex justify-start"}`}>
                                        <a
                                          href={comp.content.buttonLink || "#lead-form"}
                                          className="inline-block px-9 py-3.5 bg-[#2171B5] hover:bg-blue-700 text-white font-bold text-sm sm:text-base rounded-xl shadow-lg transition active:scale-95 cursor-pointer"
                                        >
                                          {comp.content.buttonText}
                                        </a>
                                      </div>
                                    )}
                                  </div>

                                  {/* --- PC / DESKTOP LAYOUT (hidden lg:block) - MATCHES SCREENSHOT 2 EXACTLY --- */}
                                  <div className="hidden lg:block w-full max-w-6xl mx-auto py-4">
                                    {/* 1. Header Centered at the Top */}
                                    <div className="text-center max-w-3xl mx-auto mb-12">
                                      <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-slate-900 tracking-tight leading-tight">
                                        {comp.content.title || "Why join the webinar?"}
                                      </h2>
                                      <p className="text-base sm:text-lg text-slate-500 mt-3 leading-relaxed font-normal">
                                        {comp.content.subtitle || "This webinar will help you leverage the impact of stars in day-to-day life."}
                                      </p>
                                    </div>

                                    {/* 2. Side-by-Side 2-Column Grid */}
                                    <div className="grid grid-cols-12 gap-12 items-center">
                                      {/* Left Column: 6 Pointers + Purple Register now Button */}
                                      <div className="col-span-6 space-y-7 text-left">
                                        <div className="space-y-4.5">
                                          {(comp.content.benefits || [
                                            "Make confident and informed life decisions.",
                                            "Manage stress and anxiety more effectively.",
                                            "Fulfil your dreams like buying your own house.",
                                            "Enhance your health and well-being through spiritual insights.",
                                            "Get logical and practical remedies to tackle life's challenges.",
                                            "Maintain stronger relationships with family and friends."
                                          ]).map((benefit, bIdx) => (
                                            <div key={bIdx} className="flex items-start gap-4">
                                              <div className="shrink-0 mt-0.5 text-purple-600">
                                                <LotusChakraIcon className={iconSizeClass || "w-7 h-7 sm:w-8 sm:h-8"} />
                                              </div>
                                              <p className={`${pointersSizeClass || "text-[15px] sm:text-[16px]"} font-semibold text-slate-800 leading-snug pt-0.5`}>
                                                {benefit}
                                              </p>
                                            </div>
                                          ))}
                                        </div>

                                        {/* Purple Register now Button */}
                                        <div className="pt-2">
                                          <a
                                            href={comp.content.buttonLink || "#lead-form"}
                                            className="inline-block px-7 py-3 bg-[#7E22CE] hover:bg-[#6B21A8] text-white font-bold text-sm rounded-xl shadow-md transition"
                                          >
                                            {comp.content.buttonText || "Register now"}
                                          </a>
                                        </div>
                                      </div>

                                      {/* Right Column: Large Video Player with Golden Border */}
                                      <div className="col-span-6">
                                        <div className="rounded-3xl overflow-hidden border-[5px] sm:border-[6px] border-[#C5A059] bg-slate-950 shadow-2xl relative aspect-[16/10] sm:aspect-video flex items-center justify-center group">
                                          {videoUrl && (videoUrl.includes("youtube") || videoUrl.includes("youtu.be")) ? (
                                            <iframe
                                              src={videoUrl.replace("watch?v=", "embed/")}
                                              title={videoTitle}
                                              className="w-full h-full border-0"
                                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                              allowFullScreen
                                            />
                                          ) : (
                                            <>
                                              <img
                                                src={resolveMediaUrl(imageUrl)}
                                                alt={videoTitle}
                                                className="w-full h-full object-cover"
                                              />
                                              <div className="absolute w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-black/60 backdrop-blur-xs text-white flex items-center justify-center shadow-2xl pl-1 group-hover:scale-110 transition cursor-pointer">
                                                <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-white text-white" />
                                              </div>
                                              <div className="absolute bottom-3 right-3 p-1.5 bg-black/75 backdrop-blur-xs text-white rounded-full flex items-center justify-center">
                                                <VolumeX className="w-3.5 h-3.5 text-white/90" />
                                              </div>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })() : (
                              <div className="space-y-5 text-left">
                                {comp.content.tag && (
                                  <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#2171B5] bg-blue-50 rounded-full border border-blue-200">
                                    {comp.content.tag}
                                  </span>
                                )}
                                <h2 className="text-2xl sm:text-3xl font-black leading-tight text-slate-900">
                                  {comp.content.title}
                                </h2>
                                <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                                  {comp.content.description}
                                </p>
                              </div>
                            )
                          )}

                          {/* VIDEO / MEDIA PLAYER COMPONENT */}
                          {comp.type === "video" && (() => {
                            // Check if this section already rendered video inside whyJoin about component
                            const hasWhyJoinWithVideo = section.columns
                              ?.flatMap((c) => c.components)
                              ?.some(
                                (c) =>
                                  c.type === "about" &&
                                  (c.content?.style === "whyJoin" || c.content?.benefits) &&
                                  (c.content?.videoPosition || "belowHeading") === "belowHeading"
                              );

                            if (hasWhyJoinWithVideo) {
                              return null; // Suppress duplicate video at the bottom!
                            }

                            return (
                              <div className="rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-amber-200/80 bg-slate-900 shadow-2xl relative aspect-video flex items-center justify-center group">
                                {comp.content.mediaType === "image" ? (
                                  <img
                                    src={resolveMediaUrl(comp.content.imageUrl || "/hero_image_2.png")}
                                    alt={comp.content.title || "Webinar Media"}
                                    className="w-full h-full object-cover"
                                  />
                                ) : comp.content.videoUrl && (comp.content.videoUrl.includes("youtube") || comp.content.videoUrl.includes("youtu.be")) ? (
                                  <iframe
                                    src={comp.content.videoUrl.replace("watch?v=", "embed/")}
                                    title={comp.content.title || "Webinar Video"}
                                    className="w-full h-full border-0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                  />
                                ) : (
                                  <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-blue-950">
                                    <img
                                      src={resolveMediaUrl(comp.content.imageUrl || "/hero_image_2.png")}
                                      alt="Video Poster"
                                      className="w-full h-full object-cover opacity-65"
                                    />
                                    <div className="absolute w-16 h-16 rounded-full bg-white/95 text-purple-900 flex items-center justify-center shadow-2xl pl-1 group-hover:scale-110 transition cursor-pointer">
                                      <Play className="w-7 h-7 fill-purple-900" />
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })()}

                          {/* 5. FEATURES COMPONENT (What will you learn - 6 Vedic Cards) */}
                          {comp.type === "features" && (
                            comp.content.style === "vedicModules" || comp.content.modules ? (
                              <div className="space-y-8 text-center max-w-5xl mx-auto">
                                <div>
                                  <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                                    {comp.content.title || "What will you learn in this mega webinar?"}
                                  </h2>
                                  <p className="text-sm sm:text-base text-slate-500 mt-2 max-w-2xl mx-auto">
                                    {comp.content.subtitle || "Here's the module for you to learn astrology online through our webinar..."}
                                  </p>
                                </div>

                                {/* 2-Column Grid with 6 Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
                                  {(comp.content.modules || [
                                    { id: 1, iconType: "clover", title: "Improving Your Luck with Astrology", desc: "Use astrological methods to make your luck stronger." },
                                    { id: 2, iconType: "kundali", title: "Understanding Your Birth Chart/Kundali", desc: "Learn about the secrets in your birth chart." },
                                    { id: 3, iconType: "planets", title: "How Planets Affect Your Life", desc: "See how planets influence important parts of your life like your job, love life, and money." },
                                    { id: 4, iconType: "yantra", title: "Basics of Vedic Astrology", desc: "Understand the simple rules that Vedic astrology is built on." },
                                    { id: 5, iconType: "rashi", title: "Rashi/ Zodiac Signs Insights", desc: "Get special tips based on your Rashi." },
                                    { id: 6, iconType: "lagna", title: "Deep Dive into Lagna Chart", desc: "Get a full understanding of Lagna chart." },
                                  ]).map((mod, mIdx) => (
                                    <div
                                      key={mIdx}
                                      className="p-5 sm:p-6 rounded-2xl bg-white border border-purple-100 hover:border-[#2171B5] hover:shadow-lg transition-all flex items-center gap-5"
                                    >
                                      <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center text-slate-800">
                                        {getVedicIcon(mod.iconType)}
                                      </div>
                                      <div className="space-y-1">
                                        <h3 className="font-extrabold text-base sm:text-lg text-slate-900 leading-snug">
                                          {mod.title}
                                        </h3>
                                        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                                          {mod.desc}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                {comp.content.bottomText && (
                                  <p className="text-xs sm:text-sm text-slate-600 font-medium tracking-wide pt-2">
                                    {comp.content.bottomText}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <div className="space-y-8">
                                <div className="space-y-2 text-center">
                                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                                    {comp.content.title}
                                  </h2>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
                                  {(comp.content.cards || []).map((card, ci) => (
                                    <div key={ci} className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3">
                                      <h3 className="font-bold text-base text-slate-900">{card.title}</h3>
                                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{card.desc}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )
                          )}

                          {/* 6. TESTIMONIALS COMPONENT */}
                          {comp.type === "testimonials" && (
                            <div className="space-y-8">
                              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 text-center">
                                {comp.content.title || "Student Transformations"}
                              </h2>
                            </div>
                          )}

                          {/* 7. FAQ COMPONENT (Screenshot 4) */}
                          {comp.type === "faq" && (() => {
                            const align = comp.content.align || "left";
                            const textAlignClass =
                              align === "center"
                                ? "text-center"
                                : align === "right"
                                ? "text-right"
                                : "text-left";

                            return (
                              <div className={`space-y-6 max-w-4xl mx-auto ${textAlignClass}`}>
                                <div className={`space-y-2 ${textAlignClass}`}>
                                  <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                                    {comp.content.title || "Frequently Asked Questions"}
                                  </h2>
                                  {comp.content.subtitle && (
                                    <p className="text-sm text-slate-500">
                                      {comp.content.subtitle}
                                    </p>
                                  )}
                                </div>

                                <div className="space-y-3 pt-3">
                                  {(comp.content.faqs || []).map((faq, fi) => (
                                    <div
                                      key={fi}
                                      className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden transition"
                                    >
                                      <button
                                        type="button"
                                        onClick={() => toggleFaq(fi)}
                                        className={`w-full px-5 py-4 ${textAlignClass} flex items-center justify-between text-sm sm:text-base font-bold text-slate-900 hover:text-[#2171B5] transition cursor-pointer`}
                                      >
                                        <span className={`flex-1 ${textAlignClass}`}>{faq.question}</span>
                                        <span className="text-slate-500 font-bold text-lg leading-none ml-4 shrink-0">
                                          {openFaq[fi] ? "−" : "+"}
                                        </span>
                                      </button>
                                      {openFaq[fi] && (
                                        <div className={`px-5 pb-4 pt-1 text-xs sm:text-sm text-slate-600 border-t border-slate-100 leading-relaxed ${textAlignClass}`}>
                                          {faq.answer}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })()}

                          {/* 8. CTA BANNER COMPONENT (Screenshot 5 - Still Thinking - Happy Life Blue) */}
                          {comp.type === "ctaBanner" && (
                            comp.content.style === "expertCallout" || comp.content.expertImage ? (
                              <div
                                className="rounded-3xl text-white shadow-2xl relative overflow-hidden"
                                style={{
                                  background:
                                    comp.content.backgroundColor === "#2171B5" || !comp.content.backgroundColor
                                      ? "linear-gradient(135deg, #175389 0%, #2171B5 50%, #2b88d8 100%)"
                                      : comp.content.backgroundColor,
                                }}
                              >
                                {/* --- PHONE SPECIFIC LAYOUT (block md:hidden: Photo UP, Text DOWN) --- */}
                                <div className="block md:hidden p-4 sm:p-6 pt-5 pb-8 text-center min-h-[600px] flex flex-col justify-between">
                                  {/* Photo UP - Height increased by 40% so photo is fully visible */}
                                  <div className="w-full rounded-2xl overflow-hidden shadow-xl border-2 border-white/20 mb-6 bg-slate-900/40">
                                    <img
                                      src={resolveMediaUrl(comp.content.expertImage || "/hero_image_2.png")}
                                      alt="Expert Mentor"
                                      className="w-full h-80 sm:h-96 object-cover object-top"
                                      onError={(e) => {
                                        e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80";
                                      }}
                                    />
                                  </div>

                                  {/* Text DOWN */}
                                  <div className="space-y-4 px-2 pb-2">
                                    <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                                      {comp.content.title || "Still thinking? Let us help you take the first step."}
                                    </h2>
                                    {comp.content.subtitle && (
                                      <p className="text-sm text-white/90 leading-relaxed font-normal">
                                        {comp.content.subtitle}
                                      </p>
                                    )}
                                    <div className="pt-2 flex justify-center">
                                      <a
                                        href={comp.content.buttonLink || "#lead-form"}
                                        className="inline-block px-8 py-3.5 bg-white text-[#7E22CE] font-bold text-sm sm:text-base rounded-xl shadow-xl transition transform active:scale-95 cursor-pointer"
                                      >
                                        {comp.content.buttonText || "Talk to an expert"}
                                      </a>
                                    </div>
                                  </div>
                                </div>

                                {/* --- PC / DESKTOP LAYOUT (hidden md:block: COMPLETELY UNCHANGED) --- */}
                                <div className="hidden md:block p-8 sm:p-12 lg:p-14">
                                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                                    <div className="md:col-span-8 space-y-6 text-left">
                                      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
                                        {comp.content.title || "Still thinking? Let us help you take the first step."}
                                      </h2>
                                      {comp.content.subtitle && (
                                        <p className="text-sm sm:text-base text-blue-100 leading-relaxed font-normal">
                                          {comp.content.subtitle}
                                        </p>
                                      )}
                                      <div>
                                        <a
                                          href={comp.content.buttonLink || "#lead-form"}
                                          className="inline-block px-8 py-3.5 bg-white text-[#2171B5] hover:bg-slate-50 font-bold text-sm sm:text-base rounded-xl shadow-xl transition transform hover:scale-105 active:scale-95 cursor-pointer"
                                        >
                                          {comp.content.buttonText || "Talk to an expert"}
                                        </a>
                                      </div>
                                    </div>

                                    <div className="md:col-span-4 flex justify-center md:justify-end">
                                      <img
                                        src={resolveMediaUrl(comp.content.expertImage || "/hero_image_2.png")}
                                        alt="Expert Mentor"
                                        className="w-48 h-48 sm:w-60 sm:h-60 object-cover rounded-2xl shadow-2xl border-4 border-white/20"
                                        onError={(e) => {
                                          e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80";
                                        }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="p-8 sm:p-14 rounded-3xl bg-gradient-to-r from-[#2171B5] via-blue-600 to-indigo-700 text-white text-center space-y-5 shadow-xl relative overflow-hidden">
                                <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight text-white">
                                  {comp.content.title}
                                </h2>
                                <div className="pt-2">
                                  <a
                                    href={comp.content.buttonLink || "#lead-form"}
                                    className="inline-block px-8 py-3.5 bg-white text-blue-900 hover:bg-slate-50 font-black rounded-xl text-sm shadow-xl"
                                  >
                                    {comp.content.buttonText || "Get Started Today →"}
                                  </a>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                  );
                })()}
              </div>
            </section>
          );
        })}
      </main>

      {/* --- FOOTER --- */}
      {template.footerConfig?.enabled && (
        <footer
          style={{
            backgroundColor: template.footerConfig.backgroundColor || "#f8fafc",
            color: template.footerConfig.textColor || "#475569",
          }}
          className="border-t border-slate-200 transition"
        >
          {/* OPTION 1: Happy Life Signature (Center Stacked - Exact Website Match) */}
          {(!template.footerConfig.templateStyle || template.footerConfig.templateStyle === 1) && (
            <div className="relative py-12 md:py-16 px-4 sm:px-8 text-center overflow-hidden flex flex-col items-center justify-center min-h-[360px] select-none">
              {/* Background ambient radial glows */}
              <div className="absolute -top-20 -left-20 w-80 h-80 bg-white blur-[120px] rounded-full opacity-20 pointer-events-none" />
              <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-black blur-[120px] rounded-full opacity-25 pointer-events-none" />

              {/* Brand Logo */}
              <div className="mb-5 sm:mb-6 relative z-10">
                <Link to="/" className="inline-block hover:scale-105 transition-transform">
                  <img
                    alt="Happy Life"
                    src="/logos/osa_logo.png"
                    className="h-11 sm:h-14 md:h-16 w-auto object-contain brightness-0 invert drop-shadow-md mx-auto"
                  />
                </Link>
              </div>

              {/* Headline Typography */}
              <div className="max-w-4xl mx-auto space-y-1 mb-6 sm:mb-8 relative z-10 px-2">
                <h2 className="text-xl sm:text-3xl md:text-5xl font-black tracking-tight leading-snug sm:leading-[1.15] text-white">
                  {template.footerConfig.headline ||
                    "Your Birth Chart Holds Clues, Not Instant MIRACLES"}
                </h2>
              </div>

              {/* Social Links Row with REAL SVG Brand Icons */}
              <div className="flex items-center justify-center gap-4 sm:gap-6 mb-6 sm:mb-8 relative z-10">
                {[
                  { key: "facebook", url: template.footerConfig?.socialLinks?.facebook || "https://www.facebook.com/share/19fDGmAQnj/" },
                  { key: "twitter", url: template.footerConfig?.socialLinks?.twitter || "https://x.com" },
                  { key: "instagram", url: template.footerConfig?.socialLinks?.instagram || "https://www.instagram.com/happy_life_astro" },
                  { key: "youtube", url: template.footerConfig?.socialLinks?.youtube || "https://youtube.com/@happylifeastro" },
                ].map((item) => (
                  <a
                    key={item.key}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition hover:scale-110 shadow-sm"
                    aria-label={item.key}
                  >
                    <BrandSocialIcon network={item.key} className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                  </a>
                ))}
              </div>

              {/* Email Line */}
              <div className="flex items-center justify-center gap-2 text-xs text-white/90 mb-6 relative z-10 font-semibold">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/80">
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <a href={`mailto:${template.footerConfig.contactEmail || "happylifereport@gmail.com"}`} className="hover:underline font-semibold tracking-wide">
                  {template.footerConfig.contactEmail || "happylifereport@gmail.com"}
                </a>
              </div>

              {/* Navigation Links */}
              <div className="flex flex-wrap justify-center gap-x-5 sm:gap-x-8 gap-y-2 text-[10px] sm:text-xs uppercase tracking-[0.2em] text-white font-bold mb-6 relative z-10 px-2">
                {(template.footerConfig.links || [
                  { label: "Privacy Policy", url: "/privacy-policy" },
                  { label: "Services", url: "/courses" },
                  { label: "Blog", url: "/news" },
                  { label: "Work", url: "/gig" },
                  { label: "Contact", url: "/contact" },
                ]).map((lnk, li) => (
                  <Link key={li} to={lnk.url || "#"} className="hover:opacity-75 transition-opacity">
                    {lnk.label}
                  </Link>
                ))}
              </div>

              {/* Bottom Tagline */}
              <div className="opacity-70 text-center relative z-10 border-t border-white/10 pt-5 w-full">
                <p className="text-[8px] sm:text-[9px] uppercase tracking-[0.25em] sm:tracking-[0.35em] font-medium text-white px-2">
                  {template.footerConfig.tagline ||
                    "ALIGN YOUR ENERGY, UNLOCK SUCCESS, AND LIVE WITH PURPOSE"}
                </p>
              </div>
            </div>
          )}

          {/* OPTION 2: Happy Life Split (Left & Right Positions) */}
          {template.footerConfig.templateStyle === 2 && (
            <div className="relative py-12 md:py-14 px-4 sm:px-8 md:px-16 lg:px-20 overflow-hidden flex flex-col justify-between min-h-[360px] select-none text-center md:text-left">
              <div className="absolute -top-24 -left-24 w-96 h-96 bg-white blur-[130px] rounded-full opacity-20 pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-black blur-[130px] rounded-full opacity-20 pointer-events-none" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 items-center relative z-10">
                {/* Left Side */}
                <div className="flex flex-col items-center md:items-start space-y-4 md:space-y-5">
                  <Link to="/" className="inline-block hover:scale-105 transition-transform">
                    <img
                      alt="Happy Life"
                      src="/logos/osa_logo.png"
                      className="h-11 sm:h-12 md:h-14 w-auto object-contain brightness-0 invert drop-shadow-md"
                    />
                  </Link>
                  <h2 className="text-xl sm:text-2xl md:text-4xl font-black tracking-tight text-white leading-snug sm:leading-tight">
                    {template.footerConfig.headline ||
                      "Your Birth Chart Holds Clues, Not Instant MIRACLES"}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-white/90 font-semibold">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/80">
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                    <a href={`mailto:${template.footerConfig.contactEmail || "happylifereport@gmail.com"}`} className="hover:underline">
                      {template.footerConfig.contactEmail || "happylifereport@gmail.com"}
                    </a>
                  </div>
                </div>

                {/* Right Side */}
                <div className="flex flex-col items-center md:items-end space-y-5 md:space-y-6">
                  {/* Real SVG Social Icons */}
                  <div className="flex items-center justify-center md:justify-end gap-3 sm:gap-4">
                    {[
                      { key: "facebook", url: template.footerConfig?.socialLinks?.facebook || "https://www.facebook.com/share/19fDGmAQnj/" },
                      { key: "twitter", url: template.footerConfig?.socialLinks?.twitter || "https://x.com" },
                      { key: "instagram", url: template.footerConfig?.socialLinks?.instagram || "https://www.instagram.com/happy_life_astro" },
                      { key: "youtube", url: template.footerConfig?.socialLinks?.youtube || "https://youtube.com/@happylifeastro" },
                    ].map((item) => (
                      <a
                        key={item.key}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition hover:scale-110 shadow-sm"
                        aria-label={item.key}
                      >
                        <BrandSocialIcon network={item.key} className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                      </a>
                    ))}
                  </div>

                  {/* Navigation Links */}
                  <div className="flex flex-wrap justify-center md:justify-end gap-x-5 gap-y-2 text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-white font-bold">
                    {(template.footerConfig.links || [
                      { label: "Privacy Policy", url: "/privacy-policy" },
                      { label: "Services", url: "/courses" },
                      { label: "Blog", url: "/news" },
                      { label: "Work", url: "/gig" },
                      { label: "Contact", url: "/contact" },
                    ]).map((lnk, li) => (
                      <Link key={li} to={lnk.url || "#"} className="hover:opacity-75 transition-opacity">
                        {lnk.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Tagline */}
              <div className="opacity-70 text-center relative z-10 border-t border-white/10 pt-5 mt-8 w-full">
                <p className="text-[8px] sm:text-[9px] uppercase tracking-[0.25em] sm:tracking-[0.35em] font-medium text-white px-2">
                  {template.footerConfig.tagline ||
                    "ALIGN YOUR ENERGY, UNLOCK SUCCESS, AND LIVE WITH PURPOSE"}
                </p>
              </div>
            </div>
          )}

          {/* OPTION 3: Happy Life Banner (Top & Bottom Positions) */}
          {template.footerConfig.templateStyle === 3 && (
            <div className="relative py-10 md:py-12 px-4 sm:px-8 md:px-16 lg:px-20 overflow-hidden flex flex-col justify-between min-h-[360px] select-none">
              <div className="absolute -top-24 -left-24 w-96 h-96 bg-white blur-[130px] rounded-full opacity-20 pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-black blur-[130px] rounded-full opacity-20 pointer-events-none" />

              {/* Top Row: Logo on Left, Social Icons on Right */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-5 border-b border-white/10 relative z-10">
                <Link to="/">
                  <img
                    alt="Happy Life"
                    src="/logos/osa_logo.png"
                    className="h-10 sm:h-12 w-auto object-contain brightness-0 invert drop-shadow-md"
                  />
                </Link>
                <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center">
                  <div className="flex items-center gap-2 text-xs text-white/90 font-medium">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                    <span className="text-[11px] sm:text-xs">{template.footerConfig.contactEmail || "happylifereport@gmail.com"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {[
                      { key: "facebook", url: template.footerConfig?.socialLinks?.facebook || "https://www.facebook.com/share/19fDGmAQnj/" },
                      { key: "twitter", url: template.footerConfig?.socialLinks?.twitter || "https://x.com" },
                      { key: "instagram", url: template.footerConfig?.socialLinks?.instagram || "https://www.instagram.com/happy_life_astro" },
                      { key: "youtube", url: template.footerConfig?.socialLinks?.youtube || "https://youtube.com/@happylifeastro" },
                    ].map((item) => (
                      <a
                        key={item.key}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition hover:scale-110 shadow-sm"
                        aria-label={item.key}
                      >
                        <BrandSocialIcon network={item.key} className="w-3.5 h-3.5" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Center Big Statement */}
              <div className="my-8 sm:my-10 text-center max-w-4xl mx-auto relative z-10 px-2">
                <h2 className="text-xl sm:text-3xl md:text-5xl font-black text-white tracking-tight leading-snug sm:leading-tight">
                  {template.footerConfig.headline ||
                    "Your Birth Chart Holds Clues, Not Instant MIRACLES"}
                </h2>
              </div>

              {/* Bottom Row: Links & Tagline */}
              <div className="pt-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/80 relative z-10">
                <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-[10px] uppercase tracking-[0.2em] font-bold text-white">
                  {(template.footerConfig.links || [
                    { label: "Privacy Policy", url: "/privacy-policy" },
                    { label: "Services", url: "/courses" },
                    { label: "Blog", url: "/news" },
                    { label: "Work", url: "/gig" },
                    { label: "Contact", url: "/contact" },
                  ]).map((lnk, li) => (
                    <Link key={li} to={lnk.url || "#"} className="hover:opacity-75 transition-opacity">
                      {lnk.label}
                    </Link>
                  ))}
                </div>

                <p className="text-[8px] sm:text-[9px] uppercase tracking-[0.25em] sm:tracking-[0.3em] font-medium text-white/70">
                  {template.footerConfig.tagline ||
                    "ALIGN YOUR ENERGY, UNLOCK SUCCESS, AND LIVE WITH PURPOSE"}
                </p>
              </div>
            </div>
          )}
        </footer>
      )}

      {/* WHATSAPP COMMUNITY POPUP MODAL AFTER FORM SUBMISSION */}
      {showWhatsappModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-md px-4 animate-in fade-in duration-300">
          <div className="bg-white border border-slate-200 p-6 md:p-8 max-w-lg w-full relative rounded-2xl shadow-2xl text-center space-y-5">
            {/* Dismiss X button */}
            <button
              onClick={() => setShowWhatsappModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              title="Close"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Checkmark icon */}
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center border-2 border-emerald-300 shadow-sm">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div className="space-y-1.5">
              <span className="inline-block px-3 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full uppercase tracking-wider">
                Submission Received!
              </span>
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Thank You for Registering!
              </h3>
              <p className="text-xs md:text-sm text-slate-600 max-w-sm mx-auto">
                Your details have been submitted successfully. Our team will reach out to you shortly.
              </p>
            </div>

            {/* WhatsApp Community Invitation Box */}
            <div className="bg-gradient-to-br from-emerald-50 via-green-50/70 to-emerald-50/30 border border-emerald-200/90 p-4 md:p-5 rounded-xl text-left space-y-3.5 shadow-sm">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#25D366] text-white flex items-center justify-center flex-shrink-0 shadow-md">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Join Our WhatsApp Community</h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Connect with fellow learners, get instant webinar links, study resources, and exclusive announcements.
                  </p>
                </div>
              </div>

              <a
                href={whatsappCommunityLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.99] text-white py-3 px-4 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                <span>Join WhatsApp Community</span>
                <svg className="w-4 h-4 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>

            {/* Close / Done Button */}
            <button
              type="button"
              onClick={() => setShowWhatsappModal(false)}
              className="w-full bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white py-3.5 px-4 rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              Continue Browsing
            </button>
          </div>
        </div>
      )}

      {/* Floating Register CTA Button for Builder Landing Pages */}
      <LandingRegisterButton />
    </div>
  );
}
