import builderService from "../service/builderService.js";

// Public: Get published template by slug
export const getPublicTemplate = async (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug) {
      return res.status(400).json({ success: false, message: "Slug is required" });
    }

    const template = await builderService.getPublishedTemplateBySlug(slug.toLowerCase().trim());
    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Landing page not found or is currently unavailable.",
      });
    }

    return res.status(200).json({
      success: true,
      data: template,
    });
  } catch (error) {
    console.error("❌ Error fetching public template:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Public: Submit lead form from template
export const submitLead = async (req, res) => {
  try {
    const { slug } = req.params;
    const reqInfo = {
      ip: req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "",
      userAgent: req.headers["user-agent"] || "",
    };

    const lead = await builderService.submitLead(slug, req.body, reqInfo);
    return res.status(201).json({
      success: true,
      message: "Lead submitted successfully",
      data: lead,
    });
  } catch (error) {
    console.error("❌ Error submitting lead:", error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

// Admin: Create Template
export const createTemplate = async (req, res) => {
  try {
    const userId = req.user?._id;
    const template = await builderService.createTemplate(req.body, userId);
    return res.status(201).json({
      success: true,
      message: "Template created successfully",
      data: template,
    });
  } catch (error) {
    console.error("❌ Error creating template:", error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

// Admin: Get all templates
export const getAllTemplates = async (req, res) => {
  try {
    const { page = 1, limit = 50, search, status } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
      ];
    }

    const result = await builderService.getAllTemplates(
      filter,
      { updatedAt: -1 },
      Number(page),
      Number(limit)
    );

    return res.status(200).json({
      success: true,
      data: result.data,
      total: result.total,
      page: Number(page),
      totalPages: Math.ceil(result.total / Number(limit)),
    });
  } catch (error) {
    console.error("❌ Error fetching templates:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Get template by ID
export const getTemplateById = async (req, res) => {
  try {
    const template = await builderService.getTemplateById(req.params.id);
    if (!template) {
      return res.status(404).json({ success: false, message: "Template not found" });
    }
    return res.status(200).json({ success: true, data: template });
  } catch (error) {
    console.error("❌ Error fetching template:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Update template
export const updateTemplate = async (req, res) => {
  try {
    const template = await builderService.updateTemplate(req.params.id, req.body);
    return res.status(200).json({
      success: true,
      message: "Template updated successfully",
      data: template,
    });
  } catch (error) {
    console.error("❌ Error updating template:", error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

// Admin: Delete template
export const deleteTemplate = async (req, res) => {
  try {
    await builderService.deleteTemplate(req.params.id);
    return res.status(200).json({
      success: true,
      message: "Template deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting template:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Clone template
export const cloneTemplate = async (req, res) => {
  try {
    const userId = req.user?._id;
    const cloned = await builderService.cloneTemplate(req.params.id, userId);
    return res.status(201).json({
      success: true,
      message: "Template cloned successfully",
      data: cloned,
    });
  } catch (error) {
    console.error("❌ Error cloning template:", error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

// Admin: Get all leads
export const getAllLeads = async (req, res) => {
  try {
    const { page = 1, limit = 50, templateId, status, search } = req.query;
    const filter = {};

    if (templateId) filter.templateId = templateId;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const result = await builderService.getAllLeads(
      filter,
      { createdAt: -1 },
      Number(page),
      Number(limit)
    );

    return res.status(200).json({
      success: true,
      data: result.data,
      total: result.total,
      page: Number(page),
      totalPages: Math.ceil(result.total / Number(limit)),
    });
  } catch (error) {
    console.error("❌ Error fetching leads:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Update lead status
export const updateLeadStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const lead = await builderService.updateLeadStatus(req.params.id, status);
    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }
    return res.status(200).json({
      success: true,
      message: "Lead status updated successfully",
      data: lead,
    });
  } catch (error) {
    console.error("❌ Error updating lead status:", error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

// Admin: Delete lead
export const deleteLead = async (req, res) => {
  try {
    await builderService.deleteLead(req.params.id);
    return res.status(200).json({
      success: true,
      message: "Lead deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting lead:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Export leads CSV
export const exportLeadsCsv = async (req, res) => {
  try {
    const { templateId } = req.query;
    const filter = {};
    if (templateId) filter.templateId = templateId;

    const result = await builderService.getAllLeads(filter, { createdAt: -1 }, 1, 5000);
    const leads = result.data || [];

    const headers = ["ID", "Template Name", "Slug", "Name", "Email", "Phone", "Notes", "Status", "Date"];
    const rows = leads.map((l) => [
      l._id,
      `"${(l.templateId?.name || "").replace(/"/g, '""')}"`,
      l.templateSlug,
      `"${(l.name || "").replace(/"/g, '""')}"`,
      l.email,
      `"${l.phone}"`,
      `"${(l.notes || "").replace(/"/g, '""')}"`,
      l.status,
      new Date(l.createdAt).toISOString(),
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="leads_export.csv"');
    return res.status(200).send(csvContent);
  } catch (error) {
    console.error("❌ Error exporting leads:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Upload Media (Images / Videos) for Builder
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;
    return res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      url: fileUrl,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });
  } catch (error) {
    console.error("❌ Error uploading file in builder:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
