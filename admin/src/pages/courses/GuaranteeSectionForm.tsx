import React from "react";
import { ShieldCheck, Sparkles, HelpCircle } from "lucide-react";

export interface GuaranteeSectionData {
  show?: boolean;
  tagline?: string;
  title?: string;
  highlightText?: string;
  titleSuffix?: string;
  description?: string;
  point1Title?: string;
  point1Description?: string;
  point2Title?: string;
  point2Description?: string;
  circleWord1?: string;
  circleWord2?: string;
  circleFooter?: string;
}

interface GuaranteeSectionFormProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

const defaultGuarantee: GuaranteeSectionData = {
  show: true,
  tagline: "Verified / Security Protocol",
  title: "The 30-Day",
  highlightText: "Integrity",
  titleSuffix: "Protocol.",
  description:
    "As with any High-Yield investment, risk is a variable. However, if you Execute the blueprint and possess an operative product—we eliminate the friction. We guarantee Stability & Predictability within 30 days.",
  point1Title: "System Refund Path",
  point1Description:
    "Initiate support via happylifereport@gmail.com for any inquiries.",
  point2Title: "Response Speed",
  point2Description:
    "Total protocol reversion within 48 Hours of verified log ingestion.",
  circleWord1: "100",
  circleWord2: "Guarantee",
  circleFooter: "Vanguard protocol A-01",
};

