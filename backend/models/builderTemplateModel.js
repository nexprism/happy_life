import mongoose from "mongoose";

const componentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: [
        "hero",
        "about",
        "leadForm",
        "features",
        "stats",
        "testimonials",
        "faq",
        "ctaBanner",
        "customHtml",
        "video",
        "image",
      ],
    },
    content: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { _id: false }
);

const columnSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    width: { type: String, default: "full" }, // 'full', '1/2', etc.
    components: [componentSchema],
  },
  { _id: false }
);

const sectionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, default: "New Section" },
    layout: {
      type: String,
      enum: ["1-column", "2-column"],
      default: "1-column",
    },
    backgroundColor: { type: String, default: "#ffffff" },
    textColor: { type: String, default: "#1f2937" },
    paddingY: { type: String, default: "md" }, // 'sm', 'md', 'lg', 'xl'
    maxWidth: { type: String, default: "7xl" }, // '4xl', '5xl', '6xl', '7xl', 'full'
    columns: [columnSchema],
  },
  { _id: false }
);

const builderTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      index: true,
    },
    seo: {
      metaTitle: { type: String, default: "" },
      metaDescription: { type: String, default: "" },
      metaKeywords: [{ type: String }],
      ogImage: { type: String, default: "" },
    },
    headerConfig: {
      enabled: { type: Boolean, default: true },
      logoUrl: { type: String, default: "/logos/osa_logo.png" },
      siteTitle: { type: String, default: "" },
      navLinks: [
        {
          label: { type: String },
          url: { type: String },
        },
      ],
      ctaButton: {
        text: { type: String, default: "Enroll Now" },
        url: { type: String, default: "#lead-form" },
        variant: { type: String, default: "primary" },
      },
      shadowIntensity: { type: Number, default: 0 },
    },
    footerConfig: {
      enabled: { type: Boolean, default: true },
      templateStyle: { type: Number, default: 1 },
      headline: {
        type: String,
        default: "Your Birth Chart Holds Clues, Not Instant MIRACLES",
      },
      tagline: {
        type: String,
        default: "ALIGN YOUR ENERGY, UNLOCK SUCCESS, AND LIVE WITH PURPOSE",
      },
      brandBio: {
        type: String,
        default:
          "Empowering students and professionals to unlock their potential with personalized mentorship, live cohort training, and career tracking.",
      },
      newsletterHeading: {
        type: String,
        default: "Stay Ahead of Admission & Career Deadlines",
      },
      newsletterSubheading: {
        type: String,
        default:
          "Join 25,000+ ambitious learners receiving weekly scholarship alerts and exam updates.",
      },
      contactPhone: { type: String, default: "+91 98765 43210" },
      contactEmail: { type: String, default: "contact@happylife.com" },
      backgroundColor: { type: String, default: "#f8fafc" },
      textColor: { type: String, default: "#475569" },
      copyrightText: {
        type: String,
        default: "© 2026 Happy Life. All rights reserved.",
      },
      links: [
        {
          label: { type: String },
          url: { type: String },
        },
      ],
      socialLinks: {
        facebook: { type: String, default: "" },
        instagram: { type: String, default: "" },
        linkedin: { type: String, default: "" },
        twitter: { type: String, default: "" },
        youtube: { type: String, default: "" },
      },
    },
    sections: [sectionSchema],
    customCss: { type: String, default: "" },
    viewsCount: { type: Number, default: 0 },
    leadsCount: { type: Number, default: 0 },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

builderTemplateSchema.index({ status: 1, slug: 1 });

const BuilderTemplate = mongoose.model("BuilderTemplate", builderTemplateSchema);

export default BuilderTemplate;
