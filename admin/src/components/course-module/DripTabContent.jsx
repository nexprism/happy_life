import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ChevronDown,
  ChevronRight,
  Eye,
  Zap,
  Settings,
  X,
  Loader2,
  AlertCircle,
  BookOpen,
  Play,
  FileText,
  HelpCircle,
  ClipboardList,
  Clock,
  Users,
  Lock,
  Smartphone,
  Monitor,
} from "lucide-react";
import { fetchCourseById } from "../../store/slices/course";
import { updateLessonMobileOnly } from "../../store/slices/lesson";
import { fetchDripRules, fetchCourseContents } from "../../store/slices/drip";
import axiosInstance from "../../services/axiosConfig";
import DripPopup from "./DripPopup";
import PopupAlert from "../popUpAlert";

const CourseAccordion = ({ courseId }) => {
  const dispatch = useDispatch();
  const {
    loading,
    error,
    data: courseData,
  } = useSelector((state) => state.course);
  const { loading: lessonLoading } = useSelector((state) => state.lesson);
  const { token } = useSelector((state) => state.auth);

  const [expandedModules, setExpandedModules] = useState(new Set());
  const [modalData, setModalData] = useState(null);
  const [modules, setModules] = useState([]);
  const [dripModalData, setDripModalData] = useState(null);
  const [dripPopupKey, setDripPopupKey] = useState(0);
  const [savingSettings, setSavingSettings] = useState(false);
  const [popup, setPopup] = useState({ isVisible: false, message: "", type: "" });
  const [moduleDripModal, setModuleDripModal] = useState(null);

  // ── Bulk selection state ──────────────────────────────────────────────────
  // selectedLessons: { [moduleId]: Set<lessonId> }
  const [selectedLessons, setSelectedLessons] = useState({});
  const [bulkSaving, setBulkSaving] = useState(false);

  // Count total selected lessons across all modules
  const totalSelected = Object.values(selectedLessons).reduce(
    (sum, set) => sum + set.size,
    0
  );

  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (courseId) {
      dispatch(fetchCourseById({ courseId }));
      fetchDemoData();
    }
  }, [courseId, dispatch]);

  useEffect(() => {
    if (courseData?.modules) {
      setModules(courseData.modules);
    } else if (courseData) {
      setModules(courseData.data?.modules || []);
    }
  }, [courseData]);

  const fetchDemoData = () => {};

  const toggleModule = (moduleId) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const openModal = (type, lesson, module) => {
    setModalData({ type, lesson, module });
  };

  const closeModal = () => {
    setModalData(null);
  };

  // ── Checkbox helpers ──────────────────────────────────────────────────────

  const getLessonSet = (moduleId) =>
    selectedLessons[moduleId] || new Set();

  const isLessonChecked = (moduleId, lessonId) =>
    getLessonSet(moduleId).has(lessonId);

  const isModuleAllChecked = (module) => {
    const mid = module.id || module._id;
    const set = getLessonSet(mid);
    return module.lessons?.length > 0 && set.size === module.lessons.length;
  };

  const isModuleIndeterminate = (module) => {
    const mid = module.id || module._id;
    const set = getLessonSet(mid);
    return set.size > 0 && set.size < (module.lessons?.length || 0);
  };

  const toggleLesson = (moduleId, lessonId) => {
    setSelectedLessons((prev) => {
      const set = new Set(prev[moduleId] || []);
      if (set.has(lessonId)) set.delete(lessonId);
      else set.add(lessonId);
      return { ...prev, [moduleId]: set };
    });
  };

  const toggleModuleAll = (module) => {
    const mid = module.id || module._id;
    const allIds = (module.lessons || []).map((l) => l.id || l._id);
    const set = getLessonSet(mid);
    const allChecked = set.size === allIds.length;
    setSelectedLessons((prev) => ({
      ...prev,
      [mid]: allChecked ? new Set() : new Set(allIds),
    }));
  };

  // ── Bulk visibility change ────────────────────────────────────────────────

  const handleBulkVisibility = async (platform) => {
    // Collect all selected lesson IDs across all modules
    const allSelectedIds = [];
    Object.entries(selectedLessons).forEach(([moduleId, set]) => {
      set.forEach((lessonId) => allSelectedIds.push({ lessonId, moduleId }));
    });

    if (allSelectedIds.length === 0) return;
    setBulkSaving(true);

    const ismobileOnly = platform === "phone";

    try {
      // Fire all updates in parallel
      await Promise.all(
        allSelectedIds.map(({ lessonId }) =>
          dispatch(updateLessonMobileOnly({ lessonId, ismobileOnly, token })).unwrap()
        )
      );

      // Update local state
      setModules((prev) =>
        prev.map((module) => {
          const mid = module.id || module._id;
          const set = selectedLessons[mid];
          if (!set || set.size === 0) return module;
          return {
            ...module,
            lessons: module.lessons.map((lesson) => {
              const lid = lesson.id || lesson._id;
              if (!set.has(lid)) return lesson;
              return {
                ...lesson,
                ismobileOnly,
                accessSettings: { platform },
              };
            }),
          };
        })
      );

      // Clear selection
      setSelectedLessons({});
      setPopup({
        isVisible: true,
        message: `${allSelectedIds.length} lesson(s) updated to "${
          ismobileOnly ? "Phone Only" : "Web & App Both"
        }" successfully!`,
        type: "success",
      });
    } catch (err) {
      setPopup({
        isVisible: true,
        message: `Failed to update lessons: ${err.message || err}`,
        type: "error",
      });
    } finally {
      setBulkSaving(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────

  const handleAccessSettingsSave = async (lessonId, moduleId, settings) => {
    try {
      setSavingSettings(true);
      const ismobileOnly = settings.platform === "phone";
      const result = await dispatch(
        updateLessonMobileOnly({ lessonId, ismobileOnly, token })
      ).unwrap();

      const updatedModules = modules.map((module) => {
        if (module.id === moduleId || module._id === moduleId) {
          return {
            ...module,
            lessons: module.lessons.map((lesson) => {
              if (lesson.id === lessonId || lesson._id === lessonId) {
                return { ...lesson, accessSettings: settings, ismobileOnly };
              }
              return lesson;
            }),
          };
        }
        return module;
      });

      setModules(updatedModules);
      closeModal();
      setPopup({ isVisible: true, message: "Lesson settings updated successfully!", type: "success" });
    } catch (error) {
      setPopup({ isVisible: true, message: `Failed to update lesson settings: ${error.message || error}`, type: "error" });
    } finally {
      setSavingSettings(false);
    }
  };

  const refreshDripRulesForTarget = async (targetId) => {
    try {
      await axiosInstance.get(`/drip/drip-rules/by-reference/${targetId}`);
    } catch (e) {}
  };

  const handleDripSettings = (lessonId, moduleId) => {
    const module = modules.find((m) => m.id === moduleId || m._id === moduleId);
    const lesson = module?.lessons?.find((l) => l.id === lessonId || l._id === lessonId);
    setDripModalData({ lessonId, moduleId, lesson, module, targetType: "lesson", targetId: lessonId });
    setDripPopupKey((prev) => prev + 1);
  };

  const closeDripModal = () => setDripModalData(null);

  const handleDripSubmit = async (dripSettings, result) => {
    if (result) {
      setPopup({ isVisible: true, message: "Drip settings saved successfully!", type: "success" });
      if (dripSettings?.targetId) await refreshDripRulesForTarget(dripSettings.targetId);
      await dispatch(fetchCourseContents());
      closeDripModal();
    } else {
      setPopup({ isVisible: true, message: "Failed to save drip settings. Please try again.", type: "error" });
    }
  };

  const handleLessonSettings = (lessonId, moduleId) => {};

  const getLessonTypeIcon = (type) => {
    switch (type) {
      case "video": return <Play className="w-4 h-4" />;
      case "text": return <FileText className="w-4 h-4" />;
      case "quiz": return <HelpCircle className="w-4 h-4" />;
      case "assignment": return <ClipboardList className="w-4 h-4" />;
      default: return <Play className="w-4 h-4" />;
    }
  };

  const getTotalStats = () => {
    const totalLessons = modules.reduce((sum, module) => sum + (module.lessons?.length || 0), 0);
    const completedLessons = modules.reduce(
      (sum, module) => sum + (module.lessons?.filter((lesson) => lesson.isCompleted).length || 0), 0
    );
    return { totalLessons, completedLessons };
  };

  const { totalLessons, completedLessons } = getTotalStats();

  const handleAddDrip = (module) => {
    setPopup({ isVisible: false, message: "", type: "" });
    setModuleDripModal({
      moduleId: module.id || module._id,
      lessons: module.lessons || [],
      targetType: "lesson",
      targetId: (module.lessons || []).map((l) => l.id || l._id),
      module,
    });
  };

  if (loading) {
    return (
      <div className="max-w-full mx-auto min-h-fit">
        <div className="bg-white dark:bg-white/[0.03] rounded-lg shadow-lg border border-blue-100 p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
            <span className="text-gray-600 dark:text-white/70 text-lg">Loading course content...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-full dark:bg-white/[0.03] mx-auto min-h-fit">
        <div className="bg-white dark:bg-white/[0.03] rounded-lg shadow-lg border border-red-100 p-8">
          <div className="flex items-center justify-center text-red-600">
            <AlertCircle className="w-8 h-8 mr-3" />
            <div>
              <h3 className="text-lg font-semibold">Error Loading Course</h3>
              <p className="text-sm mt-1">{error.message || error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!modules || modules.length === 0) {
    return (
      <div className="max-w-full mx-auto min-h-fit">
        <div className="bg-white dark:bg-white/[0.03] rounded-lg shadow-lg border border-gray-100 p-8">
          <div className="text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white/90 mb-2">No Content Available</h3>
            <p className="text-gray-600">This course doesn't have any modules yet.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-full mx-auto min-h-fit">
        {/* Course Stats Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-white/[0.03] dark:to-white/[0.03] rounded-lg border border-blue-100 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-white/90">Total Modules</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white/90">{modules.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Course Modules */}
        <div className="bg-white dark:bg-white/[0.03] rounded-lg shadow-lg border border-blue-100">
          <div className="divide-y divide-blue-100">
            {modules.map((module) => {
              const moduleId = module.id || module._id;
              const allChecked = isModuleAllChecked(module);
              const indeterminate = isModuleIndeterminate(module);
              const moduleSelectedCount = getLessonSet(moduleId).size;

              return (
                <div key={moduleId} className="bg-white dark:bg-white/[0.03]">
                  {/* Module Header */}
                  <div
                    className="flex sm:flex-row items-center sm:items-center justify-between gap-4 p-4 hover:bg-blue-50 dark:hover:bg-white/[0.06] cursor-pointer transition-all duration-200"
                    onClick={() => toggleModule(moduleId)}
                  >
                    <div className="flex items-center space-x-3">
                      {/* ── Module select-all checkbox ── */}
                      <input
                        type="checkbox"
                        id={`module-check-${moduleId}`}
                        checked={allChecked}
                        ref={(el) => {
                          if (el) el.indeterminate = indeterminate;
                        }}
                        onChange={() => toggleModuleAll(module)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 rounded border-gray-300 text-purple-600 accent-purple-600 cursor-pointer shrink-0"
                        title="Select all lessons in this module"
                      />

                      <div className="transition-transform duration-300 ease-in-out">
                        {expandedModules.has(moduleId) ? (
                          <ChevronDown className="w-5 h-5 text-blue-600" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white/90">
                          {module.title || module.name}
                        </h3>
                        {module.description && (
                          <p className="text-sm text-gray-600 dark:text-white/70 mt-1">{module.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {!module.isPublished && (
                        <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                          Draft
                        </span>
                      )}
                      <div className="text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full font-medium">
                        {module.lessons?.length || 0} lessons
                      </div>

                      {/* ── Bulk action buttons — appear when lessons are selected ── */}
                      {moduleSelectedCount > 0 && (
                        <div
                          className="flex items-center gap-2 transition-all duration-200"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                            {moduleSelectedCount} selected:
                          </span>
                          <button
                            type="button"
                            disabled={bulkSaving}
                            onClick={() => handleBulkVisibility("phone")}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white rounded-md text-xs font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                            title="Set selected lessons to Phone Only"
                          >
                            {bulkSaving ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Smartphone className="w-3 h-3" />
                            )}
                            Phone Only
                          </button>
                          <button
                            type="button"
                            disabled={bulkSaving}
                            onClick={() => handleBulkVisibility("both")}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                            title="Set selected lessons to Web & App Both"
                          >
                            {bulkSaving ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Monitor className="w-3 h-3" />
                            )}
                            Web & App Both
                          </button>
                        </div>
                      )}

                      {/* Add Drip Button */}
                      <button
                        type="button"
                        className="px-3 py-1.5 bg-purple-600 text-white rounded-md text-xs font-medium hover:bg-purple-700 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddDrip(module);
                        }}
                      >
                        Add Drip
                      </button>
                    </div>
                  </div>

                  {/* Lessons List */}
                  <div
                    className={`overflow-auto transition-all duration-500 ease-in-out ${
                      expandedModules.has(moduleId) ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="bg-blue-50 dark:bg-white/[0.01] border-t border-blue-100 overflow-y-scroll">
                      {module.lessons?.map((lesson, index) => {
                        const lessonId = lesson.id || lesson._id;
                        const checked = isLessonChecked(moduleId, lessonId);

                        return (
                          <div
                            key={lessonId}
                            className={`flex sm:flex-row items-center sm:items-center justify-between gap-4 p-4 pl-8 hover:bg-white dark:hover:bg-white/[0.06] transition-colors duration-200 border-b border-blue-100 last:border-b-0 ${
                              checked ? "bg-purple-50/60 dark:bg-purple-900/10" : ""
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              {/* ── Per-lesson checkbox ── */}
                              <input
                                type="checkbox"
                                id={`lesson-check-${lessonId}`}
                                checked={checked}
                                onChange={() => toggleLesson(moduleId, lessonId)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-4 h-4 rounded border-gray-300 text-purple-600 accent-purple-600 cursor-pointer shrink-0"
                              />

                              {/* Lesson number badge */}
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                                  lesson.isCompleted ? "bg-green-600 text-white" : "bg-blue-600 text-white"
                                }`}
                              >
                                {lesson.isCompleted ? "✓" : index + 1}
                              </div>

                              <div className="flex items-center space-x-2">
                                <div className="text-gray-500 dark:text-white/70">
                                  {getLessonTypeIcon(lesson.type)}
                                </div>
                                <span className="text-gray-900 dark:text-white/90 font-medium">
                                  {lesson.title || lesson.name}
                                </span>
                                {lesson.duration && (
                                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                    {lesson.duration}min
                                  </span>
                                )}
                                {(lesson.ismobileOnly || lesson.accessSettings?.platform === "phone") && (
                                  <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">
                                    Mobile Only
                                  </span>
                                )}
                                {Array.isArray(lesson.dripRules) && lesson.dripRules.length > 0 && (
                                  <button
                                    type="button"
                                    className="flex items-center gap-1 px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-medium cursor-default"
                                    title="This lesson has a drip rule"
                                    style={{ pointerEvents: "none" }}
                                  >
                                    <Lock className="w-3 h-3 mr-1" />
                                    Drip Rule Added
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  openModal("view", lesson, module);
                                }}
                                className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm font-medium shadow-sm"
                              >
                                <Eye className="w-4 h-4" />
                                <span>View</span>
                              </button>

                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleDripSettings(lessonId, moduleId);
                                }}
                                className="flex items-center space-x-1 px-3 py-1.5 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors duration-200 text-sm font-medium shadow-sm"
                              >
                                <Zap className="w-4 h-4" />
                                <span>Drip</span>
                              </button>

                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleLessonSettings(lessonId, moduleId);
                                }}
                                className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-md transition-colors duration-200"
                              >
                                {/* <Settings className="w-4 h-4" /> */}
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {(!module.lessons || module.lessons.length === 0) && (
                        <div className="p-8 text-center text-gray-500">
                          <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>No lessons in this module yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Access Settings Modal */}
        {modalData && modalData.type === "view" && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-[2px] bg-opacity-50 flex items-center justify-center z-[10000] p-4"
            onClick={closeModal}
          >
            <div
              className="bg-white dark:bg-[#101828] rounded-lg shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex sm:flex-row items-center sm:items-center justify-between gap-4 mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white/90">Course Access Settings</h3>
                  <button
                    onClick={closeModal}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
                    disabled={savingSettings}
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="pt-4 border-t border-gray-200">
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white/90 mb-3">
                        Where do you want to make this lesson available?
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-white/70 mb-4">
                        Choose the platform(s) where students can access "{modalData.lesson.title || modalData.lesson.name}".
                      </p>

                      <div className="space-y-3">
                        <div className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all duration-200">
                          <input
                            type="radio"
                            id="phone-only"
                            name="access-type"
                            value="phone"
                            defaultChecked={
                              modalData.lesson.ismobileOnly ||
                              modalData.lesson.accessSettings?.platform === "phone"
                            }
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            disabled={savingSettings}
                          />
                          <label htmlFor="phone-only" className="ml-3 flex-1 cursor-pointer">
                            <div className="font-medium text-gray-900 dark:text-white/90">Phone Only</div>
                            <div className="text-sm text-gray-600 dark:text-white/70">Mobile app access only</div>
                          </label>
                        </div>

                        <div className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all duration-200">
                          <input
                            type="radio"
                            id="both-platforms"
                            name="access-type"
                            value="both"
                            defaultChecked={
                              !modalData.lesson.ismobileOnly &&
                              (!modalData.lesson.accessSettings?.platform ||
                                modalData.lesson.accessSettings?.platform === "both")
                            }
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            disabled={savingSettings}
                          />
                          <label htmlFor="both-platforms" className="ml-3 flex-1 cursor-pointer">
                            <div className="font-medium text-gray-900 dark:text-white/90">Web & App Both</div>
                            <div className="text-sm text-gray-600 dark:text-white/70">Available on all platforms</div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                    disabled={savingSettings}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const selectedOption = document.querySelector('input[name="access-type"]:checked');
                      const platform = selectedOption ? selectedOption.value : "both";
                      handleAccessSettingsSave(
                        modalData.lesson.id || modalData.lesson._id,
                        modalData.module.id || modalData.module._id,
                        { platform }
                      );
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={savingSettings}
                  >
                    {savingSettings && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>{savingSettings ? "Saving..." : "Save Settings"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Drip Settings Modal */}
        {dripModalData && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-[2px] bg-opacity-50 flex items-center justify-center z-[10000] p-4"
            onClick={closeDripModal}
          >
            <div
              className="bg-white dark:bg-[#101828] rounded-lg shadow-2xl max-w-5xl h-[94%] overflow-y-auto w-full transform transition-all duration-300 scale-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex sm:flex-row items-center sm:items-center justify-between gap-4 mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white/90">
                    Drip Settings - {dripModalData.lesson?.title || dripModalData.lesson?.name}
                  </h3>
                  <button onClick={closeDripModal} className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                <DripPopup
                  key={dripPopupKey}
                  onSubmit={handleDripSubmit}
                  onClose={closeDripModal}
                  initialData={{
                    ...dripModalData.lesson?.dripRules,
                    targetType: dripModalData.targetType,
                    targetId: dripModalData.targetId,
                  }}
                  targetType={dripModalData.targetType}
                  targetId={dripModalData.targetId}
                />
              </div>
            </div>
          </div>
        )}

        {/* Module-level DripPopup for multi-select */}
        {moduleDripModal && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-[2px] bg-opacity-50 flex items-center justify-center z-[10000] p-4"
            onClick={() => setModuleDripModal(null)}
          >
            <div
              className="bg-white dark:bg-[#101828] rounded-lg shadow-2xl max-w-5xl h-[94%] overflow-y-auto w-full transform transition-all duration-300 scale-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex sm:flex-row items-center sm:items-center justify-between gap-4 mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white/90">
                    Drip Settings - Module: {moduleDripModal.module?.title || moduleDripModal.module?.name}
                  </h3>
                  <button onClick={() => setModuleDripModal(null)} className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                <DripPopup
                  onSubmit={async (dripSettings, result) => {
                    setModuleDripModal(null);
                    if (dripSettings?.targetId) await refreshDripRulesForTarget(dripSettings.targetId);
                    await dispatch(fetchCourseContents());
                  }}
                  onClose={() => setModuleDripModal(null)}
                  initialData={[{
                    dripType: "",
                    referenceType: "lesson",
                    referenceId: "",
                    delayDays: 0,
                    targetType: "lesson",
                    targetId: moduleDripModal.targetId,
                  }]}
                  targetType="lesson"
                  targetId={moduleDripModal.targetId}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <PopupAlert
        message={popup.message}
        type={popup.type}
        isVisible={popup.isVisible}
        onClose={() => setPopup({ ...popup, isVisible: false })}
      />
    </>
  );
};

export default CourseAccordion;
