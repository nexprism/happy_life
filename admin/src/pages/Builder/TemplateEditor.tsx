import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  builderService,
  BuilderTemplate,
  SectionItem,
  ComponentItem,
} from "../../services/builderService";
import {
  ArrowLeft,
  Save,
  Globe,
  Smartphone,
  Tablet,
  Monitor,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Settings,
  Copy,
  Layers,
  Sparkles,
  HelpCircle,
  Mail,
  Phone,
  Type,
  FileText,
  Columns,
  Square,
  X,
  Loader2,
  ExternalLink,
  ChevronDown,
  Star,
  Check,
  Compass,
  LayoutGrid,
  Sidebar,
  PanelBottom,
  GripVertical,
  Sliders,
  Palette,
  CheckCircle2,
  Upload,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  Calendar,
  Clock,
  Hourglass,
  User as UserIcon,
  Play,
  Video as VideoIcon,
  Image as ImageIcon,
  Minus,
} from "lucide-react";
import {
  LotusChakraIcon,
  CelestialZodiacWheel,
  getVedicIcon,
} from "../../components/VedicIcons";

type ViewportMode = "desktop" | "tablet" | "mobile";

export const getMaxWidthClass = (width?: string) => {
  switch (width) {
    case "4xl":
      return "max-w-4xl";
    case "5xl":
      return "max-w-5xl";
    case "6xl":
      return "max-w-6xl";
    case "7xl":
      return "max-w-7xl";
    case "full":
      return "max-w-full";
    default:
      return "max-w-7xl";
  }
};


