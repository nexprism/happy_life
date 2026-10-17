import slugify from "slugify";
import builderRepo from "../repository/builderRepository.js";
import leadRepo from "../repository/leadRepository.js";
import { isReservedSlug } from "../constants/reservedSlugs.js";
import { initRedis, redisClient } from "../config/redisClient.js";

let isRedisAvailable = true;

class BuilderService {
  /**
   * Generates a unique, valid slug for a template.
   */
  async generateUniqueSlug(baseName, currentId = null) {
    let base = slugify(baseName || "template", {
      lower: true,
      strict: true,
      trim: true,
    });

    if (!base) base = "landing-page";

    if (isReservedSlug(base)) {
      base = `${base}-page`;
    }

    let candidate = base;
    let counter = 1;

    while (true) {
      const existing = await builderRepo.findBySlug(candidate);
      if (!existing || (currentId && existing._id.toString() === currentId.toString())) {
        return candidate;
      }
      candidate = `${base}-${counter}`;
      counter++;
    }
  }

  /**
   * Safely obtain Redis client with short timeout to prevent blocking local development
   */
  async getSafeRedis() {
    if (!isRedisAvailable) return null;
    try {
      if (redisClient && redisClient.isOpen) return redisClient;
      const redisPromise = initRedis();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Redis timeout")), 400)
      );
      const client = await Promise.race([redisPromise, timeoutPromise]);
      return client;
    } catch {
      isRedisAvailable = false;
      return null;
    }
  }

  /**
   * Safely delete Redis keys matching a pattern.
   */
  async invalidateCache(slug = null) {
    try {
      const redis = await this.getSafeRedis();
      if (redis && redis.isOpen) {
        if (slug) {
          await redis.del(`template:public:${slug}`);
        }
        await redis.del("templates:public:all");
      }
    } catch {
      // Redis is optional
    }
  }

  async createTemplate(data, userId) {
    if (!data.name) {
      throw new Error("Template name is required");
    }

    let slug = data.slug
      ? slugify(data.slug, { lower: true, strict: true, trim: true })
      : "";

    if (!slug) {
      slug = await this.generateUniqueSlug(data.name);
    } else {
      if (isReservedSlug(slug)) {
        throw new Error(`The slug '${slug}' is reserved and cannot be used.`);
      }
      const existing = await builderRepo.findBySlug(slug);
      if (existing) {
        throw new Error(`The slug '${slug}' is already taken. Please choose another.`);
      }
    }

    data.slug = slug;
    data.createdBy = userId;

    // If no sections provided, provide a starter hero + lead form section
    if (!data.sections || data.sections.length === 0) {
      data.sections = this.getDefaultStarterSections(data.name);
    }

    const template = await builderRepo.create(data);
    await this.invalidateCache(template.slug);
    return template;
  }

  async getAllTemplates(filter = {}, sort = { updatedAt: -1 }, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    return await builderRepo.findAll(filter, sort, skip, limit);
  }

  async getTemplateById(id) {
    return await builderRepo.findById(id);
  }

  async getPublishedTemplateBySlug(slug) {
    const cacheKey = `template:public:${slug}`;
    try {
      const redis = await this.getSafeRedis();
      if (redis && redis.isOpen) {
        const cached = await redis.get(cacheKey);
        if (cached) {
          // Increment views count asynchronously
          builderRepo.incrementViews(slug).catch(() => {});
          return JSON.parse(cached);
        }
      }
    } catch {
      // fallback
    }

    const template = await builderRepo.findPublishedBySlug(slug);
    if (!template) return null;

    // Increment views count
    await builderRepo.incrementViews(slug);

    try {
      const redis = await this.getSafeRedis();
      if (redis && redis.isOpen) {
        await redis.setEx(cacheKey, 300, JSON.stringify(template)); // 5 min TTL
      }
    } catch {}

    return template;
  }

  async updateTemplate(id, data) {
    const existing = await builderRepo.findById(id);
    if (!existing) {
      throw new Error("Template not found");
    }

    if (data.slug && data.slug !== existing.slug) {
      const newSlug = slugify(data.slug, { lower: true, strict: true, trim: true });
      if (isReservedSlug(newSlug)) {
        throw new Error(`The slug '${newSlug}' is reserved.`);
      }
      const duplicate = await builderRepo.findBySlug(newSlug);
      if (duplicate && duplicate._id.toString() !== id) {
        throw new Error(`The slug '${newSlug}' is already taken.`);
      }
      data.slug = newSlug;
    }

    const updated = await builderRepo.update(id, data);
    await this.invalidateCache(existing.slug);
    if (updated && updated.slug !== existing.slug) {
      await this.invalidateCache(updated.slug);
    }
    return updated;
  }

  async deleteTemplate(id) {
    const existing = await builderRepo.findById(id);
    if (!existing) {
      throw new Error("Template not found");
    }
    const res = await builderRepo.delete(id);
    await this.invalidateCache(existing.slug);
    return res;
  }

  async cloneTemplate(id, userId) {
    const existing = await builderRepo.findById(id);
    if (!existing) {
      throw new Error("Template not found");
    }

    const cloneData = existing.toObject();
    delete cloneData._id;
    delete cloneData.createdAt;
    delete cloneData.updatedAt;

    cloneData.name = `${existing.name} (Copy)`;
    cloneData.slug = await this.generateUniqueSlug(`${existing.slug}-copy`);
    cloneData.status = "draft";
    cloneData.viewsCount = 0;
    cloneData.leadsCount = 0;
    cloneData.createdBy = userId;

    return await builderRepo.create(cloneData);
  }

  // --- Leads management ---

  async submitLead(slug, leadData, reqInfo = {}) {
    const template = await builderRepo.findBySlug(slug);
    if (!template) {
      throw new Error("Template not found or inactive.");
    }

    if (!leadData.name || !leadData.email || !leadData.phone) {
      throw new Error("Name, email, and phone number are required.");
    }

    // Email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(leadData.email)) {
      throw new Error("Please provide a valid email address.");
    }

    // Phone simple sanitize & length check
    const cleanPhone = String(leadData.phone).replace(/\s+/g, "");
    if (cleanPhone.length < 8) {
      throw new Error("Please provide a valid phone number.");
    }

    // Gather extra dynamic inputs (e.g. source, batch, education)
    const { name, email, phone, notes, message, extraFields: existingExtra, ...dynamicInputs } = leadData;
    const finalExtraFields = { ...(existingExtra || {}), ...dynamicInputs };

    const record = await leadRepo.create({
      templateId: template._id,
      templateSlug: template.slug,
      name: leadData.name.trim(),
      email: leadData.email.trim().toLowerCase(),
      phone: cleanPhone,
      notes: leadData.notes || leadData.message || (finalExtraFields.source ? `Source: ${finalExtraFields.source}` : ""),
      extraFields: finalExtraFields,
      ipAddress: reqInfo.ip || "",
      userAgent: reqInfo.userAgent || "",
    });

    await builderRepo.incrementLeads(template._id);
    return record;
  }

  async getAllLeads(filter = {}, sort = { createdAt: -1 }, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    return await leadRepo.findAll(filter, sort, skip, limit);
  }

  async updateLeadStatus(id, status) {
    return await leadRepo.updateStatus(id, status);
  }

  async deleteLead(id) {
    return await leadRepo.delete(id);
  }

  /**
   * Helper to generate standard starter template with side-by-side Hero + Lead Form
   * and comprehensive modern sections matching Happy Life vibe
   */
  getDefaultStarterSections(templateName) {
    const timestamp = Date.now();

    return [
      // 1. Hero with Glassmorphism Lead Form (2-Column Side by Side)
      {
        id: "sec-hero-" + timestamp,
        name: "Hero with Lead Capture Form",
        layout: "2-column",
        backgroundColor: "#070c18",
        textColor: "#ffffff",
        paddingY: "xl",
        columns: [
          {
            id: "col-hero-left",
            width: "1/2",
            components: [
              {
                id: "comp-hero-" + timestamp,
                type: "hero",
                content: {
                  badge: "🚀 Next-Gen Industry Cohort 2026",
                  title: `Master High-Income Skills with ${templateName}`,
                  subtitle:
                    "Accelerate your professional trajectory with hands-on live project labs, 1-on-1 industry mentorship, and dedicated recruitment pipelines.",
                  bulletPoints: [
                    "Live interactive bootcamps led by senior practitioners",
                    "Real-world enterprise capstone projects for your portfolio",
                    "Industry accredited certification upon graduation",
                    "100% personalized placement assistance & interview prep",
                  ],
                  trustText: "Rated 4.9/5 by 12,000+ ambitious students worldwide",
                  ctaText: "Enroll in Program",
                  ctaLink: "#lead-form",
                  secondaryCtaText: "Explore Curriculum ↓",
                  secondaryCtaLink: "#curriculum",
                },
              },
            ],
          },
          {
            id: "col-hero-right",
            width: "1/2",
            components: [
              {
                id: "comp-lead-" + (timestamp + 1),
                type: "leadForm",
                content: {
                  badge: "⚡ LIMITED COHORT SEATS",
                  title: "Book Free VIP Consultation",
                  subtitle: "Fill in your details to receive syllabus pack & a dedicated advisor call.",
                  buttonText: "Claim Free Consultation →",
                  fields: [
                    { name: "name", label: "Full Name", type: "text", required: true, placeholder: "e.g. Rahul Sharma" },
                    { name: "email", label: "Email Address", type: "email", required: true, placeholder: "e.g. rahul@example.com" },
                    { name: "phone", label: "WhatsApp / Phone Number", type: "tel", required: true, placeholder: "e.g. +91 98765 43210" },
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
                    { name: "notes", label: "Your Learning Goal or Query", type: "textarea", required: false, placeholder: "Tell us about your background or goals..." },
                  ],
                  guaranteeText: "🔒 100% Privacy. Zero spam. Advisor connects within 24h.",
                  successMessage: "🎉 Success! Your consultation spot has been reserved. Our advisor will reach out shortly.",
                },
              },
            ],
          },
        ],
      },

      // 2. Metric / Stats Credibility Strip (1-Column)
      {
        id: "sec-stats-" + (timestamp + 2),
        name: "Key Milestones & Credibility",
        layout: "1-column",
        backgroundColor: "#0d1527",
        textColor: "#ffffff",
        paddingY: "md",
        columns: [
          {
            id: "col-stats",
            width: "full",
            components: [
              {
                id: "comp-stats-" + (timestamp + 2),
                type: "stats",
                content: {
                  title: "Numbers That Speak For Themselves",
                  subtitle: "Empowering students across India to break into top tier tech & creative careers",
                  stats: [
                    { number: "15,000+", label: "Graduated Students", icon: "GraduationCap" },
                    { number: "98.4%", label: "Career Placement Rate", icon: "TrendingUp" },
                    { number: "4.9 / 5.0", label: "Average Review Rating", icon: "Star" },
                    { number: "120+", label: "Hiring Enterprise Partners", icon: "Building2" },
                  ],
                },
              },
            ],
          },
        ],
      },

      // 3. Why Happy Life Advantage (2-Column Side by Side)
      {
        id: "sec-about-" + (timestamp + 3),
        name: "About Program & Real-World Edge",
        layout: "2-column",
        backgroundColor: "#070c18",
        textColor: "#ffffff",
        paddingY: "lg",
        columns: [
          {
            id: "col-about-left",
            width: "1/2",
            components: [
              {
                id: "comp-about-" + (timestamp + 3),
                type: "about",
                content: {
                  tag: "WHY HAPPY LIFE?",
                  title: "A Complete Ecosystem Built for Your Professional Breakthrough",
                  description:
                    "Traditional universities and theoretical tutorials leave you stranded with outdated concepts. At Happy Life, you build production-ready projects under real pressure, with senior architects reviewing your every milestone.",
                  items: [
                    { title: "Direct Industry Mentorship", desc: "Weekly 1-on-1 doubt solving with senior leads working at tier-1 firms." },
                    { title: "Guaranteed Placement Pipeline", desc: "Exclusive access to private hiring drives, resume teardowns & mock HR panels." },
                    { title: "Lifelong Alumni Network", desc: "Join an elite community of founders, creators, and engineers sharing real opportunities." },
                  ],
                },
              },
            ],
          },
          {
            id: "col-about-right",
            width: "1/2",
            components: [
              {
                id: "comp-features-preview-" + (timestamp + 3),
                type: "ctaBanner",
                content: {
                  badge: "CURRICULUM HIGHLIGHT",
                  title: "Industry Aligned Modern Syllabus",
                  subtitle: "Updated every quarter to match modern engineering and market standards. Zero fluff, 100% actionable execution.",
                  buttonText: "Request Syllabus Pack ↓",
                  buttonLink: "#lead-form",
                },
              },
            ],
          },
        ],
      },

      // 4. Detailed Features Grid (1-Column)
      {
        id: "sec-features-" + (timestamp + 4),
        name: "What You Will Master",
        layout: "1-column",
        backgroundColor: "#0b1222",
        textColor: "#ffffff",
        paddingY: "lg",
        columns: [
          {
            id: "col-features",
            width: "full",
            components: [
              {
                id: "comp-features-" + (timestamp + 4),
                type: "features",
                content: {
                  title: "Comprehensive Practical Capabilities",
                  subtitle: "Engineered from the ground up to make you indispensable in today's demanding market.",
                  cards: [
                    { title: "Architectural Fundamentals", desc: "Build rock-solid conceptual grounding that survives tech trends." },
                    { title: "Live Real-World Projects", desc: "Ship enterprise applications that prove your practical competence." },
                    { title: "AI & Automation Mastery", desc: "Harness cutting-edge AI workflows to deliver 10x faster output." },
                    { title: "Code Reviews & Best Practices", desc: "Learn clean code patterns, performance optimization, and testing." },
                    { title: "Client Acquisition & Sales", desc: "Master communication, pitching, and value negotiation with confidence." },
                    { title: "Interview Guarantee Pipeline", desc: "Tailored portfolio and direct referrals to active hiring partners." },
                  ],
                },
              },
            ],
          },
        ],
      },

      // 5. Frequently Asked Questions (1-Column)
      {
        id: "sec-faq-" + (timestamp + 5),
        name: "Frequently Asked Questions",
        layout: "1-column",
        backgroundColor: "#070c18",
        textColor: "#ffffff",
        paddingY: "lg",
        columns: [
          {
            id: "col-faq",
            width: "full",
            components: [
              {
                id: "comp-faq-" + (timestamp + 5),
                type: "faq",
                content: {
                  title: "Got Questions? We Have Answers",
                  subtitle: "Everything you need to know before joining the program.",
                  faqs: [
                    { question: "Is this program suitable for complete beginners?", answer: "Yes! The curriculum is designed in structured progressive tiers, starting from ground fundamentals before moving to advanced real-world implementations." },
                    { question: "Are the live sessions recorded if I miss one?", answer: "Yes, all sessions are recorded in full HD and made available immediately in your Happy Life student dashboard with lifetime access." },
                    { question: "What kind of placement support will I receive?", answer: "You get dedicated resume reviews, portfolio audits, mock interviews, and direct referral opportunities through our 120+ hiring partner network." },
                    { question: "Will I receive an official certificate?", answer: "Yes, you receive an accredited, verifiable Happy Life graduation certificate that you can showcase on LinkedIn and your resume." },
                  ],
                },
              },
            ],
          },
        ],
      },

      // 6. Urgency High-Converting CTA Banner (1-Column)
      {
        id: "sec-cta-" + (timestamp + 6),
        name: "Final Action & Enrollment Call",
        layout: "1-column",
        backgroundColor: "#0d1527",
        textColor: "#ffffff",
        paddingY: "lg",
        columns: [
          {
            id: "col-cta-final",
            width: "full",
            components: [
              {
                id: "comp-cta-" + (timestamp + 6),
                type: "ctaBanner",
                content: {
                  badge: "🔥 SEATS CLOSING SOON",
                  title: "Step Into Your Dream Career Today",
                  subtitle: "Don't spend another year wondering what if. Join thousands of successful alumni who transformed their lives with Happy Life.",
                  buttonText: "Claim Your Spot Now →",
                  buttonLink: "#lead-form",
                },
              },
            ],
          },
        ],
      },
    ];
  }
}

export default new BuilderService();
