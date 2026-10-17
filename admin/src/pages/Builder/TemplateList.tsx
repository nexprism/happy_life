import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  builderService,
  BuilderTemplate,
} from "../../services/builderService";
import {
  Plus,
  Edit3,
  Copy,
  Trash2,
  ExternalLink,
  Users,
  Eye,
  CheckCircle,
  AlertCircle,
  Layers,
  Search,
  Globe,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

export default function TemplateList() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<BuilderTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New template form state
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    slug: "",
    description: "",
    status: "draft" as "draft" | "published",
  });

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await builderService.getAllTemplates({
        search: search || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
      });
      if (res.success) {
        setTemplates(res.data || []);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to fetch templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTemplates();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplate.name.trim()) {
      toast.error("Template name is required");
      return;
    }

    try {
      setSubmitting(true);
      const res = await builderService.createTemplate(newTemplate);
      if (res.success) {
        toast.success("Template created successfully!");
        setIsModalOpen(false);
        setNewTemplate({ name: "", slug: "", description: "", status: "draft" });
        navigate(`/builder/templates/edit/${res.data._id}`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create template");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClone = async (id: string) => {
    try {
      const res = await builderService.cloneTemplate(id);
      if (res.success) {
        toast.success("Template cloned successfully!");
        fetchTemplates();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to clone template");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete template "${name}"?`)) {
      return;
    }

    try {
      const res = await builderService.deleteTemplate(id);
      if (res.success) {
        toast.success("Template deleted successfully");
        setTemplates((prev) => prev.filter((t) => t._id !== id));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete template");
    }
  };

  const copyPublicLink = (slug: string) => {
    const webBaseUrl =
      import.meta.env.VITE_WEB_URL ||
      window.location.origin.replace("5174", "5173").replace("admin.", "");
    const fullUrl = `${webBaseUrl}/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success("Public link copied to clipboard!");
  };

  const getPublicUrl = (slug: string) => {
    const webBaseUrl =
      import.meta.env.VITE_WEB_URL ||
      window.location.origin.replace("5174", "5173").replace("admin.", "");
    return `${webBaseUrl}/${slug}`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Layers className="w-7 h-7 text-blue-600" />
            Landing Page Builder
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Build responsive, high-converting landing pages with modular sections, lead forms, and instant slug publishing.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/builder/leads"
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            <Users className="w-4 h-4 text-emerald-600" />
            View Leads
          </Link>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Create Template
          </button>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-900 p-4 rounded-xl shadow-xs border border-gray-100 dark:border-gray-800">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates or slug..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-gray-500 uppercase">Status:</span>
          {(["all", "published", "draft"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition capitalize ${
                statusFilter === st
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Table / List */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xs border border-gray-100 dark:border-gray-800 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span>Loading builder templates...</span>
          </div>
        ) : templates.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400 space-y-4">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center mx-auto">
              <Layers className="w-8 h-8" />
            </div>
            <div>
              <p className="text-base font-semibold text-gray-800 dark:text-gray-200">
                No templates found
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Get started by creating your first landing page template.
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
            >
              <Plus className="w-4 h-4" />
              Create Template
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Template & Slug</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-center">Sections</th>
                  <th className="py-3.5 px-4 text-center">Leads Captured</th>
                  <th className="py-3.5 px-4 text-center">Views</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                {templates.map((tpl) => (
                  <tr
                    key={tpl._id}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition group"
                  >
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <Link
                          to={`/builder/templates/edit/${tpl._id}`}
                          className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition"
                        >
                          {tpl.name}
                        </Link>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <Globe className="w-3.5 h-3.5 text-blue-500" />
                          <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-700 dark:text-gray-300">
                            /{tpl.slug}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyPublicLink(tpl.slug)}
                            title="Copy Public URL"
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {tpl.status === "published" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center font-medium text-gray-700 dark:text-gray-300">
                      {tpl.sections?.length || 0}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Link
                        to={`/builder/leads?templateId=${tpl._id}`}
                        className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:underline"
                      >
                        <Users className="w-3.5 h-3.5" />
                        {tpl.leadsCount || 0}
                      </Link>
                    </td>
                    <td className="py-4 px-4 text-center text-gray-500 dark:text-gray-400 font-medium">
                      <span className="inline-flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {tpl.viewsCount || 0}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {tpl.status === "published" && (
                          <a
                            href={getPublicUrl(tpl.slug)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                            title="Open Published Page"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        <Link
                          to={`/builder/templates/edit/${tpl._id}`}
                          className="p-1.5 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                          title="Edit in Visual Builder"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleClone(tpl._id!)}
                          className="p-1.5 text-gray-500 hover:text-indigo-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                          title="Clone Template"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(tpl._id!, tpl.name)}
                          className="p-1.5 text-gray-500 hover:text-red-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                          title="Delete Template"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Template Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                Create Landing Page
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-gray-300 mb-1">
                  Template Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fullstack Web Dev Bootcamp"
                  value={newTemplate.name}
                  onChange={(e) =>
                    setNewTemplate({ ...newTemplate, name: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-gray-300 mb-1">
                  Custom Slug (Optional)
                </label>
                <div className="flex items-center rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 px-3 text-sm text-gray-500">
                  <span>/</span>
                  <input
                    type="text"
                    placeholder="fullstack-bootcamp (auto-generated if empty)"
                    value={newTemplate.slug}
                    onChange={(e) =>
                      setNewTemplate({ ...newTemplate, slug: e.target.value })
                    }
                    className="w-full px-2 py-2.5 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Leaves empty to automatically generate from name.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-gray-300 mb-1">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Internal notes or description for this campaign..."
                  value={newTemplate.description}
                  onChange={(e) =>
                    setNewTemplate({ ...newTemplate, description: e.target.value })
                  }
                  className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create & Launch Builder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