// 1. Sections Categories definition matching the user's screenshots
interface SectionCategory {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SECTION_CATEGORIES: SectionCategory[] = [
  { id: "happy_life_webinar", name: "⭐ Happy Life Webinar", icon: Sparkles },
  { id: "hero", name: "Hero Section", icon: Sidebar },
  { id: "why_join", name: "Why Join Webinar", icon: LayoutGrid },
  { id: "vedic_learn", name: "What You'll Learn", icon: LayoutGrid },
  { id: "faq", name: "FAQ Accordion", icon: HelpCircle },
  { id: "cta_banner", name: "Still Thinking Banner", icon: LayoutGrid },
  { id: "assessment", name: "Registration Form", icon: LayoutGrid },
  { id: "footers", name: "Happy Life Footers", icon: PanelBottom },
  { id: "headers", name: "Headers", icon: Compass },
  { id: "admin_analytics", name: "Stats & Metrics", icon: LayoutGrid },
];

// Authentic SVG Brand Icons for Happy Life
const BrandSocialIcon = ({ network, className = "w-4 h-4" }: { network: string; className?: string }) => {
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

export default function TemplateEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [template, setTemplate] = useState<BuilderTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [viewport, setViewport] = useState<ViewportMode>("desktop");
  const [desktopCanvasWidth, setDesktopCanvasWidth] = useState<"5xl" | "6xl" | "7xl" | "full">("7xl");
  const [uploadingMediaField, setUploadingMediaField] = useState<string | null>(null);

  const handleMediaUpload = async (
    file: File,
    fieldKey: string,
    onSuccess: (url: string) => void
  ) => {
    if (!file) return;
    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");
    if (!isVideo && !isImage) {
      toast.error("Please upload a valid image or video file");
      return;
    }
    const toastId = toast.loading(`Uploading ${isVideo ? "video" : "image"} (${(file.size / (1024 * 1024)).toFixed(1)}MB)...`);
    setUploadingMediaField(fieldKey);
    try {
      const res = await builderService.uploadMedia(file);
      if (res?.success && res.url) {
        toast.success(`${isVideo ? "Video" : "Image"} uploaded successfully!`, { id: toastId });
        onSuccess(res.url);
      } else {
        toast.error(res?.message || "Upload failed", { id: toastId });
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error(err?.response?.data?.message || err.message || "Failed to upload media", { id: toastId });
    } finally {
      setUploadingMediaField(null);
    }
  };
  const isMobileView = viewport === "mobile";

  // Selected Section Category on the Left Panel (e.g. "hero", "assessment")
  const [activeCategory, setActiveCategory] = useState<string>("hero");

  // Selected item for the Right Design Customizer
  const [selectedItem, setSelectedItem] = useState<{
    type: "header" | "footer" | "seo" | "section" | "component";
    sectionIndex?: number;
    columnIndex?: number;
    componentIndex?: number;
  }>({ type: "section", sectionIndex: 0 });

  const [isInspectorOpen, setIsInspectorOpen] = useState(true);

  // New option input for select field in inspector
  const [newOptionInput, setNewOptionInput] = useState<{ [fieldIndex: number]: string }>({});

  // Base font size slider for Style Theme Colors
  const [baseFontSize, setBaseFontSize] = useState<number>(14);
  const [openFaqs, setOpenFaqs] = useState<{ [index: number]: boolean }>({ 0: true });

  // Load template
  useEffect(() => {
    if (!id) return;
    const fetchTemplate = async () => {
      try {
        setLoading(true);
        const res = await builderService.getTemplateById(id);
        if (res.success && res.data) {
          const tpl = res.data;
          // Ensure any leadForm component in template has default fields populated if empty
          tpl.sections?.forEach((sec) => {
            // Default background to clean white if not set or if dark
            if (!sec.backgroundColor || sec.backgroundColor === "#070c18") {
              sec.backgroundColor = "#ffffff";
              sec.textColor = "#0F172A";
            }
            sec.columns?.forEach((col) => {
              col.components?.forEach((comp) => {
                if (comp.type === "leadForm" && (!comp.content.fields || comp.content.fields.length === 0)) {
                  comp.content.fields = [
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
                    { name: "notes", label: "Query or Learning Goals", type: "textarea", required: false, placeholder: "Tell us about your background or goals..." },
                  ];
                }
              });
            });
          });
          setTemplate(tpl);
        } else {
          toast.error("Failed to load template");
          navigate("/builder/templates");
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Error loading template");
        navigate("/builder/templates");
      } finally {
        setLoading(false);
      }
    };
    fetchTemplate();
  }, [id, navigate]);

  // Save template
  const handleSave = async (showToast = true) => {
    if (!template || !template._id) return;
    try {
      setSaving(true);
      const res = await builderService.updateTemplate(template._id, template);
      if (res.success) {
        setTemplate(res.data);
        if (showToast) toast.success("Landing page saved successfully!");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save template");
    } finally {
      setSaving(false);
    }
  };

  // Keyboard shortcut Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [template]);

  // Section operations
  const handleAddSection = (layout: "1-column" | "2-column") => {
    if (!template) return;
    const newSectionId = "sec-" + Date.now();
    const newSec: SectionItem = {
      id: newSectionId,
      name: layout === "2-column" ? "2-Column Split" : "Full-Width Section",
      layout: layout,
      backgroundColor: "#ffffff",
      textColor: "#0F172A",
      paddingY: "lg",
      columns:
        layout === "2-column"
          ? [
              {
                id: "col-1",
                width: "1/2",
                components: [
                  {
                    id: "comp-" + Date.now(),
                    type: "about",
                    content: {
                      tag: "INTAKE PORTAL",
                      title: "Transformative Skill Building",
                      description: "Master modern tools and frameworks with direct practitioner feedback.",
                      items: [
                        { title: "Direct Mentorship", desc: "Weekly reviews with top practitioners" },
                        { title: "Partner Drives", desc: "Direct access to enterprise hiring" },
                      ],
                    },
                  },
                ],
              },
              {
                id: "col-2",
                width: "1/2",
                components: [
                  {
                    id: "comp-" + (Date.now() + 1),
                    type: "leadForm",
                    content: getDefaultContentForType("leadForm"),
                  },
                ],
              },
            ]
          : [
              {
                id: "col-full",
                width: "full",
                components: [
                  {
                    id: "comp-" + Date.now(),
                    type: "features",
                    content: getDefaultContentForType("features"),
                  },
                ],
              },
            ],
    };

    setTemplate({
      ...template,
      sections: [...template.sections, newSec],
    });
    setSelectedItem({ type: "section", sectionIndex: template.sections.length });
    setIsInspectorOpen(true);
    toast.success(`Added ${layout} section!`);
  };

  const handleDuplicateSection = (index: number) => {
    if (!template) return;
    const secToClone = JSON.parse(JSON.stringify(template.sections[index]));
    secToClone.id = "sec-" + Date.now();
    secToClone.name = `${secToClone.name} (Copy)`;
    secToClone.columns.forEach((col: any, ci: number) => {
      col.id = `col-${Date.now()}-${ci}`;
      col.components.forEach((comp: any) => {
        comp.id = `comp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      });
    });

    const updated = [...template.sections];
    updated.splice(index + 1, 0, secToClone);
    setTemplate({ ...template, sections: updated });
    toast.success("Section duplicated!");
  };

  const handleDeleteSection = (index: number) => {
    if (!template) return;
    if (!window.confirm("Are you sure you want to delete this section?")) return;
    const updated = [...template.sections];
    updated.splice(index, 1);
    setTemplate({ ...template, sections: updated });
    setIsInspectorOpen(false);
  };

  const handleMoveSection = (index: number, direction: "up" | "down") => {
    if (!template) return;
    const updated = [...template.sections];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= updated.length) return;
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setTemplate({ ...template, sections: updated });
  };

  
  // Helper to construct all 6 Webinar Sections matching user screenshots
  const getHappyLifeWebinarSections = (templateName?: string): SectionItem[] => {
    const timestamp = Date.now();
    return [
      // 1. Hero Section ("Mega Astrology Webinar")
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

      // 2. Why Join Section (Benefits + Media Player)
      {
        id: "sec-whyjoin-" + (timestamp + 1),
        name: "Why Join The Webinar",
        layout: "2-column",
        backgroundColor: "#ffffff",
        textColor: "#0F172A",
        paddingY: "lg",
        columns: [
          {
            id: "col-whyjoin-left",
            width: "1/2",
            components: [
              {
                id: "comp-whyjoin-info-" + (timestamp + 1),
                type: "about",
                content: {
                  style: "whyJoin",
                  title: "Why join the webinar?",
                  subtitle:
                    "This webinar will help you leverage the impact of stars in day-to-day life.",
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
          {
            id: "col-whyjoin-right",
            width: "1/2",
            components: [
              {
                id: "comp-whyjoin-media-" + (timestamp + 1),
                type: "video",
                content: {
                  mediaType: "video",
                  title: "Sneak Peek: Webinar Overview",
                  videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                  imageUrl: "/hero_image_2.png",
                  autoPlay: false,
                },
              },
            ],
          },
        ],
      },

      // 3. Curriculum Cards (What will you learn)
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

      // 4. Frequently Asked Questions (Collapsible Accordion)
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

      // 5. Action CTA Banner (Still Thinking - Happy Life Ocean Blue)
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
                  title: "Register for Mega Astrology Webinar",
                  subtitle:
                    "Claim your ₹99 seat before early access passes run out.",
                  buttonText: "Complete Registration (₹99)",
                  fields: [
                    {
                      name: "name",
                      label: "Full Name",
                      type: "text",
                      required: true,
                      placeholder: "e.g. Rahul Sharma",
                    },
                    {
                      name: "phone",
                      label: "WhatsApp Number",
                      type: "tel",
                      required: true,
                      placeholder: "+91 9876543210",
                    },
                    {
                      name: "email",
                      label: "Email Address",
                      type: "email",
                      required: true,
                      placeholder: "rahul@example.com",
                    },
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
                    {
                      name: "birthDetails",
                      label: "Date & Place of Birth (Optional)",
                      type: "text",
                      required: false,
                      placeholder: "e.g. 15 Aug 1995, New Delhi",
                    },
                  ],
                  guaranteeText:
                    "🔒 100% Privacy. Instant webinar link dispatched to WhatsApp & Email.",
                  successMessage:
                    "🎉 Registration confirmed! Your access pass has been dispatched.",
                },
              },
            ],
          },
        ],
      },
    ];
  };

  // One-click apply full Happy Life Webinar Default Template
  const handleApplyHappyLifeWebinarTemplate = () => {
    if (!template) return;
    if (
      template.sections &&
      template.sections.length > 0 &&
      !window.confirm("Apply the 'Happy Life' Webinar Default Template? This will replace canvas sections with all 6 screenshot sections.")
    ) {
      return;
    }

    const sections = getHappyLifeWebinarSections(template.name);
    setTemplate({
      ...template,
      sections,
      footerConfig: {
        enabled: true,
        templateStyle: 1,
        headline: "Your Birth Chart Holds Clues, Not Instant MIRACLES",
        tagline: "ALIGN YOUR ENERGY, UNLOCK SUCCESS, AND LIVE WITH PURPOSE",
        contactEmail: "happylifereport@gmail.com",
        backgroundColor: "#2171B5",
        textColor: "#ffffff",
        copyrightText: "© 2026 Happy Life. All rights reserved.",
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
      },
    });
    setSelectedItem({ type: "section", sectionIndex: 0 });
    setIsInspectorOpen(true);
    toast.success("Loaded 'Happy Life' Default Template with all screenshot sections!");
  };

// Component operations
  const handleAddComponent = (
    sectionIndex: number,
    columnIndex: number,
    type: ComponentItem["type"]
  ) => {
    if (!template) return;
    const updated = [...template.sections];
    const col = updated[sectionIndex].columns[columnIndex];
    const newComp: ComponentItem = {
      id: "comp-" + Date.now(),
      type,
      content: getDefaultContentForType(type),
    };
    col.components.push(newComp);
    setTemplate({ ...template, sections: updated });
    setSelectedItem({
      type: "component",
      sectionIndex,
      columnIndex,
      componentIndex: col.components.length - 1,
    });
    setIsInspectorOpen(true);
    toast.success(`Added ${type} component`);
  };

  const handleDeleteComponent = (
    sectionIndex: number,
    columnIndex: number,
    componentIndex: number
  ) => {
    if (!template) return;
    const updated = [...template.sections];
    updated[sectionIndex].columns[columnIndex].components.splice(componentIndex, 1);
    setTemplate({ ...template, sections: updated });
    setIsInspectorOpen(false);
  };

  // Pre-built Section Presets triggered by "2. COMPONENT TEMPLATES" on the Left Panel
  const handleApplyComponentTemplate = (catId: string, templateNumber: number) => {
    if (!template) return;
    const timestamp = Date.now();
    let newSec: SectionItem;

    if (catId === "happy_life_webinar") {
      handleApplyHappyLifeWebinarTemplate();
      return;
    }

    if (catId === "why_join") {
      newSec = {
        id: "sec-whyjoin-" + timestamp,
        name: "Why Join Webinar Section",
        layout: "2-column",
        backgroundColor: "#ffffff",
        textColor: "#0F172A",
        paddingY: "lg",
        columns: [
          {
            id: "col-left-" + timestamp,
            width: "1/2",
            components: [
              {
                id: "comp-whyjoin-info-" + timestamp,
                type: "about",
                content: {
                  style: "whyJoin",
                  title: "Why join the webinar?",
                  subtitle: "This webinar will help you leverage the impact of stars in day-to-day life.",
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
          {
            id: "col-right-" + timestamp,
            width: "1/2",
            components: [
              {
                id: "comp-whyjoin-media-" + timestamp,
                type: "video",
                content: {
                  mediaType: "video",
                  title: "Sneak Peek: Webinar Overview",
                  videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                  imageUrl: "/hero_image_2.png",
                  autoPlay: false,
                },
              },
            ],
          },
        ],
      };
      setTemplate({ ...template, sections: [...template.sections, newSec] });
      setSelectedItem({ type: "section", sectionIndex: template.sections.length });
      setIsInspectorOpen(true);
      toast.success("Added 'Why Join' Section!");
      return;
    }

    if (catId === "vedic_learn") {
      newSec = {
        id: "sec-learn-" + timestamp,
        name: "What You Will Learn Section",
        layout: "1-column",
        backgroundColor: "#ffffff",
        textColor: "#0F172A",
        paddingY: "lg",
        columns: [
          {
            id: "col-full-" + timestamp,
            width: "full",
            components: [
              {
                id: "comp-learn-" + timestamp,
                type: "features",
                content: {
                  style: "vedicModules",
                  title: "What will you learn in this mega webinar?",
                  subtitle: "Here's the module for you to learn astrology online through our webinar...",
                  modules: [
                    { id: 1, iconType: "clover", title: "Improving Your Luck with Astrology", desc: "Use astrological methods to make your luck stronger." },
                    { id: 2, iconType: "kundali", title: "Understanding Your Birth Chart/Kundali", desc: "Learn about the secrets in your birth chart." },
                    { id: 3, iconType: "planets", title: "How Planets Affect Your Life", desc: "See how planets influence important parts of your life like your job, love life, and money." },
                    { id: 4, iconType: "yantra", title: "Basics of Vedic Astrology", desc: "Understand the simple rules that Vedic astrology is built on." },
                    { id: 5, iconType: "rashi", title: "Rashi/ Zodiac Signs Insights", desc: "Get special tips based on your Rashi." },
                    { id: 6, iconType: "lagna", title: "Deep Dive into Lagna Chart", desc: "Get a full understanding of Lagna chart." },
                  ],
                  bottomText: "This webinar will equip you with actionable insights...",
                },
              },
            ],
          },
        ],
      };
      setTemplate({ ...template, sections: [...template.sections, newSec] });
      setSelectedItem({ type: "section", sectionIndex: template.sections.length });
      setIsInspectorOpen(true);
      toast.success("Added 'What You Will Learn' Section!");
      return;
    }

    if (catId === "cta_banner") {
      newSec = {
        id: "sec-cta-" + timestamp,
        name: "Still Thinking CTA Banner",
        layout: "1-column",
        backgroundColor: "#ffffff",
        textColor: "#ffffff",
        paddingY: "md",
        columns: [
          {
            id: "col-cta-main-" + timestamp,
            width: "full",
            components: [
              {
                id: "comp-cta-" + timestamp,
                type: "ctaBanner",
                content: {
                  style: "expertCallout",
                  title: "Still thinking? Let us help you take the first step.",
                  subtitle: "Connect directly with our Vedic astrology team to get personalized guidance.",
                  buttonText: "Talk to an expert",
                  buttonLink: "#lead-form",
                  expertImage: "/hero_image_2.png",
                  backgroundColor: "#2171B5",
                },
              },
            ],
          },
        ],
      };
      setTemplate({ ...template, sections: [...template.sections, newSec] });
      setSelectedItem({ type: "section", sectionIndex: template.sections.length });
      setIsInspectorOpen(true);
      toast.success("Added 'Still Thinking' Banner!");
      return;
    }

    if (catId === "headers") {
      setTemplate({
        ...template,
        headerConfig: {
          enabled: true,
          siteTitle: "Happy Life",
          navLinks: [
            { label: "Explore Stream", url: "#" },
            { label: "Counselors", url: "#" },
            { label: "Colleges", url: "#" },
            { label: "Tracker", url: "#" },
          ],
          ctaButton: { text: "Explore", url: "#lead-form" },
        },
      });
      setSelectedItem({ type: "header" });
      setIsInspectorOpen(true);
      toast.success("Applied Header Template!");
      return;
    }

    if (catId === "footers") {
      const footerPresets: { [num: number]: any } = {
        1: {
          enabled: true,
          templateStyle: 1, // Center Stacked (Website Original)
          headline: "Your Birth Chart Holds Clues, Not Instant MIRACLES",
          tagline: "ALIGN YOUR ENERGY, UNLOCK SUCCESS, AND LIVE WITH PURPOSE",
          contactEmail: "happylifereport@gmail.com",
          backgroundColor: "#2171B5",
          textColor: "#ffffff",
          copyrightText: "© 2026 Happy Life. All rights reserved.",
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
        },
        2: {
          enabled: true,
          templateStyle: 2, // Split (Left & Right)
          headline: "Your Birth Chart Holds Clues, Not Instant MIRACLES",
          tagline: "ALIGN YOUR ENERGY, UNLOCK SUCCESS, AND LIVE WITH PURPOSE",
          contactEmail: "happylifereport@gmail.com",
          backgroundColor: "#2171B5",
          textColor: "#ffffff",
          copyrightText: "© 2026 Happy Life. All rights reserved.",
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
        },
        3: {
          enabled: true,
          templateStyle: 3, // Banner & Top Bar
          headline: "Your Birth Chart Holds Clues, Not Instant MIRACLES",
          tagline: "ALIGN YOUR ENERGY, UNLOCK SUCCESS, AND LIVE WITH PURPOSE",
          contactEmail: "happylifereport@gmail.com",
          backgroundColor: "#1b5c98",
          textColor: "#ffffff",
          copyrightText: "© 2026 Happy Life. All rights reserved.",
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
        },
      };

      const selectedPreset = footerPresets[templateNumber] || footerPresets[1];
      setTemplate({
        ...template,
        footerConfig: selectedPreset,
      });
      setSelectedItem({ type: "footer" });
      setIsInspectorOpen(true);
      toast.success(`Applied Footer Template ${templateNumber}!`);

      setTimeout(() => {
        const footerEl = document.getElementById("canvas-footer");
        if (footerEl) {
          footerEl.scrollIntoView({ behavior: "smooth", block: "end" });
        }
      }, 100);
      return;
    }

    if (catId === "hero") {
      newSec = {
        id: "sec-hero-" + timestamp,
        name: `Hero Template ${templateNumber}`,
        layout: templateNumber === 1 ? "2-column" : "1-column",
        backgroundColor: "#ffffff",
        textColor: "#0F172A",
        paddingY: "lg",
        columns:
          templateNumber === 1
            ? [
                {
                  id: "col-1",
                  width: "1/2",
                  components: [
                    {
                      id: "comp-hero-" + timestamp,
                      type: "hero",
                      content: {
                        badge: "INTAKE PORTAL",
                        title: "Map Your Path to Top Ranked Programs in India",
                        subtitle:
                          "Create your personalized profile, explore admission requirements, verify eligibility status, and book certified counsel sessions instantly.",
                        bulletPoints: [
                          "AI compatibility streams assessment",
                          "Direct offline/online counselor connect",
                        ],
                        ctaText: "Explore Courses",
                        ctaLink: "#lead-form",
                      },
                    },
                  ],
                },
                {
                  id: "col-2",
                  width: "1/2",
                  components: [
                    {
                      id: "comp-lead-" + (timestamp + 1),
                      type: "leadForm",
                      content: getDefaultContentForType("leadForm"),
                    },
                  ],
                },
              ]
            : [
                {
                  id: "col-full",
                  width: "full",
                  components: [
                    {
                      id: "comp-hero-" + timestamp,
                      type: "hero",
                      content: {
                        badge: "🌟 PREFERRED LEARNING ACCELERATOR",
                        title: "Accelerate Your Future with Industry Mentorship",
                        subtitle:
                          "Learn modern in-demand frameworks with personalized feedback and dedicated placement pipeline support.",
                        bulletPoints: [
                          "Live interactive bootcamps led by senior leaders",
                          "Real-world enterprise capstone projects",
                          "Guaranteed interview prep & resume reviews",
                        ],
                        trustText: "Rated 4.9/5 by 15,000+ happy students",
                        ctaText: "Claim Free Spot →",
                        ctaLink: "#lead-form",
                        secondaryCtaText: "View Curriculum ↓",
                        secondaryCtaLink: "#curriculum",
                      },
                    },
                  ],
                },
              ],
      };
    } else if (catId === "assessment") {
      newSec = {
        id: "sec-assessment-" + timestamp,
        name: `Assessment Template ${templateNumber}`,
        layout: "1-column",
        backgroundColor: "#f8fafc",
        textColor: "#0F172A",
        paddingY: "lg",
        columns: [
          {
            id: "col-full",
            width: "full",
            components: [
              {
                id: "comp-assessment-" + timestamp,
                type: "leadForm",
                content: {
                  badge: "STUDENT REGISTRATION",
                  title: "Student Registration & Assessment Portal",
                  subtitle: "Fill out the registration details below to match with verified programs and counselors.",
                  buttonText: "Submit Registration & Connect →",
                  fields: [
                    { name: "name", label: "Full Name", type: "text", required: true, placeholder: "Enter full name..." },
                    { name: "phone", label: "Mobile Number", type: "tel", required: true, placeholder: "+91 XXXXX" },
                    { name: "email", label: "Email Address", type: "email", required: true, placeholder: "email@example.com" },
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
                    {
                      name: "stream",
                      label: "Select Preferred Stream / Interest",
                      type: "select",
                      required: false,
                      options: [
                        "Computer Science / Engineering",
                        "Commerce / Management",
                        "Design & Creative Arts",
                        "Data Science & AI",
                        "Other Specialty",
                      ],
                      placeholder: "Choose domain...",
                    },
                    { name: "notes", label: "Academic Score or Specific Queries", type: "textarea", required: false, placeholder: "Enter academic background or goals..." },
                  ],
                  guaranteeText: "🔒 100% Privacy. Zero spam. Official Happy Life counselor connects within 24h.",
                  successMessage: "🎉 Registration Received! Our academic advisor will contact you shortly.",
                },
              },
            ],
          },
        ],
      };
    } else if (catId === "admin_analytics" || catId === "stats") {
      newSec = {
        id: "sec-stats-" + timestamp,
        name: `Analytics Template ${templateNumber}`,
        layout: "1-column",
        backgroundColor: "#ffffff",
        textColor: "#0F172A",
        paddingY: "md",
        columns: [
          {
            id: "col-full",
            width: "full",
            components: [
              {
                id: "comp-stats-" + timestamp,
                type: "stats",
                content: getDefaultContentForType("stats"),
              },
            ],
          },
        ],
      };
    } else if (catId === "counselor" || catId === "reviews") {
      newSec = {
        id: "sec-reviews-" + timestamp,
        name: `Counselor Match Template ${templateNumber}`,
        layout: "1-column",
        backgroundColor: "#f8fafc",
        textColor: "#0F172A",
        paddingY: "lg",
        columns: [
          {
            id: "col-full",
            width: "full",
            components: [
              {
                id: "comp-reviews-" + timestamp,
                type: "testimonials",
                content: getDefaultContentForType("testimonials"),
              },
            ],
          },
        ],
      };
    } else if (catId === "college_hub" || catId === "features") {
      newSec = {
        id: "sec-college-" + timestamp,
        name: `College Match Hub Template ${templateNumber}`,
        layout: "1-column",
        backgroundColor: "#ffffff",
        textColor: "#0F172A",
        paddingY: "lg",
        columns: [
          {
            id: "col-full",
            width: "full",
            components: [
              {
                id: "comp-college-" + timestamp,
                type: "features",
                content: getDefaultContentForType("features"),
              },
            ],
          },
        ],
      };
    } else if (catId === "ai_recommendations" || catId === "curriculum") {
      newSec = {
        id: "sec-ai-" + timestamp,
        name: `AI Recommendations Template ${templateNumber}`,
        layout: "2-column",
        backgroundColor: "#f8fafc",
        textColor: "#0F172A",
        paddingY: "lg",
        columns: [
          {
            id: "col-1",
            width: "1/2",
            components: [
              {
                id: "comp-ai-about-" + timestamp,
                type: "about",
                content: getDefaultContentForType("about"),
              },
            ],
          },
          {
            id: "col-2",
            width: "1/2",
            components: [
              {
                id: "comp-ai-preview-" + timestamp,
                type: "ctaBanner",
                content: {
                  badge: "AI MATCHING ENGINE",
                  title: "Smart College & Course Recommendation",
                  subtitle: "Our algorithmic counselor analyzes your score, location, and career preference to match you with top 1% colleges.",
                  buttonText: "Check My Eligibility →",
                  buttonLink: "#lead-form",
                },
              },
            ],
          },
        ],
      };
    } else if (catId === "faq") {
      newSec = {
        id: "sec-faq-" + timestamp,
        name: `FAQ Template ${templateNumber}`,
        layout: "1-column",
        backgroundColor: "#ffffff",
        textColor: "#0F172A",
        paddingY: "lg",
        columns: [
          {
            id: "col-full",
            width: "full",
            components: [
              {
                id: "comp-faq-" + timestamp,
                type: "faq",
                content: getDefaultContentForType("faq"),
              },
            ],
          },
        ],
      };
    } else {
      // app_tracker / cta
      newSec = {
        id: "sec-tracker-" + timestamp,
        name: `Application Tracker Template ${templateNumber}`,
        layout: "1-column",
        backgroundColor: "#2171B5",
        textColor: "#ffffff",
        paddingY: "lg",
        columns: [
          {
            id: "col-full",
            width: "full",
            components: [
              {
                id: "comp-cta-" + timestamp,
                type: "ctaBanner",
                content: getDefaultContentForType("ctaBanner"),
              },
            ],
          },
        ],
      };
    }

    setTemplate({
      ...template,
      sections: [...template.sections, newSec],
    });
    setSelectedItem({ type: "section", sectionIndex: template.sections.length });
    setIsInspectorOpen(true);
    toast.success(`Inserted ${newSec.name} into Canvas!`);
  };

  const getDefaultContentForType = (type: ComponentItem["type"]) => {
    switch (type) {
      case "hero":
        return {
          badge: "INTAKE PORTAL",
          title: "Map Your Path to Top Ranked Programs in India",
          subtitle:
            "Create your personalized profile, analyze your eligibility, and connect with direct mentors.",
          bulletPoints: [
            "AI compatibility streams assessment",
            "Direct offline/online counselor connect",
            "100% personalized placement assistance",
          ],
          trustText: "Rated 4.9/5 by 15,000+ ambitious students",
          ctaText: "Explore Courses",
          ctaLink: "#lead-form",
          secondaryCtaText: "Check Eligibility ↓",
          secondaryCtaLink: "#lead-form",
        };
      case "leadForm":
        return {
          badge: "STUDENT REGISTRATION",
          title: "Student Registration",
          subtitle: "Fill this quick form and our academic advisor will reach out.",
          buttonText: "Request Call Back",
          fields: [
            { name: "name", label: "Full Name", type: "text", required: true, placeholder: "Enter full name" },
            { name: "phone", label: "Mobile Number", type: "tel", required: true, placeholder: "+91 XXXXX" },
            { name: "email", label: "Email Address", type: "email", required: true, placeholder: "email@example.com" },
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
            { name: "notes", label: "Your Query / Interest", type: "textarea", required: false, placeholder: "Tell us about your interest..." },
          ],
          guaranteeText: "🔒 100% Privacy. Zero spam. Advisor connects within 24h.",
          successMessage: "Thank you! Our advisor will reach out shortly.",
        };
      case "stats":
        return {
          title: "Numbers That Speak For Themselves",
          subtitle: "Empowering learners across India with verifiable results",
          stats: [
            { number: "15,000+", label: "Graduated Students", icon: "GraduationCap" },
            { number: "98.4%", label: "Career Placement Rate", icon: "TrendingUp" },
            { number: "4.9 / 5.0", label: "Average Review Rating", icon: "Star" },
            { number: "120+", label: "Hiring Partners", icon: "Building2" },
          ],
        };
      case "about":
        return {
          tag: "WHY HAPPY LIFE?",
          title: "A Complete Ecosystem Built for Your Professional Breakthrough",
          description: "Learn practical skills that employers actively look for with dedicated 1-on-1 mentorship.",
          items: [
            { title: "Direct Industry Mentorship", desc: "Weekly 1-on-1 doubt solving with senior leads." },
            { title: "Guaranteed Placement Pipeline", desc: "Exclusive access to private hiring drives & mock interviews." },
            { title: "Lifelong Alumni Network", desc: "Join an elite community of founders and engineers." },
          ],
        };
      case "features":
        return {
          title: "Comprehensive Practical Capabilities",
          subtitle: "Engineered from the ground up to make you indispensable in the modern job market",
          cards: [
            { title: "Architectural Fundamentals", desc: "Build rock-solid conceptual grounding with live guidance." },
            { title: "Live Real-World Projects", desc: "Ship enterprise applications that prove your competence." },
            { title: "AI & Automation Mastery", desc: "Harness cutting-edge AI workflows for 10x output." },
            { title: "Code Reviews & Clean Patterns", desc: "Learn clean code patterns, architecture, and optimization." },
            { title: "Client Acquisition & Sales", desc: "Master communication, pitching, and value negotiation." },
            { title: "Interview Guarantee Pipeline", desc: "Tailored portfolio and direct partner referrals." },
          ],
        };
      case "testimonials":
        return {
          tag: "STUDENT SUCCESS",
          title: "Real Transformations from Real Students",
          subtitle: "See how ambitious learners accelerated their careers with Happy Life.",
          reviews: [
            {
              name: "Aman Verma",
              role: "Software Engineer @ Tier 1 Firm",
              quote: "The hands-on guidance and interview prep helped me transition from a non-tech role into a high paying job in 4 months.",
              rating: 5,
            },
            {
              name: "Sneha Patel",
              role: "Product Consultant",
              quote: "The personalized doubt clearing and direct mentor feedback was a gamechanger. Best investment in my career.",
              rating: 5,
            },
            {
              name: "Rohan Nair",
              role: "Fullstack Developer",
              quote: "Clear structured syllabus with live capstone projects. The mock interviews simulated real tech rounds perfectly.",
              rating: 5,
            },
          ],
        };
      case "faq":
        return {
          title: "Frequently Asked Questions",
          subtitle: "Everything you need to know before joining the program.",
          faqs: [
            { question: "Is this course beginner-friendly?", answer: "Yes, we cover fundamentals before moving to advanced topics." },
            { question: "Will I get placement support?", answer: "Yes, dedicated placement support is provided with resume teardowns and mock interviews." },
            { question: "Are live sessions recorded?", answer: "Yes, all live sessions are recorded and made available immediately in your dashboard with lifetime access." },
          ],
        };
      case "ctaBanner":
        return {
          badge: "🔥 SEATS CLOSING SOON",
          title: "Step Into Your Dream Career Today",
          subtitle: "Don't spend another year wondering what if. Join thousands of successful alumni who transformed their lives.",
          buttonText: "Claim Your Spot Now →",
          buttonLink: "#lead-form",
        };
      default:
        return { title: "Component Title", description: "Component description text." };
    }
  };

  const getPublicUrl = () => {
    if (!template) return "#";
    const webBaseUrl =
      import.meta.env.VITE_WEB_URL ||
      window.location.origin.replace("5174", "5173").replace("admin.", "");
    return `${webBaseUrl}/${template.slug}`;
  };

  if (loading || !template) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#2171B5]" />
          <p className="text-sm text-gray-500 font-medium">Loading builder canvas...</p>
        </div>
      </div>
    );
  }


  // Reusable Media Upload Component for Images & Videos
  const MediaUploadField = ({
    label,
    value,
    onChange,
    accept = "image/*",
    type = "image",
    placeholder = "/hero_image_2.png",
    fieldKey,
  }: {
    label: string;
    value: string;
    onChange: (val: string) => void;
    accept?: string;
    type?: "image" | "video";
    placeholder?: string;
    fieldKey: string;
  }) => {
    const isCurrentUploading = uploadingMediaField === fieldKey;

    return (
      <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-slate-700">{label}</label>
          {type === "image" && (
            <button
              type="button"
              onClick={() => onChange("/hero_image_2.png")}
              className="text-[10px] text-[#2171B5] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              title="Use website hero cutout image"
            >
              Use Hero Photo
            </button>
          )}
        </div>

        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
          />

          <label
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition shrink-0 ${
              isCurrentUploading
                ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                : "bg-white hover:bg-blue-50 text-[#2171B5] border-blue-300 hover:border-[#2171B5] shadow-xs active:scale-95"
            }`}
          >
            {isCurrentUploading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2171B5]" />
            ) : (
              <Upload className="w-3.5 h-3.5" />
            )}
            <span>{isCurrentUploading ? "Uploading..." : "Upload"}</span>
            <input
              type="file"
              accept={accept}
              disabled={isCurrentUploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleMediaUpload(file, fieldKey, (url) => onChange(url));
                }
              }}
              className="hidden"
            />
          </label>
        </div>

        {/* Media Preview */}
        {value && (
          <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60 mt-1">
            {type === "image" ? (
              <div className="w-9 h-9 rounded-lg overflow-hidden bg-slate-200 border border-slate-300 shrink-0 flex items-center justify-center">
                <img
                  src={value}
                  alt="Preview"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            ) : (
              <div className="px-2 py-1 rounded bg-slate-200 text-slate-700 text-[10px] font-mono flex items-center gap-1 shrink-0">
                <Play className="w-3 h-3 text-[#2171B5]" /> Video Set
              </div>
            )}
            <span className="text-[10px] text-slate-500 font-mono truncate flex-1">
              {value}
            </span>
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-[10px] text-red-500 hover:text-red-700 font-semibold p-1 hover:bg-red-50 rounded cursor-pointer"
              title="Clear"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    );
  };

  // Active section & component references
  const activeSection =
    selectedItem.sectionIndex !== undefined
      ? template.sections[selectedItem.sectionIndex]
      : null;
  const activeComponent =
    activeSection &&
    selectedItem.columnIndex !== undefined &&
    selectedItem.componentIndex !== undefined
      ? activeSection.columns[selectedItem.columnIndex]?.components[
          selectedItem.componentIndex
        ]
      : null;

  // Helper to update active component content
  const updateActiveComponentContent = (updates: Record<string, any>) => {
    if (!activeComponent) return;
    const updated = [...template.sections];
    const comp =
      updated[selectedItem.sectionIndex!].columns[selectedItem.columnIndex!]
        .components[selectedItem.componentIndex!];
    comp.content = { ...comp.content, ...updates };
    setTemplate({ ...template, sections: updated });
  };

  // Helper to update active section style
  const updateActiveSectionStyle = (updates: Partial<SectionItem>) => {
    if (!activeSection) return;
    const updated = [...template.sections];
    updated[selectedItem.sectionIndex!] = {
      ...updated[selectedItem.sectionIndex!],
      ...updates,
    };
    setTemplate({ ...template, sections: updated });
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#f4f7fb] text-slate-800 font-sans">
      {/* 1. Top Builder Bar */}
      <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between z-30 shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            to="/builder/templates"
            className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition"
            title="Back to Templates"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm text-[#2171B5] tracking-tight">
              Happy Life Builder
            </span>
            <span className="text-slate-300">/</span>
            <input
              type="text"
              value={template.name}
              onChange={(e) => setTemplate({ ...template, name: e.target.value })}
              className="font-bold text-slate-800 bg-transparent hover:border-slate-300 focus:border-[#2171B5] focus:outline-none px-1 text-sm border-b border-transparent"
            />
            <span
              className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold ${
                template.status === "published"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {template.status}
            </span>
          </div>
        </div>

        {/* Viewport switchers */}
        <div className="hidden md:flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewport("desktop")}
              className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
                viewport === "desktop"
                  ? "bg-white text-[#2171B5] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop</span>
            </button>
            <button
              onClick={() => setViewport("tablet")}
              className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
                viewport === "tablet"
                  ? "bg-white text-[#2171B5] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
              <span>Tablet</span>
            </button>
            <button
              onClick={() => setViewport("mobile")}
              className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
                viewport === "mobile"
                  ? "bg-white text-[#2171B5] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile (375px)</span>
            </button>
          </div>

          {viewport === "desktop" && (
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-[11px] gap-0.5">
              <span className="px-2 text-slate-400 font-bold uppercase text-[9px] tracking-wider">Canvas:</span>
              {(["5xl", "6xl", "7xl", "full"] as const).map((w) => (
                <button
                  key={w}
                  onClick={() => setDesktopCanvasWidth(w)}
                  className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] transition ${
                    desktopCanvasWidth === w
                      ? "bg-[#2171B5] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {w.toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Top actions */}
        <div className="flex items-center gap-2">
          {template.status === "published" && (
            <a
              href={getPublicUrl()}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 text-slate-500 hover:text-[#2171B5] rounded-lg hover:bg-slate-100 transition"
              title="View Live Web Page"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          <select
            value={template.status}
            onChange={(e) =>
              setTemplate({
                ...template,
                status: e.target.value as "draft" | "published" | "archived",
              })
            }
            className="text-xs font-semibold bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-[#2171B5]"
          >
            <option value="draft">Draft Mode</option>
            <option value="published">Published Live</option>
            <option value="archived">Archived</option>
          </select>

          <button
            type="button"
            onClick={handleApplyHappyLifeWebinarTemplate}
            className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 via-[#2171B5] to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
            title="Load the 5 Screenshot Webinar Sections into Canvas"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>✨ Apply Happy Life Template</span>
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="px-4 py-1.5 bg-[#2171B5] hover:bg-[#1a5c96] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition active:scale-95 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>Save</span>
          </button>
        </div>
      </header>

      {/* 2. Main Builder Layout: 3 Columns (Left Component Picker | Center Live Canvas | Right Customizer) */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* ======================================================== */}
        {/* LEFT PANEL: 1. SECTIONS CATEGORY + 2. COMPONENT TEMPLATES */}
        {/* ======================================================== */}
        <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto select-none shadow-xs">
          {/* Header branding */}
          <div className="p-4 border-b border-slate-100">
            <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              WebCraft Builder
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Click components to insert & customize
            </p>
          </div>

          <div className="p-3.5 space-y-4 flex-1">
            {/* 1. SECTIONS CATEGORY */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                1. Sections Category
              </span>
              <div className="space-y-1.5">
                {SECTION_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = activeCategory === cat.id;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveCategory(cat.id)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-left ${
                        isSelected
                          ? "bg-red-50/60 border-red-200 text-red-700 shadow-xs"
                          : "bg-white hover:bg-slate-50/80 border-slate-200/90 text-slate-700"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 ${
                          isSelected ? "text-red-600" : "text-red-700/80"
                        }`}
                      />
                      <span className="truncate">{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* DIVIDER */}
            <hr className="border-slate-100" />

            {/* 2. COMPONENT TEMPLATES */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                2. Component Templates
              </span>
              <div className="space-y-2">
                {(activeCategory === "footers" ? [1, 2, 3] : [1, 2, 3, 4]).map((templateNum) => {
                  const categoryName =
                    SECTION_CATEGORIES.find((c) => c.id === activeCategory)?.name ||
                    "Component";
                  const templateLabel =
                    activeCategory === "footers"
                      ? templateNum === 1
                        ? "HL Signature (Center)"
                        : templateNum === 2
                        ? "HL Split (Left & Right)"
                        : "HL Banner (Top & Bottom)"
                      : `${categoryName} Template ${templateNum}`;

                  return (
                    <button
                      key={templateNum}
                      type="button"
                      onClick={() =>
                        handleApplyComponentTemplate(activeCategory, templateNum)
                      }
                      className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl border border-slate-200 bg-white hover:border-[#2171B5] hover:bg-blue-50/30 text-xs font-medium text-slate-800 shadow-xs transition group cursor-pointer text-left"
                    >
                      <span className="truncate group-hover:text-[#2171B5] font-semibold">
                        {templateLabel}
                      </span>
                      <GripVertical className="w-4 h-4 text-slate-300 group-hover:text-[#2171B5] shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Left: SAVE WEBSITE BUTTON */}
          <div className="p-3.5 border-t border-slate-200 bg-slate-50">
            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={saving}
              className="w-full py-3 bg-[#2171B5] hover:bg-[#1a5c96] active:scale-98 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition disabled:opacity-50 cursor-pointer"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Save Website</span>
            </button>
          </div>
        </aside>

        {/* ======================================================== */}
        {/* CENTER: LIVE VISUAL CANVAS IN CLEAN LIGHT THEME           */}
        {/* ======================================================== */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center items-start bg-[#eef3f9]">
          <div
            className={`transition-all duration-300 bg-white text-slate-800 shadow-xl rounded-2xl border border-slate-200 overflow-hidden ${
              viewport === "desktop"
                ? desktopCanvasWidth === "full"
                  ? "w-full max-w-[1600px]"
                  : desktopCanvasWidth === "7xl"
                  ? "w-full max-w-7xl"
                  : desktopCanvasWidth === "6xl"
                  ? "w-full max-w-6xl"
                  : "w-full max-w-5xl"
                : viewport === "tablet"
                ? "w-[768px]"
                : "w-[375px]"
            }`}
          >
            {/* Viewport header indicator */}
            <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
              <span className="font-mono flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                {viewport === "desktop"
                  ? "Desktop Canvas (Full Width)"
                  : viewport === "tablet"
                  ? "Tablet Canvas (768px)"
                  : "Mobile Canvas (375px)"}
              </span>
              <span className="text-[10px] text-[#2171B5] font-bold uppercase tracking-wider">
                Click any block to customize
              </span>
            </div>

            {/* --- HEADER --- */}
            {template.headerConfig?.enabled && (
              <header
                onClick={() => {
                  setSelectedItem({ type: "header" });
                  setIsInspectorOpen(true);
                }}
                className={`cursor-pointer border-b border-slate-200/80 bg-white/95 px-6 py-4 flex items-center justify-between transition group ${
                  selectedItem.type === "header"
                    ? "ring-2 ring-[#2171B5] ring-inset"
                    : "hover:bg-slate-50/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={template.headerConfig.logoUrl || "/logos/osa_logo.png"}
                    alt="Happy Life Logo"
                    className="h-8 md:h-9 w-auto object-contain"
                  />
                  {template.headerConfig.siteTitle && (
                    <span className="font-extrabold text-sm text-slate-900 tracking-tight">
                      {template.headerConfig.siteTitle}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-6">
                  <div className="hidden sm:flex items-center gap-4 text-xs font-semibold text-slate-600">
                    {template.headerConfig.navLinks?.map((lnk, i) => (
                      <span key={i} className="hover:text-[#2171B5] transition">
                        {lnk.label}
                      </span>
                    ))}
                  </div>
                  <span className="px-4 py-1.5 bg-[#2171B5] hover:bg-[#1a5c96] text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20">
                    {template.headerConfig.ctaButton?.text || "Explore"}
                  </span>
                </div>
              </header>
            )}

            {/* --- SECTIONS (Light Canvas) --- */}
            <div className="divide-y divide-slate-100">
              {template.sections.map((section, sIdx) => {
                const isTwoCol = section.layout === "2-column";
                const isSelectedSection =
                  selectedItem.type === "section" &&
                  selectedItem.sectionIndex === sIdx;

                return (
                  <section
                    key={section.id || sIdx}
                    onClick={() => {
                      setSelectedItem({ type: "section", sectionIndex: sIdx });
                      setIsInspectorOpen(true);
                    }}
                    style={{
                      backgroundColor: section.backgroundColor || "#ffffff",
                      color: section.textColor || "#0F172A",
                    }}
                    className={`p-6 sm:p-10 relative group transition cursor-pointer ${
                      isSelectedSection
                        ? "ring-2 ring-[#2171B5] ring-inset"
                        : "hover:outline hover:outline-1 hover:outline-[#2171B5]/40"
                    }`}
                  >
                    {/* Floating Section Tag */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition flex items-center gap-1 z-10 bg-white text-slate-700 text-[10px] px-2.5 py-1 rounded-lg border border-slate-200 shadow-md">
                      <span className="font-semibold text-[#2171B5]">
                        {section.name}
                      </span>
                      <span className="text-slate-400 font-mono">
                        ({section.layout})
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicateSection(sIdx);
                        }}
                        className="hover:text-blue-500 ml-1 p-0.5"
                        title="Duplicate Section"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSection(sIdx);
                        }}
                        className="hover:text-red-500 p-0.5"
                        title="Delete Section"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Layout Grid: 1-col OR 2-col */}
                    <div
                      className={
                        isTwoCol && !isMobileView
                          ? `grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center w-full ${getMaxWidthClass(section.maxWidth)} mx-auto`
                          : `w-full ${getMaxWidthClass(section.maxWidth)} mx-auto space-y-6`
                      }
                    >
                      {section.columns.map((col, cIdx) => (
                        <div key={col.id || cIdx} className="space-y-4">
                          {col.components.map((comp, compIdx) => {
                            const isSelectedComp =
                              selectedItem.type === "component" &&
                              selectedItem.sectionIndex === sIdx &&
                              selectedItem.columnIndex === cIdx &&
                              selectedItem.componentIndex === compIdx;

                            return (
                              <div
                                key={comp.id || compIdx}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedItem({
                                    type: "component",
                                    sectionIndex: sIdx,
                                    columnIndex: cIdx,
                                    componentIndex: compIdx,
                                  });
                                  setIsInspectorOpen(true);
                                }}
                                className={`p-6 rounded-2xl bg-white border shadow-sm transition relative group/comp cursor-pointer ${
                                  isSelectedComp
                                    ? "ring-2 ring-[#2171B5] border-[#2171B5]"
                                    : "border-slate-200/90 hover:border-[#2171B5]/50 hover:shadow-md"
                                }`}
                              >
                                <div className="flex items-center justify-between text-xs text-[#2171B5] font-semibold mb-3">
                                  <span className="uppercase tracking-wider text-[10px] bg-blue-50 text-[#2171B5] px-2 py-0.5 rounded-full border border-blue-100 font-bold">
                                    {comp.type} Component
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteComponent(sIdx, cIdx, compIdx);
                                    }}
                                    className="text-slate-400 hover:text-red-500 opacity-0 group-hover/comp:opacity-100 transition p-1"
                                    title="Delete Component"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                {/* 1. HERO PREVIEW */}
                                {comp.type === "hero" && (
                                  comp.content.style === "webinar" || comp.content.eventDate ? (
                                    <div
                                      className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#071322] via-[#0d2238] to-[#17436b] text-white p-5 sm:p-8 lg:p-10 shadow-xl border border-blue-900/50"
                                      style={
                                        comp.content.backgroundImage
                                          ? {
                                              backgroundImage: `linear-gradient(rgba(7, 19, 34, 0.85), rgba(7, 19, 34, 0.95)), url(${comp.content.backgroundImage})`,
                                              backgroundSize: "cover",
                                              backgroundPosition: "center",
                                            }
                                          : {}
                                      }
                                    >
                                      {/* Subtle starfield twinkle glow */}
                                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-400/10 via-transparent to-transparent pointer-events-none" />

                                      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
                                        {/* Left Column: Heading, Subtitle, 4 Meta items, Price CTA */}
                                        <div className="lg:col-span-7 space-y-4 text-left">
                                          {comp.content.badge && (
                                            <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-300 bg-blue-900/50 border border-blue-700/50 rounded-full">
                                              {comp.content.badge}
                                            </span>
                                          )}
                                          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-serif tracking-tight leading-tight">
                                            {comp.content.title || "Mega Astrology Webinar"}
                                          </h1>
                                          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                                            {comp.content.subtitle ||
                                              "Enhance your astrological understanding with our 2 Days webinar, seamlessly integrating traditional Vedic astrology with practical, modern applications. Learn to interpret birth charts and celestial influences under the guidance of Astro Arun Pandit."}
                                          </p>

                                          {/* 4 Metadata Items with icons */}
                                          <div className="grid grid-cols-2 gap-3 pt-1">
                                            <div className="flex items-center gap-2 text-xs text-slate-200">
                                              <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
                                              <div>
                                                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Date</span>
                                                <span className="font-bold text-white">{comp.content.eventDate || "24 Oct, 2026"}</span>
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-200">
                                              <Clock className="w-4 h-4 text-blue-400 shrink-0" />
                                              <div>
                                                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Time</span>
                                                <span className="font-bold text-white">{comp.content.eventTime || "01:00 PM"}</span>
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-200">
                                              <Hourglass className="w-4 h-4 text-blue-400 shrink-0" />
                                              <div>
                                                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Duration</span>
                                                <span className="font-bold text-white">{comp.content.duration || "4 Hours"}</span>
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-200">
                                              <UserIcon className="w-4 h-4 text-blue-400 shrink-0" />
                                              <div>
                                                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Mentor</span>
                                                <span className="font-bold text-white">{comp.content.mentorName || "Astro Arun Pandit"}</span>
                                              </div>
                                            </div>
                                          </div>

                                          {/* CTA Price Button */}
                                          <div className="pt-2">
                                            <div className="inline-flex items-center gap-2 px-5 py-3 bg-white text-purple-900 rounded-xl font-black text-xs sm:text-sm shadow-xl">
                                              <span>Register Now</span>
                                              {comp.content.originalPrice && (
                                                <span className="line-through text-slate-400 text-xs font-semibold">
                                                  {comp.content.originalPrice}
                                                </span>
                                              )}
                                              <span className="text-purple-700 font-extrabold">
                                                {comp.content.discountPrice || "₹99/-"}
                                              </span>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Right Column: Mentor cutout layered over Celestial Zodiac Mandala */}
                                        <div className="lg:col-span-5 relative flex items-center justify-center min-h-[220px] sm:min-h-[280px]">
                                          <div className="absolute inset-0 flex items-center justify-center text-blue-400/40 pointer-events-none scale-105">
                                            <CelestialZodiacWheel className="w-56 h-56 sm:w-72 sm:h-72" />
                                          </div>
                                          <img
                                            src={comp.content.mentorImage || "/hero_image_2.png"}
                                            alt={comp.content.mentorName || "Mentor"}
                                            className="relative z-10 max-h-[240px] sm:max-h-[300px] object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]"
                                            onError={(e) => {
                                              (e.target as any).src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80";
                                            }}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="space-y-4 text-left">
                                      {comp.content.badge && (
                                        <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider text-red-600 bg-red-50 border border-red-200 rounded-full">
                                          {comp.content.badge}
                                        </span>
                                      )}
                                      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                                        {comp.content.title}
                                      </h1>
                                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                        {comp.content.subtitle}
                                      </p>
                                      {comp.content.bulletPoints && (
                                        <ul className="space-y-2 pt-1">
                                          {comp.content.bulletPoints.map(
                                            (bp: string, bpi: number) => (
                                              <li
                                                key={bpi}
                                                className="flex items-center gap-2 text-xs text-slate-700"
                                              >
                                                <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">
                                                  ✓
                                                </span>
                                                <span>{bp}</span>
                                              </li>
                                            )
                                          )}
                                        </ul>
                                      )}
                                      {comp.content.ctaText && (
                                        <div className="flex gap-2 pt-2">
                                          <span className="px-5 py-2.5 bg-[#2171B5] text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20">
                                            {comp.content.ctaText}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  )
                                )}

                                {/* 2. LEAD FORM PREVIEW */}
                                {comp.type === "leadForm" && (
                                  <div className="space-y-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-left">
                                    {comp.content.badge && (
                                      <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
                                        {comp.content.badge}
                                      </span>
                                    )}
                                    <div>
                                      <h3 className="font-extrabold text-lg text-slate-900">
                                        {comp.content.title || "Student Registration"}
                                      </h3>
                                      <p className="text-xs text-slate-500 mt-0.5">
                                        {comp.content.subtitle}
                                      </p>
                                    </div>
                                    <div className="space-y-2.5">
                                      {(comp.content.fields || []).map(
                                        (f: any, fi: number) => (
                                          <div key={fi} className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                                              {f.label}{" "}
                                              {f.required && (
                                                <span className="text-red-500">*</span>
                                              )}
                                            </label>
                                            {f.type === "select" ? (
                                              <div className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-700 flex items-center justify-between">
                                                <span>
                                                  {f.placeholder || "Select option..."}
                                                </span>
                                                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                              </div>
                                            ) : f.type === "textarea" ? (
                                              <div className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-400 h-14">
                                                {f.placeholder || "Enter details..."}
                                              </div>
                                            ) : (
                                              <div className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-400">
                                                {f.placeholder || `Enter ${f.label.toLowerCase()}...`}
                                              </div>
                                            )}
                                          </div>
                                        )
                                      )}
                                    </div>
                                    <div className="w-full py-3 bg-[#2171B5] text-white rounded-xl text-xs font-bold text-center shadow-md shadow-blue-500/20">
                                      {comp.content.buttonText || "Request Call Back"}
                                    </div>
                                    {comp.content.guaranteeText && (
                                      <p className="text-[10px] text-center text-slate-400 font-medium">
                                        {comp.content.guaranteeText}
                                      </p>
                                    )}
                                  </div>
                                )}

                                {/* 3. STATS PREVIEW */}
                                {comp.type === "stats" && (
                                  <div className="space-y-3">
                                    {comp.content.title && (
                                      <h4 className="font-bold text-sm text-center text-slate-800">
                                        {comp.content.title}
                                      </h4>
                                    )}
                                    <div className={`grid gap-3 ${isMobileView ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4"}`}>
                                      {(comp.content.stats || []).map(
                                        (st: any, sti: number) => (
                                          <div
                                            key={sti}
                                            className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1"
                                          >
                                            <span className="text-xl font-black text-[#2171B5]">
                                              {st.number}
                                            </span>
                                            <p className="text-[10px] text-slate-600 font-semibold leading-tight">
                                              {st.label}
                                            </p>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* 4. ABOUT PREVIEW (Supports Why Join Style with Lotus bullets) */}
                                {comp.type === "about" && (
                                  comp.content.style === "whyJoin" || comp.content.benefits ? (
                                    <div className="space-y-5 text-left">
                                      <div>
                                        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                          {comp.content.title || "Why join the webinar?"}
                                        </h2>
                                        <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                                          {comp.content.subtitle || "This webinar will help you leverage the impact of stars in day-to-day life."}
                                        </p>
                                      </div>

                                      <div className="space-y-3">
                                        {(comp.content.benefits || [
                                          "Make confident and informed life decisions.",
                                          "Manage stress and anxiety more effectively.",
                                          "Fulfil your dreams like buying your own house.",
                                          "Enhance your health and well-being through spiritual insights.",
                                          "Get logical and practical remedies to tackle life's challenges.",
                                          "Maintain stronger relationships with family and friends."
                                        ]).map((benefit: string, bIdx: number) => (
                                          <div key={bIdx} className="flex items-start gap-3">
                                            <div className="shrink-0 mt-0.5">
                                              <LotusChakraIcon className="w-5 h-5" />
                                            </div>
                                            <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug">
                                              {benefit}
                                            </p>
                                          </div>
                                        ))}
                                      </div>

                                      <div className="pt-2">
                                        <span className="inline-block px-7 py-3 bg-[#2171B5] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md">
                                          {comp.content.buttonText || "Register now"}
                                        </span>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="space-y-3 text-left">
                                      {comp.content.tag && (
                                        <span className="text-[10px] font-bold text-[#2171B5] uppercase tracking-wider bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                                          {comp.content.tag}
                                        </span>
                                      )}
                                      <h3 className="font-extrabold text-xl text-slate-900">
                                        {comp.content.title}
                                      </h3>
                                      <p className="text-xs text-slate-600 leading-relaxed">
                                        {comp.content.description}
                                      </p>
                                      {comp.content.items && (
                                        <div className="space-y-2 pt-1">
                                          {comp.content.items.map(
                                            (it: any, iti: number) => (
                                              <div
                                                key={iti}
                                                className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5"
                                              >
                                                <h5 className="font-bold text-xs text-[#2171B5]">
                                                  {it.title}
                                                </h5>
                                                <p className="text-[11px] text-slate-500">
                                                  {it.desc}
                                                </p>
                                              </div>
                                            )
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )
                                )}

                                {/* VIDEO / MEDIA CONTAINER PREVIEW (Supports Video or Image) */}
                                {comp.type === "video" && (
                                  <div className="rounded-2xl overflow-hidden border-2 border-amber-200/80 bg-slate-900 shadow-xl relative aspect-video flex items-center justify-center group">
                                    {comp.content.mediaType === "image" ? (
                                      <img
                                        src={comp.content.imageUrl || "/hero_image_2.png"}
                                        alt={comp.content.title || "Webinar Media"}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-blue-950">
                                        <img
                                          src={comp.content.imageUrl || "/hero_image_2.png"}
                                          alt="Video Thumbnail"
                                          className="w-full h-full object-cover opacity-65"
                                        />
                                        <div className="absolute w-14 h-14 rounded-full bg-white/95 text-purple-900 flex items-center justify-center shadow-2xl pl-1 group-hover:scale-110 transition">
                                          <Play className="w-6 h-6 fill-purple-900" />
                                        </div>
                                      </div>
                                    )}
                                    <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold rounded-md flex items-center gap-1">
                                      {comp.content.mediaType === "image" ? <ImageIcon className="w-3 h-3" /> : <VideoIcon className="w-3 h-3" />}
                                      <span>{comp.content.mediaType === "image" ? "Image Slot" : "Video Slot"}</span>
                                    </div>
                                  </div>
                                )}

                                {/* 5. FEATURES PREVIEW (Supports Vedic 6 Modules with SVGs) */}
                                {comp.type === "features" && (
                                  comp.content.style === "vedicModules" || comp.content.modules ? (
                                    <div className="space-y-6 text-center">
                                      <div>
                                        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                          {comp.content.title || "What will you learn in this mega webinar?"}
                                        </h2>
                                        <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-2xl mx-auto">
                                          {comp.content.subtitle || "Here's the module for you to learn astrology online through our webinar..."}
                                        </p>
                                      </div>

                                      {/* 2-column grid of 6 cards with fixed authentic Vedic SVGs */}
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                                        {(comp.content.modules || [
                                          { id: 1, iconType: "clover", title: "Improving Your Luck with Astrology", desc: "Use astrological methods to make your luck stronger." },
                                          { id: 2, iconType: "kundali", title: "Understanding Your Birth Chart/Kundali", desc: "Learn about the secrets in your birth chart." },
                                          { id: 3, iconType: "planets", title: "How Planets Affect Your Life", desc: "See how planets influence important parts of your life like your job, love life, and money." },
                                          { id: 4, iconType: "yantra", title: "Basics of Vedic Astrology", desc: "Understand the simple rules that Vedic astrology is built on." },
                                          { id: 5, iconType: "rashi", title: "Rashi/ Zodiac Signs Insights", desc: "Get special tips based on your Rashi." },
                                          { id: 6, iconType: "lagna", title: "Deep Dive into Lagna Chart", desc: "Get a full understanding of Lagna chart." },
                                        ]).map((mod: any, mIdx: number) => (
                                          <div
                                            key={mIdx}
                                            className="p-4 sm:p-5 rounded-2xl bg-white border border-purple-100 hover:border-[#2171B5]/50 hover:shadow-md transition flex items-center gap-4"
                                          >
                                            <div className="shrink-0 w-12 h-12 flex items-center justify-center text-slate-800">
                                              {getVedicIcon(mod.iconType)}
                                            </div>
                                            <div className="space-y-1">
                                              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 leading-snug">
                                                {mod.title}
                                              </h3>
                                              <p className="text-xs text-slate-500 leading-relaxed">
                                                {mod.desc}
                                              </p>
                                            </div>
                                          </div>
                                        ))}
                                      </div>

                                      {comp.content.bottomText && (
                                        <p className="text-xs sm:text-sm text-slate-600 font-medium tracking-wide pt-1">
                                          {comp.content.bottomText}
                                        </p>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="space-y-3 text-left">
                                      <h4 className="font-extrabold text-lg text-slate-900">
                                        {comp.content.title}
                                      </h4>
                                      <p className="text-xs text-slate-500">
                                        {comp.content.subtitle}
                                      </p>
                                      <div className={`grid gap-2.5 pt-1 ${isMobileView ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`}>
                                        {(comp.content.cards || []).map(
                                          (c: any, ci: number) => (
                                            <div
                                              key={ci}
                                              className="p-3.5 rounded-xl bg-slate-50 text-xs border border-slate-200 space-y-1 hover:border-[#2171B5]/40 transition"
                                            >
                                              <span className="font-bold text-[#2171B5] block">
                                                ★ {c.title}
                                              </span>
                                              <span className="text-[11px] text-slate-600 block leading-relaxed">
                                                {c.desc}
                                              </span>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  )
                                )}

                                {/* 6. TESTIMONIALS PREVIEW */}
                                {comp.type === "testimonials" && (
                                  <div className="space-y-3 text-left">
                                    {comp.content.tag && (
                                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                                        {comp.content.tag}
                                      </span>
                                    )}
                                    <h4 className="font-bold text-base text-slate-900">
                                      {comp.content.title || "Student Transformations"}
                                    </h4>
                                    <p className="text-xs text-slate-500">
                                      {comp.content.subtitle}
                                    </p>
                                    <div className={`grid gap-2.5 pt-1 ${isMobileView ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-3"}`}>
                                      {(comp.content.reviews || []).map(
                                        (rev: any, ri: number) => (
                                          <div
                                            key={ri}
                                            className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs"
                                          >
                                            <div className="flex text-amber-500 text-xs">
                                              {"★".repeat(rev.rating || 5)}
                                            </div>
                                            <p className="text-[11px] text-slate-600 italic line-clamp-3">
                                              "{rev.quote}"
                                            </p>
                                            <div className="pt-1 border-t border-slate-200">
                                              <span className="font-bold text-slate-800 text-[11px] block">
                                                {rev.name}
                                              </span>
                                              <span className="text-[#2171B5] text-[10px] block">
                                                {rev.role}
                                              </span>
                                            </div>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* 7. FAQ ACCORDION PREVIEW (Screenshot 4) */}
                                {comp.type === "faq" && (
                                  <div className="space-y-5 text-center max-w-3xl mx-auto">
                                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                      {comp.content.title || "Frequently Asked Questions"}
                                    </h2>
                                    {comp.content.subtitle && (
                                      <p className="text-xs sm:text-sm text-slate-500 -mt-2">
                                        {comp.content.subtitle}
                                      </p>
                                    )}

                                    <div className="space-y-2.5 text-left pt-1">
                                      {(comp.content.faqs || []).map(
                                        (faq: any, fi: number) => {
                                          const isOpen = !!openFaqs[fi];
                                          return (
                                            <div
                                              key={fi}
                                              className="border border-slate-200 bg-white rounded-xl shadow-xs overflow-hidden transition"
                                            >
                                              <div
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setOpenFaqs((prev) => ({ ...prev, [fi]: !prev[fi] }));
                                                }}
                                                className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition cursor-pointer"
                                              >
                                                <span className="font-bold text-xs sm:text-sm text-slate-800">
                                                  {faq.question}
                                                </span>
                                                <span className="text-slate-500 font-bold text-base leading-none ml-3">
                                                  {isOpen ? "−" : "+"}
                                                </span>
                                              </div>
                                              {isOpen && (
                                                <div className="px-5 pb-3.5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-2.5">
                                                  {faq.answer}
                                                </div>
                                              )}
                                            </div>
                                          );
                                        }
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* 8. CTA BANNER PREVIEW (Still Thinking - Happy Life Blue - Screenshot 5) */}
                                {comp.type === "ctaBanner" && (
                                  comp.content.style === "expertCallout" || comp.content.expertImage ? (
                                    <div
                                      className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 text-white shadow-xl relative overflow-hidden"
                                      style={{
                                        background:
                                          comp.content.backgroundColor === "#2171B5" || !comp.content.backgroundColor
                                            ? "linear-gradient(135deg, #175389 0%, #2171B5 50%, #2b88d8 100%)"
                                            : comp.content.backgroundColor,
                                      }}
                                    >
                                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                                        <div className="md:col-span-8 space-y-4 text-left">
                                          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight">
                                            {comp.content.title || "Still thinking? Let us help you take the first step."}
                                          </h2>
                                          {comp.content.subtitle && (
                                            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
                                              {comp.content.subtitle}
                                            </p>
                                          )}
                                          <div>
                                            <span className="inline-block px-6 py-2.5 bg-white text-[#2171B5] font-bold text-xs sm:text-sm rounded-xl shadow-lg">
                                              {comp.content.buttonText || "Talk to an expert"}
                                            </span>
                                          </div>
                                        </div>

                                        <div className="md:col-span-4 flex justify-center md:justify-end">
                                          <img
                                            src={comp.content.expertImage || "/hero_image_2.png"}
                                            alt="Expert Mentor"
                                            className="w-40 h-40 sm:w-48 sm:h-48 object-cover rounded-2xl shadow-xl border-4 border-white/20"
                                            onError={(e) => {
                                              (e.target as any).src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80";
                                            }}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="p-6 bg-gradient-to-r from-[#2171B5] to-blue-700 text-white rounded-2xl text-center space-y-2.5 shadow-md">
                                      {comp.content.badge && (
                                        <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-black/20 px-2.5 py-0.5 rounded-full">
                                          {comp.content.badge}
                                        </span>
                                      )}
                                      <h4 className="font-black text-xl leading-tight">
                                        {comp.content.title}
                                      </h4>
                                      <p className="text-xs text-blue-100 max-w-md mx-auto">
                                        {comp.content.subtitle}
                                      </p>
                                      <div className="pt-1">
                                        <span className="inline-block px-5 py-2.5 bg-white text-[#2171B5] font-extrabold rounded-xl text-xs shadow-md">
                                          {comp.content.buttonText || "Get Started"}
                                        </span>
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            );
                          })}

                          {/* Add Component to this slot */}
                          <div className="pt-1">
                            <select
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleAddComponent(
                                    sIdx,
                                    cIdx,
                                    e.target.value as ComponentItem["type"]
                                  );
                                  e.target.value = "";
                                }
                              }}
                              className="w-full text-xs bg-slate-50 border border-dashed border-slate-300 rounded-xl p-2 text-slate-600 cursor-pointer hover:border-[#2171B5] focus:outline-none"
                            >
                              <option value="">+ Add Component to slot...</option>
                              <option value="hero">Hero Section</option>
                              <option value="leadForm">Lead Capture Form</option>
                              <option value="stats">Stats / Analytics</option>
                              <option value="about">About / Advantage</option>
                              <option value="features">Features / Capabilities</option>
                              <option value="testimonials">Student Testimonials</option>
                              <option value="faq">FAQ Accordion</option>
                              <option value="ctaBanner">Action Banner</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>

            {/* --- FOOTER --- */}
            {template.footerConfig?.enabled && (
              <footer
                id="canvas-footer"
                onClick={() => {
                  setSelectedItem({ type: "footer" });
                  setIsInspectorOpen(true);
                }}
                style={{
                  backgroundColor: template.footerConfig.backgroundColor || "#f8fafc",
                  color: template.footerConfig.textColor || "#475569",
                }}
                className={`cursor-pointer border-t border-slate-200 transition ${
                  selectedItem.type === "footer"
                    ? "ring-2 ring-[#2171B5] ring-inset"
                    : "hover:border-[#2171B5]/50"
                }`}
              >
                {/* OPTION 1: Happy Life Signature (Center Stacked - Exact Website Match) */}
                {(!template.footerConfig.templateStyle || template.footerConfig.templateStyle === 1) && (
                  <div className={`relative ${isMobileView ? "py-10 px-4" : "py-14 px-4 sm:px-8"} text-center overflow-hidden flex flex-col items-center justify-center min-h-[360px] select-none`}>
                    {/* Decorative Ambient Background Soft Glows */}
                    <div className="absolute -top-20 -left-20 w-80 h-80 bg-white blur-[120px] rounded-full opacity-20 pointer-events-none" />
                    <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-black blur-[120px] rounded-full opacity-25 pointer-events-none" />

                    {/* Brand Logo / Mascot Icon */}
                    <div className="mb-5 sm:mb-6 relative z-10">
                      <img
                        alt="Happy Life"
                        src="/logos/osa_logo.png"
                        className="h-11 sm:h-14 md:h-16 w-auto object-contain brightness-0 invert drop-shadow-md mx-auto"
                      />
                    </div>

                    {/* Slogan / Headline Typography */}
                    <div className="max-w-3xl mx-auto space-y-1 mb-6 sm:mb-8 relative z-10 px-2">
                      <h2 className={`font-black tracking-tight text-white ${
                        isMobileView
                          ? "text-lg sm:text-xl leading-snug"
                          : "text-2xl sm:text-4xl md:text-5xl leading-[1.15]"
                      }`}>
                        {template.footerConfig.headline ||
                          "Your Birth Chart Holds Clues, Not Instant MIRACLES"}
                      </h2>
                    </div>

                    {/* Social Links Row with REAL SVG Icons */}
                    <div className="flex items-center justify-center gap-4 sm:gap-6 mb-6 sm:mb-8 relative z-10">
                      {[
                        { key: "facebook", url: template.footerConfig?.socialLinks?.facebook },
                        { key: "twitter", url: template.footerConfig?.socialLinks?.twitter },
                        { key: "instagram", url: template.footerConfig?.socialLinks?.instagram },
                        { key: "youtube", url: template.footerConfig?.socialLinks?.youtube },
                      ].map((item) => (
                        <a
                          key={item.key}
                          href={item.url || "#"}
                          target="_blank"
                          rel="noreferrer"
                          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition hover:scale-110 shadow-sm"
                          title={item.key}
                        >
                          <BrandSocialIcon network={item.key} className="w-4 h-4" />
                        </a>
                      ))}
                    </div>

                    {/* Email Contact Line */}
                    <div className="flex items-center justify-center gap-2 text-xs text-white/90 mb-5 relative z-10 font-semibold">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/80">
                        <rect width="20" height="16" x="2" y="4" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                      <a href={`mailto:${template.footerConfig.contactEmail || "happylifereport@gmail.com"}`} className="hover:underline font-semibold tracking-wide">
                        {template.footerConfig.contactEmail || "happylifereport@gmail.com"}
                      </a>
                    </div>

                    {/* Navigation Links Row */}
                    <div className="flex flex-wrap justify-center gap-x-5 sm:gap-x-8 gap-y-2 text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-white font-bold mb-6 relative z-10 px-2">
                      {(template.footerConfig.links || [
                        { label: "Privacy Policy", url: "/privacy-policy" },
                        { label: "Services", url: "/courses" },
                        { label: "Blog", url: "/news" },
                        { label: "Work", url: "/gig" },
                        { label: "Contact", url: "/contact" },
                      ]).map((lnk, li) => (
                        <span key={li} className="hover:opacity-75 transition cursor-pointer">
                          {lnk.label}
                        </span>
                      ))}
                    </div>

                    {/* Tagline */}
                    <div className="opacity-70 text-center relative z-10 border-t border-white/10 pt-4 w-full">
                      <p className="text-[8px] sm:text-[9px] uppercase tracking-[0.25em] sm:tracking-[0.35em] font-medium text-white px-2">
                        {template.footerConfig.tagline ||
                          "ALIGN YOUR ENERGY, UNLOCK SUCCESS, AND LIVE WITH PURPOSE"}
                      </p>
                    </div>
                  </div>
                )}

                {/* OPTION 2: Happy Life Split (Left & Right Positions) */}
                {template.footerConfig.templateStyle === 2 && (
                  <div className={`relative ${isMobileView ? "py-10 px-4 text-center" : "py-12 px-6 sm:px-12 text-left"} overflow-hidden flex flex-col justify-between min-h-[360px] select-none`}>
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-white blur-[130px] rounded-full opacity-20 pointer-events-none" />
                    <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-black blur-[130px] rounded-full opacity-20 pointer-events-none" />

                    <div className={isMobileView ? "flex flex-col items-center gap-6 relative z-10" : "grid grid-cols-1 md:grid-cols-2 gap-10 items-center relative z-10"}>
                      {/* Left Side: Brand, Headline, Email */}
                      <div className={`space-y-4 ${isMobileView ? "flex flex-col items-center text-center" : "text-left"}`}>
                        <img
                          alt="Happy Life"
                          src="/logos/osa_logo.png"
                          className="h-11 md:h-14 w-auto object-contain brightness-0 invert drop-shadow-md"
                        />
                        <h2 className={`font-black tracking-tight text-white ${
                          isMobileView
                            ? "text-lg sm:text-xl leading-snug"
                            : "text-2xl sm:text-3xl md:text-4xl leading-tight"
                        }`}>
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

                      {/* Right Side: Links & Real SVG Social Icons */}
                      <div className={`space-y-5 ${isMobileView ? "flex flex-col items-center text-center" : "md:text-right"}`}>
                        {/* Social Links Row */}
                        <div className={`flex items-center gap-3.5 ${isMobileView ? "justify-center" : "md:justify-end"}`}>
                          {[
                            { key: "facebook", url: template.footerConfig?.socialLinks?.facebook },
                            { key: "twitter", url: template.footerConfig?.socialLinks?.twitter },
                            { key: "instagram", url: template.footerConfig?.socialLinks?.instagram },
                            { key: "youtube", url: template.footerConfig?.socialLinks?.youtube },
                          ].map((item) => (
                            <a
                              key={item.key}
                              href={item.url || "#"}
                              target="_blank"
                              rel="noreferrer"
                              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition hover:scale-110 shadow-sm"
                              title={item.key}
                            >
                              <BrandSocialIcon network={item.key} className="w-4 h-4" />
                            </a>
                          ))}
                        </div>

                        {/* Navigation Links Column / Grid */}
                        <div className={`flex flex-wrap gap-x-5 gap-y-2 text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-white font-bold ${isMobileView ? "justify-center" : "md:justify-end"}`}>
                          {(template.footerConfig.links || [
                            { label: "Privacy Policy", url: "/privacy-policy" },
                            { label: "Services", url: "/courses" },
                            { label: "Blog", url: "/news" },
                            { label: "Work", url: "/gig" },
                            { label: "Contact", url: "/contact" },
                          ]).map((lnk, li) => (
                            <span key={li} className="hover:opacity-75 transition cursor-pointer">
                              {lnk.label}
                            </span>
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
                  <div className={`relative ${isMobileView ? "py-8 px-4 text-center" : "py-10 px-6 sm:px-12"} overflow-hidden flex flex-col justify-between min-h-[360px] select-none`}>
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-white blur-[130px] rounded-full opacity-20 pointer-events-none" />
                    <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-black blur-[130px] rounded-full opacity-20 pointer-events-none" />

                    {/* Top Row: Logo on Left, Social Icons on Right */}
                    <div className={`pb-5 border-b border-white/10 relative z-10 flex ${isMobileView ? "flex-col items-center gap-3.5" : "flex-row items-center justify-between"}`}>
                      <img
                        alt="Happy Life"
                        src="/logos/osa_logo.png"
                        className="h-10 sm:h-12 w-auto object-contain brightness-0 invert drop-shadow-md"
                      />
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
                            { key: "facebook", url: template.footerConfig?.socialLinks?.facebook },
                            { key: "twitter", url: template.footerConfig?.socialLinks?.twitter },
                            { key: "instagram", url: template.footerConfig?.socialLinks?.instagram },
                            { key: "youtube", url: template.footerConfig?.socialLinks?.youtube },
                          ].map((item) => (
                            <a
                              key={item.key}
                              href={item.url || "#"}
                              target="_blank"
                              rel="noreferrer"
                              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition hover:scale-110 shadow-sm"
                              title={item.key}
                            >
                              <BrandSocialIcon network={item.key} className="w-3.5 h-3.5" />
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Center Big Statement */}
                    <div className="my-8 sm:my-10 text-center max-w-4xl mx-auto relative z-10 px-2">
                      <h2 className={`font-black text-white tracking-tight ${
                        isMobileView
                          ? "text-lg sm:text-xl leading-snug"
                          : "text-2xl sm:text-4xl md:text-5xl leading-tight"
                      }`}>
                        {template.footerConfig.headline ||
                          "Your Birth Chart Holds Clues, Not Instant MIRACLES"}
                      </h2>
                    </div>

                    {/* Bottom Row: Links & Tagline */}
                    <div className={`pt-5 border-t border-white/10 flex ${isMobileView ? "flex-col items-center gap-3 text-center" : "flex-col sm:flex-row items-center justify-between gap-4"} text-xs text-white/80 relative z-10`}>
                      <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-[10px] uppercase tracking-[0.2em] font-bold text-white">
                        {(template.footerConfig.links || [
                          { label: "Privacy Policy", url: "/privacy-policy" },
                          { label: "Services", url: "/courses" },
                          { label: "Blog", url: "/news" },
                          { label: "Work", url: "/gig" },
                          { label: "Contact", url: "/contact" },
                        ]).map((lnk, li) => (
                          <span key={li} className="hover:opacity-75 transition cursor-pointer">
                            {lnk.label}
                          </span>
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
        </main>

        {/* ======================================================== */}
        {/* RIGHT PANEL: EDIT BLOCK / DESIGN CUSTOMIZER (Shopify style)*/}
        {/* ======================================================== */}
        {isInspectorOpen && (
          <aside className="w-80 bg-white border-l border-slate-200 flex flex-col shrink-0 overflow-y-auto z-20 shadow-xl text-slate-800">
            {/* Customizer Title Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10">
              <div>
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900">
                  {selectedItem.type === "component"
                    ? `Edit ${activeComponent?.type || "Component"} Block`
                    : `Edit ${selectedItem.type} Block`}
                </h3>
                <p className="text-[10px] text-slate-400">Design customizer</p>
              </div>
              <button
                type="button"
                onClick={() => setIsInspectorOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-5 text-xs flex-1">
              {/* 1. STYLE THEME COLORS */}
              <div className="space-y-3 pb-4 border-b border-slate-200">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  1. Style Theme Colors
                </span>

                {/* Background color */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600 block">
                    Background Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={
                        selectedItem.type === "footer"
                          ? template.footerConfig?.backgroundColor || "#f8fafc"
                          : activeSection?.backgroundColor || "#ffffff"
                      }
                      onChange={(e) => {
                        if (selectedItem.type === "footer") {
                          setTemplate({
                            ...template,
                            footerConfig: {
                              ...(template.footerConfig || { enabled: true }),
                              backgroundColor: e.target.value,
                            },
                          });
                        } else {
                          updateActiveSectionStyle({ backgroundColor: e.target.value });
                        }
                      }}
                      className="w-8 h-8 rounded border border-slate-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={
                        selectedItem.type === "footer"
                          ? template.footerConfig?.backgroundColor || "#f8fafc"
                          : activeSection?.backgroundColor || "#ffffff"
                      }
                      onChange={(e) => {
                        if (selectedItem.type === "footer") {
                          setTemplate({
                            ...template,
                            footerConfig: {
                              ...(template.footerConfig || { enabled: true }),
                              backgroundColor: e.target.value,
                            },
                          });
                        } else {
                          updateActiveSectionStyle({ backgroundColor: e.target.value });
                        }
                      }}
                      className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Text color */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600 block">
                    Text Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={
                        selectedItem.type === "footer"
                          ? template.footerConfig?.textColor || "#475569"
                          : activeSection?.textColor || "#0F172A"
                      }
                      onChange={(e) => {
                        if (selectedItem.type === "footer") {
                          setTemplate({
                            ...template,
                            footerConfig: {
                              ...(template.footerConfig || { enabled: true }),
                              textColor: e.target.value,
                            },
                          });
                        } else {
                          updateActiveSectionStyle({ textColor: e.target.value });
                        }
                      }}
                      className="w-8 h-8 rounded border border-slate-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={
                        selectedItem.type === "footer"
                          ? template.footerConfig?.textColor || "#475569"
                          : activeSection?.textColor || "#0F172A"
                      }
                      onChange={(e) => {
                        if (selectedItem.type === "footer") {
                          setTemplate({
                            ...template,
                            footerConfig: {
                              ...(template.footerConfig || { enabled: true }),
                              textColor: e.target.value,
                            },
                          });
                        } else {
                          updateActiveSectionStyle({ textColor: e.target.value });
                        }
                      }}
                      className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Base Font Size Slider */}
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-600">
                      Base Font Size ({baseFontSize}px)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="11"
                    max="18"
                    value={baseFontSize}
                    onChange={(e) => setBaseFontSize(Number(e.target.value))}
                    className="w-full accent-[#2171B5] cursor-pointer"
                  />
                </div>

                {/* Section Container Max Width (4XL, 5XL, 6XL, 7XL, Full) */}
                {activeSection && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-semibold text-slate-600 block">
                        Container Max Width
                      </label>
                      <span className="text-[10px] font-mono font-bold text-[#2171B5] uppercase">
                        {activeSection.maxWidth || "7xl"}
                      </span>
                    </div>
                    <div className="grid grid-cols-5 gap-1">
                      {[
                        { label: "4XL", value: "4xl" },
                        { label: "5XL", value: "5xl" },
                        { label: "6XL", value: "6xl" },
                        { label: "7XL", value: "7xl" },
                        { label: "Full", value: "full" },
                      ].map((opt) => {
                        const isSelected = (activeSection.maxWidth || "7xl") === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => updateActiveSectionStyle({ maxWidth: opt.value })}
                            className={`py-1.5 px-1 rounded-lg border text-[11px] font-bold text-center transition cursor-pointer ${
                              isSelected
                                ? "bg-[#2171B5] text-white border-[#2171B5] shadow-xs"
                                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* 2. CONTENT EDITOR */}
              <div className="space-y-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  2. Content Editor
                </span>

                {/* If Section selected */}
                {selectedItem.type === "section" && activeSection && (
                  <div className="space-y-3">
                    <div>
                      <label className="block font-semibold mb-1">Section Title</label>
                      <input
                        type="text"
                        value={activeSection.name}
                        onChange={(e) =>
                          updateActiveSectionStyle({ name: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Layout Mode</label>
                      <select
                        value={activeSection.layout}
                        onChange={(e) => {
                          const val = e.target.value as "1-column" | "2-column";
                          const updated = [...template.sections];
                          const sec = updated[selectedItem.sectionIndex!];
                          sec.layout = val;
                          if (val === "2-column" && sec.columns.length < 2) {
                            sec.columns.push({
                              id: "col-2",
                              width: "1/2",
                              components: [],
                            });
                          }
                          setTemplate({ ...template, sections: updated });
                        }}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      >
                        <option value="1-column">1-Column (Full Width)</option>
                        <option value="2-column">2-Column (Side by Side)</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* If LEAD FORM selected: Form fields & select options manager */}
                {selectedItem.type === "component" && activeComponent?.type === "leadForm" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block font-semibold mb-1">Badge Tag</label>
                      <input
                        type="text"
                        value={activeComponent.content.badge || ""}
                        onChange={(e) =>
                          updateActiveComponentContent({ badge: e.target.value })
                        }
                        placeholder="e.g. STUDENT REGISTRATION"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Form Title</label>
                      <input
                        type="text"
                        value={activeComponent.content.title || ""}
                        onChange={(e) =>
                          updateActiveComponentContent({ title: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Subtitle</label>
                      <textarea
                        rows={2}
                        value={activeComponent.content.subtitle || ""}
                        onChange={(e) =>
                          updateActiveComponentContent({ subtitle: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Submit Button Text</label>
                      <input
                        type="text"
                        value={activeComponent.content.buttonText || ""}
                        onChange={(e) =>
                          updateActiveComponentContent({ buttonText: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>

                    {/* DYNAMIC FORM FIELDS */}
                    <div className="pt-3 border-t border-slate-200 space-y-3">
                      <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
                        Form Inputs & Select Questions ({(activeComponent.content.fields || []).length})
                      </span>

                      <div className="space-y-3">
                        {(activeComponent.content.fields || []).map((field: any, fIdx: number) => (
                          <div
                            key={fIdx}
                            className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-slate-800 text-xs">
                                #{fIdx + 1}: {field.label || "Untitled Input"}
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const fields = [...activeComponent.content.fields];
                                    if (fIdx > 0) {
                                      const temp = fields[fIdx];
                                      fields[fIdx] = fields[fIdx - 1];
                                      fields[fIdx - 1] = temp;
                                      updateActiveComponentContent({ fields });
                                    }
                                  }}
                                  disabled={fIdx === 0}
                                  className="p-0.5 hover:text-[#2171B5] disabled:opacity-20"
                                  title="Move Up"
                                >
                                  <MoveUp className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const fields = [...activeComponent.content.fields];
                                    if (fIdx < fields.length - 1) {
                                      const temp = fields[fIdx];
                                      fields[fIdx] = fields[fIdx + 1];
                                      fields[fIdx + 1] = temp;
                                      updateActiveComponentContent({ fields });
                                    }
                                  }}
                                  disabled={fIdx === activeComponent.content.fields.length - 1}
                                  className="p-0.5 hover:text-[#2171B5] disabled:opacity-20"
                                  title="Move Down"
                                >
                                  <MoveDown className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const fields = [...activeComponent.content.fields];
                                    fields.splice(fIdx, 1);
                                    updateActiveComponentContent({ fields });
                                  }}
                                  className="p-0.5 text-slate-400 hover:text-red-500"
                                  title="Remove Field"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] uppercase font-semibold text-slate-500 block mb-0.5">
                                  Label
                                </label>
                                <input
                                  type="text"
                                  value={field.label || ""}
                                  onChange={(e) => {
                                    const fields = [...activeComponent.content.fields];
                                    fields[fIdx].label = e.target.value;
                                    updateActiveComponentContent({ fields });
                                  }}
                                  className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] uppercase font-semibold text-slate-500 block mb-0.5">
                                  Field Type
                                </label>
                                <select
                                  value={field.type || "text"}
                                  onChange={(e) => {
                                    const fields = [...activeComponent.content.fields];
                                    const newType = e.target.value;
                                    fields[fIdx].type = newType;
                                    if (newType === "select" && !fields[fIdx].options) {
                                      fields[fIdx].options = [
                                        "Instagram",
                                        "YouTube",
                                        "LinkedIn",
                                        "Google Search",
                                        "Facebook",
                                        "Twitter / X",
                                        "Friend / Referral",
                                        "Other",
                                      ];
                                    }
                                    updateActiveComponentContent({ fields });
                                  }}
                                  className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                                >
                                  <option value="text">Text Input</option>
                                  <option value="email">Email</option>
                                  <option value="tel">Phone / WhatsApp</option>
                                  <option value="select">Select Dropdown</option>
                                  <option value="textarea">Textarea</option>
                                </select>
                              </div>
                            </div>

                            {/* SELECT OPTIONS MANAGER */}
                            {field.type === "select" && (
                              <div className="pt-2 border-t border-slate-200 space-y-2">
                                <span className="text-[10px] font-bold text-[#2171B5] uppercase tracking-wider block">
                                  Dropdown Options ({(field.options || []).length})
                                </span>

                                {/* Chips */}
                                <div className="flex flex-wrap gap-1.5">
                                  {(field.options || []).map((opt: string, optIdx: number) => (
                                    <span
                                      key={optIdx}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-[#2171B5] rounded text-[10px] font-medium border border-blue-200"
                                    >
                                      {opt}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const fields = [...activeComponent.content.fields];
                                          fields[fIdx].options.splice(optIdx, 1);
                                          updateActiveComponentContent({ fields });
                                        }}
                                        className="hover:text-red-500 font-bold ml-0.5"
                                      >
                                        ×
                                      </button>
                                    </span>
                                  ))}
                                </div>

                                {/* Add Option Input */}
                                <div className="flex gap-1.5 pt-1">
                                  <input
                                    type="text"
                                    placeholder="Type option name..."
                                    value={newOptionInput[fIdx] || ""}
                                    onChange={(e) =>
                                      setNewOptionInput({
                                        ...newOptionInput,
                                        [fIdx]: e.target.value,
                                      })
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter" && newOptionInput[fIdx]?.trim()) {
                                        e.preventDefault();
                                        const fields = [...activeComponent.content.fields];
                                        if (!fields[fIdx].options) fields[fIdx].options = [];
                                        fields[fIdx].options.push(newOptionInput[fIdx].trim());
                                        updateActiveComponentContent({ fields });
                                        setNewOptionInput({ ...newOptionInput, [fIdx]: "" });
                                      }
                                    }}
                                    className="flex-1 px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (newOptionInput[fIdx]?.trim()) {
                                        const fields = [...activeComponent.content.fields];
                                        if (!fields[fIdx].options) fields[fIdx].options = [];
                                        fields[fIdx].options.push(newOptionInput[fIdx].trim());
                                        updateActiveComponentContent({ fields });
                                        setNewOptionInput({ ...newOptionInput, [fIdx]: "" });
                                      }
                                    }}
                                    className="px-2.5 py-1 bg-[#2171B5] text-white rounded text-xs font-semibold hover:bg-blue-700"
                                  >
                                    + Add
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Quick Add Buttons */}
                      <div className="pt-2 space-y-2">
                        <button
                          type="button"
                          onClick={() => {
                            const fields = [...(activeComponent.content.fields || [])];
                            fields.push({
                              name: "source_" + Date.now(),
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
                            });
                            updateActiveComponentContent({ fields });
                            toast.success("Added 'Where did you find out about us?' select dropdown!");
                          }}
                          className="w-full py-2 bg-blue-50 border border-blue-200 text-[#2171B5] rounded-xl font-bold hover:bg-blue-100 transition flex items-center justify-center gap-1.5 text-xs shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          + Add "Where did you find out about us?" Select
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const fields = [...(activeComponent.content.fields || [])];
                            fields.push({
                              name: "custom_field_" + Date.now(),
                              label: "Additional Information",
                              type: "text",
                              required: false,
                              placeholder: "Enter details...",
                            });
                            updateActiveComponentContent({ fields });
                            toast.success("Added input field!");
                          }}
                          className="w-full py-1.5 border border-dashed border-slate-300 text-slate-700 rounded-lg font-medium text-xs flex items-center justify-center gap-1 hover:border-[#2171B5]"
                        >
                          <Plus className="w-3 h-3 text-[#2171B5]" />
                          + Add Custom Field
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* If HERO selected */}
                {selectedItem.type === "component" && activeComponent?.type === "hero" && (
                  <div className="space-y-3">
                    <div>
                      <label className="block font-semibold mb-1 text-slate-700">Headline</label>
                      <input
                        type="text"
                        value={activeComponent.content.title || ""}
                        onChange={(e) =>
                          updateActiveComponentContent({ title: e.target.value })
                        }
                        placeholder="Mega Astrology Webinar"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-slate-700">Subtitle</label>
                      <textarea
                        rows={3}
                        value={activeComponent.content.subtitle || ""}
                        onChange={(e) =>
                          updateActiveComponentContent({ subtitle: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>

                    {/* Event Meta Settings */}
                    <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl space-y-2.5">
                      <span className="text-[10px] font-bold text-[#2171B5] uppercase tracking-wider block">
                        Webinar Details & Schedule
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Date</label>
                          <input
                            type="text"
                            value={activeComponent.content.eventDate || ""}
                            onChange={(e) =>
                              updateActiveComponentContent({ eventDate: e.target.value })
                            }
                            placeholder="24 Oct, 2026"
                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Time</label>
                          <input
                            type="text"
                            value={activeComponent.content.eventTime || ""}
                            onChange={(e) =>
                              updateActiveComponentContent({ eventTime: e.target.value })
                            }
                            placeholder="01:00 PM"
                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Duration</label>
                          <input
                            type="text"
                            value={activeComponent.content.duration || ""}
                            onChange={(e) =>
                              updateActiveComponentContent({ duration: e.target.value })
                            }
                            placeholder="4 Hours"
                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Mentor Name</label>
                          <input
                            type="text"
                            value={activeComponent.content.mentorName || ""}
                            onChange={(e) =>
                              updateActiveComponentContent({ mentorName: e.target.value })
                            }
                            placeholder="Astro Arun Pandit"
                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Price and CTA */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Original Price</label>
                        <input
                          type="text"
                          value={activeComponent.content.originalPrice || ""}
                          onChange={(e) =>
                            updateActiveComponentContent({ originalPrice: e.target.value })
                          }
                          placeholder="₹999"
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Discount Price</label>
                        <input
                          type="text"
                          value={activeComponent.content.discountPrice || ""}
                          onChange={(e) =>
                            updateActiveComponentContent({ discountPrice: e.target.value })
                          }
                          placeholder="₹99/-"
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-purple-700"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold mb-1 text-slate-700">Button Link</label>
                      <input
                        type="text"
                        value={activeComponent.content.buttonLink || activeComponent.content.ctaLink || ""}
                        onChange={(e) =>
                          updateActiveComponentContent({ buttonLink: e.target.value, ctaLink: e.target.value })
                        }
                        placeholder="#lead-form"
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                      />
                    </div>

                    {/* Background and Mentor Images with Direct Upload */}
                    <div className="space-y-3 pt-2 border-t border-slate-200">
                      <MediaUploadField
                        label="Custom Background Image / Video Poster"
                        value={activeComponent.content.backgroundImage || ""}
                        onChange={(val) => updateActiveComponentContent({ backgroundImage: val })}
                        placeholder="Leave blank for Default Cosmic Blue"
                        type="image"
                        accept="image/*"
                        fieldKey="hero_bg"
                      />
                      <MediaUploadField
                        label="Mentor Photo (Cutout)"
                        value={activeComponent.content.mentorImage || "/hero_image_2.png"}
                        onChange={(val) => updateActiveComponentContent({ mentorImage: val })}
                        placeholder="/hero_image_2.png"
                        type="image"
                        accept="image/*"
                        fieldKey="hero_mentor"
                      />
                    </div>
                  </div>
                )}

                {/* If ABOUT / WHY JOIN selected */}
                {selectedItem.type === "component" && activeComponent?.type === "about" && (
                  <div className="space-y-3">
                    <div>
                      <label className="block font-semibold mb-1 text-slate-700">Section Title</label>
                      <input
                        type="text"
                        value={activeComponent.content.title || ""}
                        onChange={(e) =>
                          updateActiveComponentContent({ title: e.target.value })
                        }
                        placeholder="Why join the webinar?"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-slate-700">Subtitle</label>
                      <textarea
                        rows={2}
                        value={activeComponent.content.subtitle || activeComponent.content.description || ""}
                        onChange={(e) =>
                          updateActiveComponentContent({ subtitle: e.target.value, description: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>

                    {/* Benefits List */}
                    <div className="space-y-2 pt-2 border-t border-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                          Key Benefits ({(activeComponent.content.benefits || []).length})
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const current = [...(activeComponent.content.benefits || [])];
                            current.push("New impactful webinar benefit");
                            updateActiveComponentContent({ benefits: current });
                          }}
                          className="text-[11px] font-bold text-[#2171B5] hover:underline cursor-pointer"
                        >
                          + Add Benefit
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        {(activeComponent.content.benefits || []).map((b: string, bi: number) => (
                          <div key={bi} className="flex items-center gap-1.5">
                            <LotusChakraIcon className="w-4 h-4 shrink-0" />
                            <input
                              type="text"
                              value={b}
                              onChange={(e) => {
                                const current = [...(activeComponent.content.benefits || [])];
                                current[bi] = e.target.value;
                                updateActiveComponentContent({ benefits: current });
                              }}
                              className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const current = [...(activeComponent.content.benefits || [])];
                                current.splice(bi, 1);
                                updateActiveComponentContent({ benefits: current });
                              }}
                              className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold mb-1 text-slate-700">Button Text</label>
                      <input
                        type="text"
                        value={activeComponent.content.buttonText || ""}
                        onChange={(e) =>
                          updateActiveComponentContent({ buttonText: e.target.value })
                        }
                        placeholder="Register now"
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* If VIDEO / MEDIA selected */}
                {selectedItem.type === "component" && activeComponent?.type === "video" && (
                  <div className="space-y-3">
                    <div>
                      <label className="block font-semibold mb-1.5 text-slate-700">Media Container Type</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => updateActiveComponentContent({ mediaType: "video" })}
                          className={`px-3 py-2 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                            activeComponent.content.mediaType !== "image"
                              ? "bg-blue-50 border-blue-400 text-[#2171B5]"
                              : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          <VideoIcon className="w-3.5 h-3.5" />
                          <span>Video</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => updateActiveComponentContent({ mediaType: "image" })}
                          className={`px-3 py-2 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                            activeComponent.content.mediaType === "image"
                              ? "bg-blue-50 border-blue-400 text-[#2171B5]"
                              : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>Image</span>
                        </button>
                      </div>
                    </div>

                    {activeComponent.content.mediaType !== "image" ? (
                      <MediaUploadField
                        label="Video File or URL (MP4 / WebM / YouTube)"
                        value={activeComponent.content.videoUrl || ""}
                        onChange={(val) => updateActiveComponentContent({ videoUrl: val })}
                        placeholder="Upload video file or paste URL"
                        type="video"
                        accept="video/*"
                        fieldKey="comp_video"
                      />
                    ) : null}

                    <MediaUploadField
                      label={activeComponent.content.mediaType === "image" ? "Component Image" : "Video Poster / Thumbnail Image"}
                      value={activeComponent.content.imageUrl || ""}
                      onChange={(val) => updateActiveComponentContent({ imageUrl: val })}
                      placeholder="/hero_image_2.png"
                      type="image"
                      accept="image/*"
                      fieldKey="comp_poster"
                    />
                  </div>
                )}

                {/* If FEATURES / VEDIC MODULES selected */}
                {selectedItem.type === "component" && activeComponent?.type === "features" && (
                  <div className="space-y-3">
                    <div>
                      <label className="block font-semibold mb-1 text-slate-700">Section Title</label>
                      <input
                        type="text"
                        value={activeComponent.content.title || ""}
                        onChange={(e) =>
                          updateActiveComponentContent({ title: e.target.value })
                        }
                        placeholder="What will you learn in this mega webinar?"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-slate-700">Subtitle</label>
                      <textarea
                        rows={2}
                        value={activeComponent.content.subtitle || ""}
                        onChange={(e) =>
                          updateActiveComponentContent({ subtitle: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>

                    {/* Modules editor */}
                    {(activeComponent.content.modules || []).length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-slate-200">
                        <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
                          Vedic Curriculum Cards ({(activeComponent.content.modules || []).length})
                        </span>
                        <div className="space-y-2.5">
                          {activeComponent.content.modules.map((mod: any, mi: number) => (
                            <div key={mi} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-slate-800">Card #{mi + 1}</span>
                                <span className="text-[10px] text-purple-700 font-mono font-bold uppercase">{mod.iconType} icon</span>
                              </div>
                              <input
                                type="text"
                                value={mod.title}
                                onChange={(e) => {
                                  const modules = [...activeComponent.content.modules];
                                  modules[mi].title = e.target.value;
                                  updateActiveComponentContent({ modules });
                                }}
                                className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs font-semibold"
                              />
                              <textarea
                                rows={2}
                                value={mod.desc}
                                onChange={(e) => {
                                  const modules = [...activeComponent.content.modules];
                                  modules[mi].desc = e.target.value;
                                  updateActiveComponentContent({ modules });
                                }}
                                className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-600"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block font-semibold mb-1 text-slate-700">Bottom Tagline</label>
                      <input
                        type="text"
                        value={activeComponent.content.bottomText || ""}
                        onChange={(e) =>
                          updateActiveComponentContent({ bottomText: e.target.value })
                        }
                        placeholder="This webinar will equip you with actionable insights..."
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* If FAQ selected */}
                {selectedItem.type === "component" && activeComponent?.type === "faq" && (
                  <div className="space-y-3">
                    <div>
                      <label className="block font-semibold mb-1 text-slate-700">Section Title</label>
                      <input
                        type="text"
                        value={activeComponent.content.title || ""}
                        onChange={(e) =>
                          updateActiveComponentContent({ title: e.target.value })
                        }
                        placeholder="Frequently Asked Questions"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                      />
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                          Questions ({(activeComponent.content.faqs || []).length})
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const faqs = [...(activeComponent.content.faqs || [])];
                            faqs.push({
                              question: "New Frequently Asked Question?",
                              answer: "Detailed clear answer for attendees.",
                            });
                            updateActiveComponentContent({ faqs });
                          }}
                          className="text-[11px] font-bold text-[#2171B5] hover:underline cursor-pointer"
                        >
                          + Add Question
                        </button>
                      </div>

                      <div className="space-y-2.5">
                        {(activeComponent.content.faqs || []).map((faq: any, fi: number) => (
                          <div key={fi} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-xs text-slate-800">Q#{fi + 1}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const faqs = [...activeComponent.content.faqs];
                                  faqs.splice(fi, 1);
                                  updateActiveComponentContent({ faqs });
                                }}
                                className="text-slate-400 hover:text-red-500 p-0.5 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <input
                              type="text"
                              value={faq.question}
                              onChange={(e) => {
                                const faqs = [...activeComponent.content.faqs];
                                faqs[fi].question = e.target.value;
                                updateActiveComponentContent({ faqs });
                              }}
                              className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs font-semibold"
                            />
                            <textarea
                              rows={2}
                              value={faq.answer}
                              onChange={(e) => {
                                const faqs = [...activeComponent.content.faqs];
                                faqs[fi].answer = e.target.value;
                                updateActiveComponentContent({ faqs });
                              }}
                              className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-600"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* If CTA BANNER selected */}
                {selectedItem.type === "component" && activeComponent?.type === "ctaBanner" && (
                  <div className="space-y-3">
                    <div>
                      <label className="block font-semibold mb-1 text-slate-700">Headline</label>
                      <textarea
                        rows={2}
                        value={activeComponent.content.title || ""}
                        onChange={(e) =>
                          updateActiveComponentContent({ title: e.target.value })
                        }
                        placeholder="Still thinking? Let us help you take the first step."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-slate-700">Button Text</label>
                      <input
                        type="text"
                        value={activeComponent.content.buttonText || ""}
                        onChange={(e) =>
                          updateActiveComponentContent({ buttonText: e.target.value })
                        }
                        placeholder="Talk to an expert"
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-slate-700">Button Link</label>
                      <input
                        type="text"
                        value={activeComponent.content.buttonLink || ""}
                        onChange={(e) =>
                          updateActiveComponentContent({ buttonLink: e.target.value })
                        }
                        placeholder="#lead-form"
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                      />
                    </div>
                    <MediaUploadField
                      label="Expert Photo (Cutout)"
                      value={activeComponent.content.expertImage || "/hero_image_2.png"}
                      onChange={(val) => updateActiveComponentContent({ expertImage: val })}
                      placeholder="/hero_image_2.png"
                      type="image"
                      accept="image/*"
                      fieldKey="cta_expert"
                    />
                    <div>
                      <label className="block font-semibold mb-1 text-slate-700">Background Color (Happy Life Blue)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={activeComponent.content.backgroundColor || "#2171B5"}
                          onChange={(e) =>
                            updateActiveComponentContent({ backgroundColor: e.target.value })
                          }
                          className="w-8 h-8 rounded border border-slate-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={activeComponent.content.backgroundColor || "#2171B5"}
                          onChange={(e) =>
                            updateActiveComponentContent({ backgroundColor: e.target.value })
                          }
                          className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* If STATS selected */}
                {selectedItem.type === "component" && activeComponent?.type === "stats" && (
                  <div className="space-y-3">
                    <div>
                      <label className="block font-semibold mb-1">Headline</label>
                      <input
                        type="text"
                        value={activeComponent.content.title || ""}
                        onChange={(e) =>
                          updateActiveComponentContent({ title: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block font-semibold">Metrics</label>
                      {(activeComponent.content.stats || []).map((st: any, sti: number) => (
                        <div
                          key={sti}
                          className="grid grid-cols-2 gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200"
                        >
                          <input
                            type="text"
                            value={st.number}
                            onChange={(e) => {
                              const stats = [...activeComponent.content.stats];
                              stats[sti].number = e.target.value;
                              updateActiveComponentContent({ stats });
                            }}
                            className="px-2 py-1 bg-white border border-slate-200 rounded text-xs font-bold text-[#2171B5]"
                          />
                          <input
                            type="text"
                            value={st.label}
                            onChange={(e) => {
                              const stats = [...activeComponent.content.stats];
                              stats[sti].label = e.target.value;
                              updateActiveComponentContent({ stats });
                            }}
                            className="px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* If TESTIMONIALS selected */}
                {selectedItem.type === "component" && activeComponent?.type === "testimonials" && (
                  <div className="space-y-3">
                    <div>
                      <label className="block font-semibold mb-1">Section Title</label>
                      <input
                        type="text"
                        value={activeComponent.content.title || ""}
                        onChange={(e) =>
                          updateActiveComponentContent({ title: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block font-semibold">Reviews</label>
                      {(activeComponent.content.reviews || []).map((rev: any, ri: number) => (
                        <div
                          key={ri}
                          className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5"
                        >
                          <div className="grid grid-cols-2 gap-1.5">
                            <input
                              type="text"
                              value={rev.name}
                              onChange={(e) => {
                                const reviews = [...activeComponent.content.reviews];
                                reviews[ri].name = e.target.value;
                                updateActiveComponentContent({ reviews });
                              }}
                              className="px-2 py-1 bg-white border border-slate-200 rounded text-xs font-bold"
                            />
                            <input
                              type="text"
                              value={rev.role}
                              onChange={(e) => {
                                const reviews = [...activeComponent.content.reviews];
                                reviews[ri].role = e.target.value;
                                updateActiveComponentContent({ reviews });
                              }}
                              className="px-2 py-1 bg-white border border-slate-200 rounded text-xs text-[#2171B5]"
                            />
                          </div>
                          <textarea
                            rows={2}
                            value={rev.quote}
                            onChange={(e) => {
                              const reviews = [...activeComponent.content.reviews];
                              reviews[ri].quote = e.target.value;
                              updateActiveComponentContent({ reviews });
                            }}
                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* If FOOTER selected */}
                {selectedItem.type === "footer" && template.footerConfig && (
                  <div className="space-y-4">
                    {/* Template Style Selector */}
                    <div>
                      <label className="block font-semibold mb-1.5 text-slate-700">
                        Happy Life Footer Layout
                      </label>
                      <div className="space-y-1.5">
                        {[
                          { id: 1, name: "1. Signature (Center Stacked)" },
                          { id: 2, name: "2. Split (Left & Right)" },
                          { id: 3, name: "3. Banner (Top & Bottom)" },
                        ].map((tpl) => (
                          <button
                            key={tpl.id}
                            type="button"
                            onClick={() => {
                              setTemplate({
                                ...template,
                                footerConfig: {
                                  ...template.footerConfig!,
                                  templateStyle: tpl.id,
                                },
                              });
                            }}
                            className={`w-full px-3 py-2 rounded-xl text-xs font-bold border transition text-left cursor-pointer flex items-center justify-between ${
                              (template.footerConfig.templateStyle || 1) === tpl.id
                                ? "bg-blue-50 border-blue-400 text-[#2171B5] shadow-xs"
                                : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            <span>{tpl.name}</span>
                            {(template.footerConfig.templateStyle || 1) === tpl.id && (
                              <Check className="w-3.5 h-3.5 text-[#2171B5]" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Big Headline */}
                    <div>
                      <label className="block font-semibold mb-1 text-slate-700">
                        Main Statement / Slogan
                      </label>
                      <textarea
                        rows={2}
                        value={
                          template.footerConfig.headline ||
                          "Your Birth Chart Holds Clues, Not Instant MIRACLES"
                        }
                        onChange={(e) =>
                          setTemplate({
                            ...template,
                            footerConfig: {
                              ...template.footerConfig!,
                              headline: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                      />
                    </div>

                    {/* Email Contact */}
                    <div>
                      <label className="block font-semibold mb-1 text-slate-700">
                        Contact Email Address
                      </label>
                      <input
                        type="email"
                        value={template.footerConfig.contactEmail || "happylifereport@gmail.com"}
                        onChange={(e) =>
                          setTemplate({
                            ...template,
                            footerConfig: {
                              ...template.footerConfig!,
                              contactEmail: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>

                    {/* Bottom Tagline */}
                    <div>
                      <label className="block font-semibold mb-1 text-slate-700">
                        Bottom Tagline
                      </label>
                      <input
                        type="text"
                        value={
                          template.footerConfig.tagline ||
                          "ALIGN YOUR ENERGY, UNLOCK SUCCESS, AND LIVE WITH PURPOSE"
                        }
                        onChange={(e) =>
                          setTemplate({
                            ...template,
                            footerConfig: {
                              ...template.footerConfig!,
                              tagline: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs uppercase"
                      />
                    </div>

                    {/* Copyright Text */}
                    <div>
                      <label className="block font-semibold mb-1 text-slate-700">
                        Copyright Notice
                      </label>
                      <input
                        type="text"
                        value={template.footerConfig.copyrightText || ""}
                        onChange={(e) =>
                          setTemplate({
                            ...template,
                            footerConfig: {
                              ...template.footerConfig!,
                              copyrightText: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>

                    {/* Social Media Links */}
                    <div className="space-y-2 pt-2 border-t border-slate-200">
                      <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
                        Social Channels
                      </span>
                      {["facebook", "twitter", "instagram", "youtube"].map((channel) => (
                        <div key={channel} className="flex items-center gap-2">
                          <span className="w-20 text-[11px] font-semibold text-slate-600 capitalize">
                            {channel}
                          </span>
                          <input
                            type="text"
                            placeholder="https://..."
                            value={
                              (template.footerConfig?.socialLinks as any)?.[channel] || ""
                            }
                            onChange={(e) => {
                              const updatedSocial = {
                                ...(template.footerConfig?.socialLinks || {}),
                                [channel]: e.target.value,
                              };
                              setTemplate({
                                ...template,
                                footerConfig: {
                                  ...template.footerConfig!,
                                  socialLinks: updatedSocial,
                                },
                              });
                            }}
                            className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Navigation Links */}
                    <div className="space-y-2 pt-2 border-t border-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                          Footer Links
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const currentLinks = template.footerConfig?.links || [];
                            setTemplate({
                              ...template,
                              footerConfig: {
                                ...template.footerConfig!,
                                links: [...currentLinks, { label: "New Link", url: "#" }],
                              },
                            });
                          }}
                          className="text-[11px] font-bold text-[#2171B5] hover:underline cursor-pointer"
                        >
                          + Add Link
                        </button>
                      </div>

                      <div className="space-y-2">
                        {(template.footerConfig.links || []).map((lnk, li) => (
                          <div key={li} className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={lnk.label}
                              onChange={(e) => {
                                const updatedLinks = [...(template.footerConfig?.links || [])];
                                updatedLinks[li].label = e.target.value;
                                setTemplate({
                                  ...template,
                                  footerConfig: {
                                    ...template.footerConfig!,
                                    links: updatedLinks,
                                  },
                                });
                              }}
                              className="flex-1 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-medium"
                            />
                            <input
                              type="text"
                              value={lnk.url}
                              onChange={(e) => {
                                const updatedLinks = [...(template.footerConfig?.links || [])];
                                updatedLinks[li].url = e.target.value;
                                setTemplate({
                                  ...template,
                                  footerConfig: {
                                    ...template.footerConfig!,
                                    links: updatedLinks,
                                  },
                                });
                              }}
                              className="w-24 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-mono text-slate-500"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const updatedLinks = [...(template.footerConfig?.links || [])];
                                updatedLinks.splice(li, 1);
                                setTemplate({
                                  ...template,
                                  footerConfig: {
                                    ...template.footerConfig!,
                                    links: updatedLinks,
                                  },
                                });
                              }}
                              className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* If HEADER selected */}
                {selectedItem.type === "header" && template.headerConfig && (
                  <div className="space-y-4">
                    <MediaUploadField
                      label="Navbar Brand Logo"
                      value={template.headerConfig.logoUrl || "/logos/osa_logo.png"}
                      onChange={(val) =>
                        setTemplate({
                          ...template,
                          headerConfig: {
                            ...template.headerConfig!,
                            logoUrl: val,
                          },
                        })
                      }
                      placeholder="/logos/osa_logo.png"
                      type="image"
                      accept="image/*"
                      fieldKey="header_logo"
                    />

                    <div>
                      <label className="block font-semibold mb-1 text-slate-700">
                        Site Title (Optional if Logo has text)
                      </label>
                      <input
                        type="text"
                        value={template.headerConfig.siteTitle || ""}
                        onChange={(e) =>
                          setTemplate({
                            ...template,
                            headerConfig: {
                              ...template.headerConfig!,
                              siteTitle: e.target.value,
                            },
                          })
                        }
                        placeholder="Leave blank to only display logo"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-slate-700">
                        Header CTA Text
                      </label>
                      <input
                        type="text"
                        value={template.headerConfig.ctaButton?.text || ""}
                        onChange={(e) =>
                          setTemplate({
                            ...template,
                            headerConfig: {
                              ...template.headerConfig!,
                              ctaButton: {
                                ...(template.headerConfig?.ctaButton || {}),
                                text: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-slate-700">
                        Header CTA URL
                      </label>
                      <input
                        type="text"
                        value={template.headerConfig.ctaButton?.url || ""}
                        onChange={(e) =>
                          setTemplate({
                            ...template,
                            headerConfig: {
                              ...template.headerConfig!,
                              ctaButton: {
                                ...(template.headerConfig?.ctaButton || {}),
                                url: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Right: CLOSE EDITOR BUTTON */}
            <div className="p-4 border-t border-slate-200 bg-slate-50">
              <button
                type="button"
                onClick={() => setIsInspectorOpen(false)}
                className="w-full py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
              >
                Close Editor
              </button>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
