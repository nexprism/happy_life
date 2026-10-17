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
} from "lucide-react";
import toast from "react-hot-toast";

type ViewportMode = "desktop" | "tablet" | "mobile";

// 1. Sections Categories definition matching the user's screenshots
interface SectionCategory {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SECTION_CATEGORIES: SectionCategory[] = [
  { id: "headers", name: "Headers", icon: Compass },
  { id: "hero", name: "Hero Section", icon: Sidebar },
  { id: "assessment", name: "Assessment Exam", icon: LayoutGrid },
  { id: "ai_recommendations", name: "AI Recommendations", icon: LayoutGrid },
  { id: "counselor", name: "Counselor Match", icon: LayoutGrid },
  { id: "college_hub", name: "College Match Hub", icon: LayoutGrid },
  { id: "app_tracker", name: "Application Tracker", icon: LayoutGrid },
  { id: "admin_analytics", name: "Admin Analytics", icon: LayoutGrid },
  { id: "faq", name: "FAQ Accordion", icon: LayoutGrid },
  { id: "footers", name: "Footers", icon: PanelBottom },
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
        <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
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
                ? "w-full max-w-5xl"
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
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#2171B5] to-blue-600 flex items-center justify-center text-white font-black text-xs shadow-md shadow-blue-500/20">
                    HL
                  </div>
                  <span className="font-extrabold text-sm text-slate-900 tracking-tight">
                    {template.headerConfig.siteTitle || "Happy Life"}
                  </span>
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
                          ? "grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center"
                          : "w-full max-w-4xl mx-auto space-y-6"
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

                                {/* 4. ABOUT PREVIEW */}
                                {comp.type === "about" && (
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
                                )}

                                {/* 5. FEATURES PREVIEW */}
                                {comp.type === "features" && (
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

                                {/* 7. FAQ PREVIEW */}
                                {comp.type === "faq" && (
                                  <div className="space-y-3 text-left">
                                    <h4 className="font-bold text-base text-slate-900">
                                      {comp.content.title}
                                    </h4>
                                    <p className="text-xs text-slate-500">
                                      {comp.content.subtitle}
                                    </p>
                                    <div className="space-y-1.5">
                                      {(comp.content.faqs || []).map(
                                        (faq: any, fi: number) => (
                                          <div
                                            key={fi}
                                            className="p-3 border border-slate-200 bg-slate-50 rounded-xl text-xs space-y-1"
                                          >
                                            <span className="font-bold text-slate-800 block">
                                              Q: {faq.question}
                                            </span>
                                            <p className="text-[11px] text-slate-600">
                                              {faq.answer}
                                            </p>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* 8. CTA BANNER PREVIEW */}
                                {comp.type === "ctaBanner" && (
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
                      <label className="block font-semibold mb-1">Badge Tag</label>
                      <input
                        type="text"
                        value={activeComponent.content.badge || ""}
                        onChange={(e) =>
                          updateActiveComponentContent({ badge: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Headline</label>
                      <textarea
                        rows={2}
                        value={activeComponent.content.title || ""}
                        onChange={(e) =>
                          updateActiveComponentContent({ title: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Subtitle</label>
                      <textarea
                        rows={3}
                        value={activeComponent.content.subtitle || ""}
                        onChange={(e) =>
                          updateActiveComponentContent({ subtitle: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Button CTA</label>
                      <input
                        type="text"
                        value={activeComponent.content.ctaText || ""}
                        onChange={(e) =>
                          updateActiveComponentContent({ ctaText: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
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
                  <div className="space-y-3">
                    <div>
                      <label className="block font-semibold mb-1 text-slate-700">
                        Site Title
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
