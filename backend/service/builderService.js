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

    // If no footerConfig provided, supply default Happy Life Signature footer
    if (!data.footerConfig || !data.footerConfig.headline) {
      data.footerConfig = {
        enabled: true,
        templateStyle: 1,
        headline: "Your Birth Chart Holds Clues, Not Instant MIRACLES",
        contactEmail: "happylifereport@gmail.com",
        tagline: "ALIGN YOUR ENERGY, UNLOCK SUCCESS, AND LIVE WITH PURPOSE",
        backgroundColor: "#2171B5",
        textColor: "#ffffff",
        links: [
          { label: "Privacy Policy", url: "/privacy-policy" },
          { label: "Services", url: "/courses" },
          { label: "Blog", url: "/news" },
          { label: "Work", url: "/gig" },
          { label: "Contact", url: "/contact" },
        ],
        socialLinks: {
          facebook: "https://www.facebook.com/share/19fDGmAQnj/",
          twitter: "https://x.com",
          instagram: "https://www.instagram.com/happy_life_astro",
          youtube: "https://youtube.com/@happylifeastro",
        },
      };
    }

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
      // 1. Hero Section ("Mega Astrology Webinar" - Cosmic Blue Background)
      {
        id: "sec-hero-" + timestamp,
        name: "Mega Astrology Webinar Hero",
        layout: "1-column",
        backgroundColor: "#071322",
        textColor: "#ffffff",
        paddingY: "lg",
        columns: [
          {
            id: "col-hero-main",
            width: "full",
            components: [
              {
                id: "comp-hero-" + timestamp,
                type: "hero",
                content: {
                  style: "webinar",
                  badge: "LIVE 2-DAYS IMMERSIVE MASTERCLASS",
                  title: "Mega Astrology Webinar",
                  subtitle:
                    "Enhance your astrological understanding with our 2 Days webinar, seamlessly integrating traditional Vedic astrology with practical, modern applications. Learn to interpret birth charts and celestial influences under the guidance of Astro Arun Pandit.",
                  eventDate: "24 Oct, 2026",
                  eventTime: "01:00 PM",
                  duration: "4 Hours",
                  mentorName: "Astro Arun Pandit",
                  originalPrice: "₹999",
                  discountPrice: "₹99/-",
                  buttonText: "Register Now ₹999 ₹99/-",
                  buttonLink: "#lead-form",
                  mentorImage: "/hero_image_2.png",
                  backgroundImage: "",
                },
              },
            ],
          },
        ],
      },

      // 2. Why Join Section (Benefits List + Media Player Container)
      {
        id: "sec-whyjoin-" + (timestamp + 1),
        name: "Why Join The Webinar",
        layout: "1-column",
        backgroundColor: "#ffffff",
        textColor: "#0F172A",
        paddingY: "lg",
        columns: [
          {
            id: "col-whyjoin",
            width: "full",
            components: [
              {
                id: "comp-whyjoin-info-" + (timestamp + 1),
                type: "about",
                content: {
                  style: "whyJoin",
                  align: "center",
                  title: "Why join the webinar?",
                  subtitle:
                    "This webinar will help you leverage the impact of stars in day-to-day life.",
                  titleFontSize: "4xl",
                  subtitleFontSize: "base",
                  pointersFontSize: "base",
                  iconSize: "md",
                  videoPosition: "belowHeading",
                  videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                  imageUrl: "/hero_image_2.png",
                  benefits: [
                    "Make confident and informed life decisions.",
                    "Manage stress and anxiety more effectively.",
                    "Fulfil your dreams like buying your own house.",
                    "Enhance your health and well-being through spiritual insights.",
                    "Get logical and practical remedies to tackle life's challenges.",
                    "Maintain stronger relationships with family and friends.",
                  ],
                  buttonText: "Register now",
                  buttonLink: "#lead-form",
                },
              },
            ],
          },
        ],
      },

      // 3. Curriculum Cards ("What will you learn in this mega webinar?")
      {
        id: "sec-learn-" + (timestamp + 2),
        name: "What You Will Learn",
        layout: "1-column",
        backgroundColor: "#ffffff",
        textColor: "#0F172A",
        paddingY: "lg",
        columns: [
          {
            id: "col-learn-main",
            width: "full",
            components: [
              {
                id: "comp-learn-" + (timestamp + 2),
                type: "features",
                content: {
                  style: "vedicModules",
                  title: "What will you learn in this mega webinar?",
                  subtitle:
                    "Here's the module for you to learn astrology online through our webinar...",
                  modules: [
                    {
                      id: 1,
                      iconType: "clover",
                      title: "Improving Your Luck with Astrology",
                      desc: "Use astrological methods to make your luck stronger.",
                    },
                    {
                      id: 2,
                      iconType: "kundali",
                      title: "Understanding Your Birth Chart/Kundali",
                      desc: "Learn about the secrets in your birth chart.",
                    },
                    {
                      id: 3,
                      iconType: "planets",
                      title: "How Planets Affect Your Life",
                      desc: "See how planets influence important parts of your life like your job, love life, and money.",
                    },
                    {
                      id: 4,
                      iconType: "yantra",
                      title: "Basics of Vedic Astrology",
                      desc: "Understand the simple rules that Vedic astrology is built on.",
                    },
                    {
                      id: 5,
                      iconType: "rashi",
                      title: "Rashi/ Zodiac Signs Insights",
                      desc: "Get special tips based on your Rashi.",
                    },
                    {
                      id: 6,
                      iconType: "lagna",
                      title: "Deep Dive into Lagna Chart",
                      desc: "Get a full understanding of Lagna chart.",
                    },
                  ],
                  bottomText:
                    "This webinar will equip you with actionable insights...",
                },
              },
            ],
          },
        ],
      },

      // 4. Frequently Asked Questions (Accordion)
      {
        id: "sec-faq-" + (timestamp + 3),
        name: "Frequently Asked Questions",
        layout: "1-column",
        backgroundColor: "#ffffff",
        textColor: "#0F172A",
        paddingY: "lg",
        columns: [
          {
            id: "col-faq-main",
            width: "full",
            components: [
              {
                id: "comp-faq-" + (timestamp + 3),
                type: "faq",
                content: {
                  title: "Frequently Asked Questions",
                  subtitle:
                    "Find fast answers to all common questions regarding webinar timings, joining, and materials.",
                  faqs: [
                    {
                      question: "Is there a registration fee for the webinar?",
                      answer:
                        "Yes, there is a nominal fee of ₹99 (discounted from ₹999) to cover online portal streaming costs and personal study materials.",
                    },
                    {
                      question: "Where can I join the webinar?",
                      answer:
                        "Upon successful registration, your private meeting link and calendar invites will be sent directly to your registered WhatsApp number and Email.",
                    },
                    {
                      question: "Where will the webinar take place?",
                      answer:
                        "The webinar takes place live on Zoom / private streaming portal. You can easily join from any smartphone, tablet, or PC.",
                    },
                    {
                      question: "Who should attend this webinar?",
                      answer:
                        "Anyone curious about Vedic astrology, deciphering their birth chart, discovering life timing, planetary remedies, and self-empowerment.",
                    },
                    {
                      question:
                        "Will there be reminders sent out before the webinar begins?",
                      answer:
                        "Yes, our automated assistant sends alerts 24 hours, 2 hours, and 15 minutes before the session kicks off.",
                    },
                    {
                      question: "What should I have ready for the webinar?",
                      answer:
                        "Please keep your exact date of birth, time of birth, and place of birth ready so you can map your personal planetary positions.",
                    },
                    {
                      question:
                        "Can I participate in this webinar with my family or partners?",
                      answer:
                        "Yes! Family members can attend together from one screen or register separately for individual chart consultations.",
                    },
                    {
                      question: "Is the Webinar Refundable?",
                      answer:
                        "Yes, we offer a 100% no-questions-asked satisfaction guarantee if you attend the opening session and do not find it transformative.",
                    },
                  ],
                },
              },
            ],
          },
        ],
      },

      // 5. Action Banner (Still Thinking - Happy Life Ocean Blue)
      {
        id: "sec-cta-" + (timestamp + 4),
        name: "Still Thinking CTA Banner",
        layout: "1-column",
        backgroundColor: "#ffffff",
        textColor: "#ffffff",
        paddingY: "md",
        columns: [
          {
            id: "col-cta-main",
            width: "full",
            components: [
              {
                id: "comp-cta-" + (timestamp + 4),
                type: "ctaBanner",
                content: {
                  style: "expertCallout",
                  title: "Still thinking? Let us help you take the first step.",
                  subtitle:
                    "Connect directly with our Vedic astrology team to get personalized guidance.",
                  buttonText: "Talk to an expert",
                  buttonLink: "#lead-form",
                  expertImage: "/hero_image_2.png",
                  backgroundColor: "#2171B5",
                },
              },
            ],
          },
        ],
      },

      // 6. Registration Lead Form
      {
        id: "sec-lead-" + (timestamp + 5),
        name: "Webinar Registration Form",
        layout: "1-column",
        backgroundColor: "#f8fafc",
        textColor: "#0F172A",
        paddingY: "lg",
        columns: [
          {
            id: "col-lead-main",
            width: "full",
            components: [
              {
                id: "comp-lead-" + (timestamp + 5),
                type: "leadForm",
                content: {
                  badge: "LIMITED SEATS AVAILABLE",
                  title: "Secure Your Webinar Seat Today",
                  subtitle:
                    "Fill out your details to receive immediate confirmation and birth chart preparatory kit.",
                  buttonText: "Complete Registration (₹99) →",
                  fields: [
                    {
                      name: "name",
                      label: "Full Name",
                      type: "text",
                      required: true,
                      placeholder: "Enter your full name...",
                    },
                    {
                      name: "phone",
                      label: "WhatsApp Number",
                      type: "tel",
                      required: true,
                      placeholder: "+91 98765 43210",
                    },
                    {
                      name: "email",
                      label: "Email Address",
                      type: "email",
                      required: true,
                      placeholder: "yourname@example.com",
                    },
                    {
                      name: "source",
                      label: "Where did you find out about us?",
                      type: "select",
                      required: true,
                      options: [
                        "Instagram",
                        "YouTube",
                        "Facebook",
                        "Twitter / X",
                        "Friend / Referral",
                        "Google Search",
                        "Other",
                      ],
                      placeholder: "Select source...",
                    },
                    {
                      name: "notes",
                      label: "Any specific query or life focus area?",
                      type: "textarea",
                      required: false,
                      placeholder:
                        "e.g. Career growth, health, marriage, business...",
                    },
                  ],
                  guaranteeText:
                    "🔒 Instant WhatsApp confirmation. Secure payment gateway. 100% money-back guarantee.",
                  successMessage:
                    "🎉 Registration complete! Check your WhatsApp for webinar link and schedule.",
                },
              },
            ],
          },
        ],
      },
    ];
  }}

export default new BuilderService();
