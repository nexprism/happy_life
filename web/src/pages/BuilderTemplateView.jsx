import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { isReservedSlug } from "../constants/reservedSlugs";

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

  // FAQ accordion open states
  const [openFaq, setOpenFaq] = useState({});

  const toggleFaq = (index) => {
    setOpenFaq((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  useEffect(() => {
    let isCancelled = false;

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
        const baseUrl =
          import.meta.env.VITE_BASE_URL || "http://localhost:5000";
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

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    setLeadError("");
    setLeadSuccess(false);

    if (!formData.name || !formData.email || !formData.phone) {
      setLeadError("Please fill in your name, email, and phone number.");
      return;
    }

    try {
      setSubmittingLead(true);
      const baseUrl =
        import.meta.env.VITE_BASE_URL || "http://localhost:5000";
      const res = await fetch(`${baseUrl}/builder/public/${slug}/lead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        setLeadSuccess(true);
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
      {template.headerConfig?.enabled && (
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/95 border-b border-slate-200 shadow-xs transition-all">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#2171B5] to-blue-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-600/20">
                HL
              </div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900">
                {template.headerConfig.siteTitle || "Happy Life"}
              </span>
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
      )}

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
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* 1-Column vs 2-Column Responsive Layout */}
                <div
                  className={
                    isTwoCol
                      ? "grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center"
                      : "max-w-4xl mx-auto space-y-12 text-center"
                  }
                >
                  {section.columns.map((column, cIdx) => (
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

                              {comp.content.trustText && (
                                <div className="flex items-center gap-2 pt-2 text-xs text-amber-500 font-medium">
                                  <div className="flex text-amber-500 text-sm">
                                    {"★".repeat(5)}
                                  </div>
                                  <span className="text-slate-600 font-sans">
                                    {comp.content.trustText}
                                  </span>
                                </div>
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
                                {comp.content.secondaryCtaText && (
                                  <a
                                    href={comp.content.secondaryCtaLink || "#"}
                                    className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 font-semibold rounded-xl text-sm border border-slate-200 transition active:scale-95"
                                  >
                                    {comp.content.secondaryCtaText}
                                  </a>
                                )}
                              </div>
                            </div>
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
                                <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
                                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold border border-emerald-200 shadow-xs">
                                    ✓
                                  </div>
                                  <h4 className="text-xl font-black text-emerald-800">
                                    Enquiry Received!
                                  </h4>
                                  <p className="text-xs sm:text-sm text-emerald-700 leading-relaxed">
                                    {comp.content.successMessage ||
                                      "Thank you! Our dedicated counselor will contact you shortly."}
                                  </p>
                                  <button
                                    type="button"
                                    onClick={() => setLeadSuccess(false)}
                                    className="text-xs text-[#2171B5] hover:text-blue-800 hover:underline pt-2 font-semibold cursor-pointer"
                                  >
                                    Submit another enquiry →
                                  </button>
                                </div>
                              ) : (
                                <form onSubmit={handleLeadSubmit} className="space-y-4 relative z-10 text-left">
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
                                    className="w-full mt-2 py-3.5 bg-[#2171B5] hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-blue-600/25 transition active:scale-98 disabled:opacity-50 cursor-pointer"
                                  >
                                    {submittingLead
                                      ? "Submitting..."
                                      : comp.content.buttonText || "Claim Free Consultation →"}
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

                          {/* 4. ABOUT COMPONENT */}
                          {comp.type === "about" && (
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

                              {comp.content.items &&
                                comp.content.items.length > 0 && (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                                    {comp.content.items.map((item, ii) => (
                                      <div
                                        key={ii}
                                        className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-[#2171B5]/40 transition space-y-1.5 shadow-xs"
                                      >
                                        <h4 className="font-bold text-sm text-[#2171B5]">
                                          {item.title}
                                        </h4>
                                        <p className="text-xs text-slate-600 leading-relaxed">
                                          {item.desc}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                            </div>
                          )}

                          {/* 5. FEATURES COMPONENT */}
                          {comp.type === "features" && (
                            <div className="space-y-8">
                              <div className="space-y-2 text-center">
                                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                                  {comp.content.title}
                                </h2>
                                {comp.content.subtitle && (
                                  <p className="text-sm text-slate-500 max-w-2xl mx-auto">
                                    {comp.content.subtitle}
                                  </p>
                                )}
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
                                {(comp.content.cards || []).map((card, ci) => (
                                  <div
                                    key={ci}
                                    className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-[#2171B5] transition-all group hover:shadow-lg space-y-3"
                                  >
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2171B5] flex items-center justify-center font-bold text-base border border-blue-200 group-hover:scale-105 transition">
                                      ★
                                    </div>
                                    <h3 className="font-bold text-base text-slate-900 group-hover:text-[#2171B5] transition">
                                      {card.title}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                      {card.desc}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* 6. TESTIMONIALS COMPONENT */}
                          {comp.type === "testimonials" && (
                            <div className="space-y-8">
                              <div className="space-y-2 text-center">
                                {comp.content.tag && (
                                  <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 rounded-full border border-amber-200">
                                    {comp.content.tag}
                                  </span>
                                )}
                                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                                  {comp.content.title || "Student Transformations"}
                                </h2>
                                {comp.content.subtitle && (
                                  <p className="text-sm text-slate-500 max-w-xl mx-auto">
                                    {comp.content.subtitle}
                                  </p>
                                )}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                                {(comp.content.reviews || [
                                  {
                                    name: "Aman Verma",
                                    role: "Frontend Engineer @ Razorpay",
                                    quote: "The hands-on guidance and interview prep helped me transition from a non-tech role into a high paying engineering job in 4 months.",
                                    rating: 5,
                                  },
                                  {
                                    name: "Sneha Patel",
                                    role: "Fullstack Dev @ Swiggy",
                                    quote: "The personalized doubt clearing and direct mentor feedback was a gamechanger. Best investment I made in my career.",
                                    rating: 5,
                                  },
                                  {
                                    name: "Rohan Nair",
                                    role: "Product Consultant",
                                    quote: "Clear structured syllabus with live capstone projects. The mock interviews simulated real tech rounds perfectly.",
                                    rating: 5,
                                  },
                                ]).map((rev, ri) => (
                                  <div
                                    key={ri}
                                    className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-[#2171B5] space-y-3 shadow-xs hover:shadow-md transition"
                                  >
                                    <div className="flex text-amber-500 text-sm">
                                      {"★".repeat(rev.rating || 5)}
                                    </div>
                                    <p className="text-xs sm:text-sm text-slate-600 italic leading-relaxed">
                                      "{rev.quote}"
                                    </p>
                                    <div className="pt-2 border-t border-slate-100">
                                      <p className="text-xs font-bold text-slate-900">{rev.name}</p>
                                      <p className="text-[11px] text-[#2171B5]">{rev.role}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* 7. FAQ COMPONENT */}
                          {comp.type === "faq" && (
                            <div className="space-y-6 max-w-3xl mx-auto text-left">
                              <div className="space-y-2 text-center">
                                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                                  {comp.content.title || "Frequently Asked Questions"}
                                </h2>
                                {comp.content.subtitle && (
                                  <p className="text-sm text-slate-500">
                                    {comp.content.subtitle}
                                  </p>
                                )}
                              </div>

                              <div className="space-y-3">
                                {(comp.content.faqs || []).map((faq, fi) => (
                                  <div
                                    key={fi}
                                    className="rounded-2xl border border-slate-200 bg-white overflow-hidden transition shadow-xs"
                                  >
                                    <button
                                      type="button"
                                      onClick={() => toggleFaq(fi)}
                                      className="w-full p-4 sm:p-5 text-left flex items-center justify-between text-sm sm:text-base font-semibold text-slate-900 hover:text-[#2171B5] transition cursor-pointer"
                                    >
                                      <span>{faq.question}</span>
                                      <span className="text-[#2171B5] font-mono text-xl ml-4">
                                        {openFaq[fi] ? "−" : "+"}
                                      </span>
                                    </button>
                                    {openFaq[fi] && (
                                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 border-t border-slate-100 leading-relaxed">
                                        {faq.answer}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* 8. CTA BANNER COMPONENT */}
                          {comp.type === "ctaBanner" && (
                            <div className="p-8 sm:p-14 rounded-3xl bg-gradient-to-r from-[#2171B5] via-blue-600 to-indigo-700 text-white text-center space-y-5 shadow-xl relative overflow-hidden">
                              {comp.content.badge && (
                                <span className="inline-block px-3.5 py-1 text-xs font-black uppercase tracking-wider text-amber-300 bg-black/20 rounded-full border border-amber-300/30">
                                  {comp.content.badge}
                                </span>
                              )}
                              <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight text-white">
                                {comp.content.title}
                              </h2>
                              <p className="text-sm sm:text-base text-blue-100 max-w-xl mx-auto leading-relaxed">
                                {comp.content.subtitle}
                              </p>
                              <div className="pt-2">
                                <a
                                  href={comp.content.buttonLink || "#lead-form"}
                                  className="inline-block px-8 py-3.5 bg-white text-blue-900 hover:bg-slate-50 font-black rounded-xl text-sm shadow-xl transition active:scale-95"
                                >
                                  {comp.content.buttonText || "Get Started Today →"}
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
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
    </div>
  );
}
