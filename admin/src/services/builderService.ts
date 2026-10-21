import axiosInstance from "./axiosConfig";

export interface ComponentItem {
  id: string;
  type:
    | "hero"
    | "about"
    | "leadForm"
    | "features"
    | "stats"
    | "testimonials"
    | "faq"
    | "ctaBanner"
    | "customHtml"
    | "video"
    | "image";
  content: Record<string, any>;
}

export interface ColumnItem {
  id: string;
  width?: string;
  components: ComponentItem[];
}

export interface SectionItem {
  id: string;
  name: string;
  layout: "1-column" | "2-column";
  backgroundColor: string;
  textColor?: string;
  paddingY?: "sm" | "md" | "lg" | "xl";
  maxWidth?: "4xl" | "5xl" | "6xl" | "7xl" | "full" | string;
  columns: ColumnItem[];
}

export interface BuilderTemplate {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  status: "draft" | "published" | "archived";
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
    ogImage?: string;
  };
  headerConfig?: {
    enabled: boolean;
    logoUrl?: string;
    siteTitle?: string;
    navLinks?: { label: string; url: string }[];
    ctaButton?: { text: string; url: string; variant?: string };
    shadowIntensity?: number;
  };
  footerConfig?: {
    enabled: boolean;
    templateStyle?: number;
    headline?: string;
    tagline?: string;
    brandBio?: string;
    newsletterHeading?: string;
    newsletterSubheading?: string;
    contactPhone?: string;
    contactEmail?: string;
    backgroundColor?: string;
    textColor?: string;
    copyrightText?: string;
    links?: { label: string; url: string }[];
    socialLinks?: {
      facebook?: string;
      instagram?: string;
      linkedin?: string;
      twitter?: string;
      youtube?: string;
    };
  };
  sections: SectionItem[];
  customCss?: string;
  viewsCount?: number;
  leadsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface BuilderLead {
  _id: string;
  templateId: { _id: string; name: string; slug: string } | string;
  templateSlug: string;
  name: string;
  email: string;
  phone: string;
  notes?: string;
  extraFields?: Record<string, any>;
  status: "new" | "contacted" | "converted" | "closed";
  ipAddress?: string;
  createdAt: string;
}

export const builderService = {
  // Templates
  getAllTemplates: async (params?: { page?: number; limit?: number; search?: string; status?: string }) => {
    const res = await axiosInstance.get("/builder/templates", { params });
    return res.data;
  },

  getTemplateById: async (id: string) => {
    const res = await axiosInstance.get(`/builder/templates/${id}`);
    return res.data;
  },

  createTemplate: async (data: Partial<BuilderTemplate>) => {
    const res = await axiosInstance.post("/builder/templates", data);
    return res.data;
  },

  updateTemplate: async (id: string, data: Partial<BuilderTemplate>) => {
    const res = await axiosInstance.put(`/builder/templates/${id}`, data);
    return res.data;
  },

  deleteTemplate: async (id: string) => {
    const res = await axiosInstance.delete(`/builder/templates/${id}`);
    return res.data;
  },

  cloneTemplate: async (id: string) => {
    const res = await axiosInstance.post(`/builder/templates/${id}/clone`);
    return res.data;
  },

  // Leads
  getAllLeads: async (params?: { page?: number; limit?: number; templateId?: string; status?: string; search?: string }) => {
    const res = await axiosInstance.get("/builder/leads", { params });
    return res.data;
  },

  updateLeadStatus: async (id: string, status: string) => {
    const res = await axiosInstance.put(`/builder/leads/${id}/status`, { status });
    return res.data;
  },

  deleteLead: async (id: string) => {
    const res = await axiosInstance.delete(`/builder/leads/${id}`);
    return res.data;
  },

  exportLeadsCsv: async (templateId?: string) => {
    const res = await axiosInstance.get("/builder/leads/export", {
      params: { templateId },
      responseType: "blob",
    });
    return res.data;
  },

  // Media Upload (Image & Video)
  uploadMedia: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await axiosInstance.post("/builder/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
};
