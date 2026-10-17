import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  builderService,
  BuilderLead,
  BuilderTemplate,
} from "../../services/builderService";
import {
  Users,
  Search,
  Download,
  Trash2,
  Calendar,
  Mail,
  Phone,
  Globe,
  Loader2,
  ArrowLeft,
  Filter,
  CheckCircle2,
  Clock,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";

export default function LeadsList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const templateIdParam = searchParams.get("templateId") || "";

  const [leads, setLeads] = useState<BuilderLead[]>([]);
  const [templates, setTemplates] = useState<BuilderTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTemplate, setSelectedTemplate] = useState(templateIdParam);
  const [selectedLead, setSelectedLead] = useState<BuilderLead | null>(null);

  // Fetch templates for filter dropdown
  useEffect(() => {
    const fetchTpls = async () => {
      try {
        const res = await builderService.getAllTemplates({ limit: 100 });
        if (res.success) setTemplates(res.data || []);
      } catch (e) {}
    };
    fetchTpls();
  }, []);

  // Fetch leads
  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await builderService.getAllLeads({
        search: search || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        templateId: selectedTemplate || undefined,
      });
      if (res.success) {
        setLeads(res.data || []);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to fetch leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [selectedTemplate, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLeads();
  };

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      const res = await builderService.updateLeadStatus(leadId, newStatus);
      if (res.success) {
        toast.success("Lead status updated");
        setLeads((prev) =>
          prev.map((l) => (l._id === leadId ? { ...l, status: newStatus as any } : l))
        );
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleDelete = async (leadId: string) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;
    try {
      const res = await builderService.deleteLead(leadId);
      if (res.success) {
        toast.success("Lead deleted");
        setLeads((prev) => prev.filter((l) => l._id !== leadId));
        if (selectedLead?._id === leadId) setSelectedLead(null);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete lead");
    }
  };

  const handleExport = async () => {
    try {
      const blob = await builderService.exportLeadsCsv(selectedTemplate || undefined);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `leads_export_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.success("Leads exported to CSV!");
    } catch (err: any) {
      toast.error("Failed to export leads");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "converted":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
            <CheckCircle2 className="w-3 h-3" /> Converted
          </span>
        );
      case "contacted":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400">
            <Clock className="w-3 h-3" /> Contacted
          </span>
        );
      case "closed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400">
            Closed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400">
            New Lead
          </span>
        );
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Link
              to="/builder/templates"
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              title="Back to Templates"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="w-7 h-7 text-emerald-600" />
              Captured Leads
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage inquiries, contact information, and consultation requests captured across your landing pages.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium shadow-sm transition"
        >
          <Download className="w-4 h-4" />
          Export to CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-900 p-4 rounded-xl shadow-xs border border-gray-100 dark:border-gray-800">
        <form onSubmit={handleSearchSubmit} className="relative w-full lg:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Template dropdown filter */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Filter className="w-3.5 h-3.5" />
            <select
              value={selectedTemplate}
              onChange={(e) => {
                setSelectedTemplate(e.target.value);
                setSearchParams(e.target.value ? { templateId: e.target.value } : {});
              }}
              className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
            >
              <option value="">All Templates</option>
              {templates.map((tpl) => (
                <option key={tpl._id} value={tpl._id}>
                  {tpl.name} (/{tpl.slug})
                </option>
              ))}
            </select>
          </div>

          {/* Status buttons */}
          <div className="flex items-center gap-1">
            {(["all", "new", "contacted", "converted", "closed"] as const).map(
              (st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition capitalize ${
                    statusFilter === st
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {st}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xs border border-gray-100 dark:border-gray-800 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <span>Loading leads...</span>
          </div>
        ) : leads.length === 0 ? (
          <div className="p-12 text-center text-gray-500 space-y-3">
            <Users className="w-12 h-12 text-gray-300 mx-auto" />
            <p className="font-semibold text-gray-700 dark:text-gray-300">
              No leads found
            </p>
            <p className="text-xs text-gray-400">
              Leads captured via your landing page forms will appear here in real time.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Lead Contact</th>
                  <th className="py-3.5 px-4">Landing Page Template</th>
                  <th className="py-3.5 px-4">Source / Referral</th>
                  <th className="py-3.5 px-4">Notes / Query</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                {leads.map((lead) => (
                  <tr
                    key={lead._id}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition cursor-pointer"
                    onClick={() => setSelectedLead(lead)}
                  >
                    <td className="py-4 px-6">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {lead.name}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-gray-400" />
                          {lead.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-gray-400" />
                          {lead.phone}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-medium text-gray-800 dark:text-gray-200">
                        {typeof lead.templateId === "object"
                          ? lead.templateId?.name
                          : "Template"}
                      </span>
                      <div className="text-xs text-gray-400 font-mono">
                        /{lead.templateSlug}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs">
                      {lead.extraFields?.source ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          {lead.extraFields.source}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-xs text-gray-600 dark:text-gray-400 max-w-[200px] truncate">
                      {lead.notes || "-"}
                    </td>
                    <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                        className="text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 font-medium text-gray-700 dark:text-gray-200 focus:outline-none"
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="converted">Converted</option>
                        <option value="closed">Closed</option>
                      </select>
                    </td>
                    <td className="py-4 px-4 text-xs text-gray-500">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleDelete(lead._id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                        title="Delete Lead"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspect Lead Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                Lead Details
              </h3>
              <button
                onClick={() => setSelectedLead(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg font-bold"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3 bg-gray-50 dark:bg-gray-800/60 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                <div>
                  <span className="text-xs text-gray-400 uppercase font-semibold">Name</span>
                  <p className="font-bold text-gray-900 dark:text-white">{selectedLead.name}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-400 uppercase font-semibold">Status</span>
                  <div>{getStatusBadge(selectedLead.status)}</div>
                </div>
                <div>
                  <span className="text-xs text-gray-400 uppercase font-semibold">Email</span>
                  <p className="font-mono text-xs">{selectedLead.email}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-400 uppercase font-semibold">Phone</span>
                  <p className="font-mono text-xs">{selectedLead.phone}</p>
                </div>
              </div>

              <div>
                <span className="text-xs text-gray-400 uppercase font-semibold">Landing Page</span>
                <p className="font-medium text-gray-800 dark:text-gray-200">
                  {typeof selectedLead.templateId === "object"
                    ? selectedLead.templateId?.name
                    : "Template"}{" "}
                  <span className="text-xs text-blue-600 font-mono">
                    (/{selectedLead.templateSlug})
                  </span>
                </p>
              </div>

              {selectedLead.notes && (
                <div>
                  <span className="text-xs text-gray-400 uppercase font-semibold">Query / Notes</span>
                  <p className="bg-gray-50 dark:bg-gray-800/60 p-3 rounded-lg text-xs text-gray-700 dark:text-gray-300">
                    {selectedLead.notes}
                  </p>
                </div>
              )}

              {selectedLead.extraFields && Object.keys(selectedLead.extraFields).length > 0 && (
                <div>
                  <span className="text-xs text-gray-400 uppercase font-semibold">
                    Dynamic Form Fields / Answers
                  </span>
                  <div className="mt-1 bg-gray-50 dark:bg-gray-800/60 p-3 rounded-lg border border-gray-100 dark:border-gray-800 space-y-1.5">
                    {Object.entries(selectedLead.extraFields).map(([key, val]) => (
                      <div key={key} className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-gray-500 capitalize">{key.replace(/_/g, " ")}:</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center text-xs text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
                <span>Captured: {new Date(selectedLead.createdAt).toLocaleString()}</span>
                {selectedLead.ipAddress && <span>IP: {selectedLead.ipAddress}</span>}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLead(null)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