const GuaranteeSectionForm: React.FC<GuaranteeSectionFormProps> = ({
  formData,
  setFormData,
}) => {
  const guarantee: GuaranteeSectionData = {
    ...defaultGuarantee,
    ...(formData.guaranteeSection || {}),
  };

  const updateField = (field: keyof GuaranteeSectionData, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      guaranteeSection: {
        ...defaultGuarantee,
        ...(prev.guaranteeSection || {}),
        [field]: value,
      },
    }));
  };

  // Helper to ensure Word 1 is strictly single-word (no spaces)
  const handleWord1Change = (val: string) => {
    const singleWord = val.trim().split(/\s+/)[0] || "";
    updateField("circleWord1", singleWord);
  };

  // Helper to ensure Word 2 is strictly single-word (no spaces)
  const handleWord2Change = (val: string) => {
    const singleWord = val.trim().split(/\s+/)[0] || "";
    updateField("circleWord2", singleWord);
  };

  return (
    <div className="space-y-8">
      {/* Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800/80 rounded-xl border border-blue-100 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600 text-white rounded-xl shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              Guarantee Protocol Customization
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-medium">
                Individual Course
              </span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Customize the verified security protocol, guarantee text, and rotating circular seal for this course.
            </p>
          </div>
        </div>

        {/* Section Visibility Switch */}
        <div className="flex items-center gap-3 bg-white dark:bg-gray-900 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <label
            htmlFor="guarantee-toggle"
            className="text-xs font-semibold text-gray-700 dark:text-gray-200 cursor-pointer"
          >
            Show Section on Course Page
          </label>
          <input
            id="guarantee-toggle"
            type="checkbox"
            checked={guarantee.show !== false}
            onChange={(e) => updateField("show", e.target.checked)}
            className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
          />
        </div>
      </div>

      {guarantee.show !== false ? (
        <div className="space-y-6">
          {/* 1. Protocol Badge / Tagline */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-2 dark:border-gray-700">
              <label className="text-xs uppercase tracking-wider font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-500" />
                Protocol Tagline / Header Badge
              </label>
            </div>
            <div>
              <input
                type="text"
                value={guarantee.tagline || ""}
                onChange={(e) => updateField("tagline", e.target.value)}
                placeholder="e.g. Verified / Security Protocol"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm dark:bg-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Displays with the small accent line at the very top of the protocol card.
              </p>
            </div>
          </div>

          {/* 2. Main Heading */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
            <div className="border-b pb-2 dark:border-gray-700">
              <label className="text-xs uppercase tracking-wider font-bold text-gray-700 dark:text-gray-300">
                Main Headline
              </label>
              <p className="text-[11px] text-gray-400">
                Structured in 3 parts for highlighting: Line 1, Highlight Word, and Suffix.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Line 1 Title
                </label>
                <input
                  type="text"
                  value={guarantee.title || ""}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="e.g. The 30-Day"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">
                  Highlight Word (Accent)
                </label>
                <input
                  type="text"
                  value={guarantee.highlightText || ""}
                  onChange={(e) => updateField("highlightText", e.target.value)}
                  placeholder="e.g. Integrity"
                  className="w-full border border-blue-300 dark:border-blue-700 rounded-lg px-3 py-2 text-sm dark:bg-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Heading Suffix
                </label>
                <input
                  type="text"
                  value={guarantee.titleSuffix || ""}
                  onChange={(e) => updateField("titleSuffix", e.target.value)}
                  placeholder="e.g. Protocol."
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* 3. Description / Protocol Statement */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
            <div className="border-b pb-2 dark:border-gray-700">
              <label className="text-xs uppercase tracking-wider font-bold text-gray-700 dark:text-gray-300">
                Protocol Statement / Description
              </label>
            </div>
            <div>
              <textarea
                rows={4}
                value={guarantee.description || ""}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Enter the full guarantee protocol copy..."
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-sm dark:bg-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 leading-relaxed"
              />
            </div>
          </div>

          {/* 4. Bottom Information Columns */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
            <div className="border-b pb-2 dark:border-gray-700">
              <label className="text-xs uppercase tracking-wider font-bold text-gray-700 dark:text-gray-300">
                Support & Reversion Protocols (Two Bottom Columns)
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Column 1 */}
              <div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-700">
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  Column 1 (Left)
                </span>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Title</label>
                  <input
                    type="text"
                    value={guarantee.point1Title || ""}
                    onChange={(e) => updateField("point1Title", e.target.value)}
                    placeholder="e.g. System Refund Path"
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-xs dark:bg-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={guarantee.point1Description || ""}
                    onChange={(e) => updateField("point1Description", e.target.value)}
                    placeholder="e.g. Initiate support via happylifereport@gmail.com for any inquiries."
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-xs dark:bg-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              {/* Column 2 */}
              <div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-700">
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  Column 2 (Right)
                </span>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Title</label>
                  <input
                    type="text"
                    value={guarantee.point2Title || ""}
                    onChange={(e) => updateField("point2Title", e.target.value)}
                    placeholder="e.g. Response Speed"
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-xs dark:bg-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={guarantee.point2Description || ""}
                    onChange={(e) => updateField("point2Description", e.target.value)}
                    placeholder="e.g. Total protocol reversion within 48 Hours of verified log ingestion."
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-xs dark:bg-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 5. Circular Seal / Art Customization */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
            <div className="border-b pb-2 dark:border-gray-700 flex items-center justify-between">
              <label className="text-xs uppercase tracking-wider font-bold text-gray-700 dark:text-gray-300">
                Circular Seal / Art (Max 2 Words)
              </label>
              <div className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Word 2 always displays below Word 1</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Word 1 (Top / Large)
                </label>
                <input
                  type="text"
                  value={guarantee.circleWord1 || ""}
                  onChange={(e) => handleWord1Change(e.target.value)}
                  placeholder="e.g. 100 or 100%"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 font-bold"
                />
                <p className="text-[10px] text-gray-400 mt-1">Single word or number/percentage</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Word 2 (Bottom / Subtitle)
                </label>
                <input
                  type="text"
                  value={guarantee.circleWord2 || ""}
                  onChange={(e) => handleWord2Change(e.target.value)}
                  placeholder="e.g. Guarantee"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 font-bold uppercase"
                />
                <p className="text-[10px] text-gray-400 mt-1">Comes directly below Word 1</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Seal Footer Sub-Label
              </label>
              <input
                type="text"
                value={guarantee.circleFooter || ""}
                onChange={(e) => updateField("circleFooter", e.target.value)}
                placeholder="e.g. Vanguard protocol A-01"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-xs dark:bg-gray-900 dark:text-gray-100 uppercase"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
          <ShieldCheck className="w-10 h-10 text-gray-400 mx-auto mb-2 opacity-50" />
          <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
            Guarantee Protocol Section is currently disabled for this course.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Toggle &quot;Show Section on Course Page&quot; above to re-enable and customize it.
          </p>
        </div>
      )}
    </div>
  );
};

export default GuaranteeSectionForm;
