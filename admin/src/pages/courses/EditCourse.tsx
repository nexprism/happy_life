import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCourseById, updateCourse } from "../../store/slices/course";
import CategorySubcategoryDropdowns from "../../components/CategorySubcategoryDropdowns";
import { RootState, AppDispatch } from "../../store";
import { useLocation, useParams } from "react-router-dom";
import {
  FileText,
  DollarSign,
  Users,
  Tag,
  Image,
  Video,
  Plus,
  X,
  Award,
  Download,
  MessageCircle,
  Lock,
  Upload,
  Eye,
  Loader2,
  AlertCircle,
  Type,
  Edit,
  Search,
  Check,
  Save,
  CheckCircle,
  Settings,
  Menu,
  Layout,
  Layers,
  Sparkles,
  Target,
  Star,
} from "lucide-react";
import ModuleSection from "./ModuleSection";
import Faqs from "./components/Faqs";
import QuillEditor from "../../components/QuillEditor";
import Editor from "../../components/Editor";
import LandingPageSections from "./LandingPageSections";
import AddReview from "./AddReview";

const baseUrl = import.meta.env.VITE_IMAGE_URL || import.meta.env.VITE_BASE_URL || "https://happy-life-sx03.onrender.com/";

const getFullImageUrl = (url: string | null | undefined) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("blob:") || url.startsWith("data:")) {
    return url;
  }
  const cleanBase = (baseUrl || "").replace(/\/+$/, "");
  const cleanPath = url.replace(/^\/+/, "");
  return `${cleanBase}/${cleanPath}`;
};

// Success Popup Component (unchanged)
const SuccessPopup = ({
  isVisible,
  onClose,
  message,
  type = "success",
}: {
  isVisible: boolean;
  onClose: () => void;
  message: string;
  type?: "success" | "error";
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-[100]">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
        <div className="text-center">
          <div
            className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${type === "success" ? "bg-green-100" : "bg-red-100"
              }`}
          >
            {type === "success" ? (
              <CheckCircle className="w-8 h-8 text-green-600" />
            ) : (
              <AlertCircle className="w-8 h-8 text-red-600" />
            )}
          </div>
          <h3
            className={`text-xl font-semibold mb-2 ${type === "success" ? "text-green-800" : "text-red-800"
              }`}
          >
            {type === "success" ? "Success!" : "Error!"}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
          <button
            onClick={onClose}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${type === "success"
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-red-600 text-white hover:bg-red-700"
              }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// File Upload Component with live preview and existing image support
type FileUploadProps = {
  label: string;
  accept: string;
  onFileChange: (file: File | null) => void;
  currentFile: File | null;
  existingUrl?: string;
  icon: React.ElementType;
  helperText?: string;
  onClearExisting?: () => void;
};

const FileUpload = ({
  label,
  accept,
  onFileChange,
  currentFile,
  existingUrl,
  icon: Icon,
  helperText,
  onClearExisting,
}: FileUploadProps) => {
  const [dragOver, setDragOver] = useState(false);
  const inputId = useMemo(
    () => `file-${label.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Math.random().toString(36).substr(2, 6)}`,
    [label]
  );

  const previewUrl = useMemo(() => {
    if (currentFile) {
      try {
        return URL.createObjectURL(currentFile);
      } catch (e) {
        return "";
      }
    }
    return "";
  }, [currentFile]);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(previewUrl);
        } catch (e) {
          // ignore
        }
      }
    };
  }, [previewUrl]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFileChange(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const hasImage = Boolean(currentFile || existingUrl);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center justify-between">
        <span className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          {label}
        </span>
        {helperText && <span className="text-xs text-gray-400 font-normal">{helperText}</span>}
      </label>

      {hasImage ? (
        <div className="relative border border-gray-200 dark:border-gray-700 rounded-xl p-3 bg-gray-50/70 dark:bg-gray-800/50 flex items-center gap-4 group">
          <div className="w-24 h-16 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0 border border-gray-200 dark:border-gray-600 relative">
            <img
              src={currentFile ? previewUrl : getFullImageUrl(existingUrl)}
              alt={label}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://placehold.co/600x400/1e293b/ffffff?text=Image+Not+Found";
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                  currentFile
                    ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300"
                    : "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                }`}
              >
                {currentFile ? "New file selected" : "Current saved image"}
              </span>
            </div>
            <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate mt-1">
              {currentFile ? currentFile.name : (existingUrl?.split("/").pop() || "Saved Image")}
            </p>
            {currentFile && (
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                {(currentFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <input
              type="file"
              accept={accept}
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  onFileChange(e.target.files[0]);
                }
              }}
              className="hidden"
              id={inputId}
            />
            <label
              htmlFor={inputId}
              className="px-3 py-1.5 text-xs font-semibold bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer transition-colors shadow-sm"
            >
              Change
            </label>
            {currentFile ? (
              <button
                type="button"
                onClick={() => onFileChange(null)}
                className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                title="Remove selection"
              >
                <X className="w-4 h-4" />
              </button>
            ) : onClearExisting ? (
              <button
                type="button"
                onClick={onClearExisting}
                className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-xl p-5 text-center transition-all ${
            dragOver
              ? "border-blue-500 bg-blue-50/60 dark:bg-blue-900/20 scale-[0.99]"
              : "border-gray-300 dark:border-gray-600 hover:border-gray-400 bg-gray-50/30 dark:bg-gray-800/20"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            type="file"
            accept={accept}
            onChange={(e) => onFileChange(e.target.files?.[0] || null)}
            className="hidden"
            id={inputId}
          />
          <label htmlFor={inputId} className="cursor-pointer block">
            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Drop file here or{" "}
              <span className="text-blue-600 dark:text-blue-400 hover:underline">browse</span>
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Supports PNG, JPG, JPEG, WEBP
            </p>
          </label>
        </div>
      )}
    </div>
  );
};

// Demo Video Input Component (Supports Local Video File Upload & YouTube/Video URL)
const DemoVideoInput = ({
  videoType,
  setVideoType,
  videoUrl,
  setVideoUrl,
  videoFile,
  setVideoFile,
  currentVideoUrl,
  baseUrl,
  error,
}: {
  videoType: "file" | "url";
  setVideoType: (type: "file" | "url") => void;
  videoUrl: string;
  setVideoUrl: (url: string) => void;
  videoFile: File | null;
  setVideoFile: (file: File | null) => void;
  currentVideoUrl?: string;
  baseUrl?: string;
  error?: string;
}) => {
  const [fileError, setFileError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      if (!file.type.startsWith("video/")) {
        setFileError("Please upload a valid video file (.mp4, .webm, .mov, etc.)");
        return;
      }
      if (file.size > 200 * 1024 * 1024) {
        setFileError("Video size must be less than 200MB");
        return;
      }
      setFileError("");
      setVideoFile(file);
    }
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/i);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  const embedUrl = getEmbedUrl(videoUrl);

  return (
    <div className="space-y-4 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <label className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <Video className="w-5 h-5 text-blue-600" />
          Course Demo Video (Optional)
        </label>
        <div className="inline-flex rounded-lg bg-gray-200 dark:bg-gray-700 p-1">
          <button
            type="button"
            onClick={() => setVideoType("file")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              videoType === "file"
                ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900"
            }`}
          >
            Upload Local Video
          </button>
          <button
            type="button"
            onClick={() => setVideoType("url")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              videoType === "url"
                ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900"
            }`}
          >
            YouTube / Video URL
          </button>
        </div>
      </div>

      {videoType === "file" ? (
        <div className="space-y-3">
          <div className="border-2 border-dashed rounded-xl p-6 text-center border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
            <input
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              className="hidden"
              id="edit-demo-video-file-upload"
            />
            <label htmlFor="edit-demo-video-file-upload" className="cursor-pointer">
              <Upload className="w-10 h-10 mx-auto mb-2 text-blue-500" />
              <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                Click to browse local video file
              </p>
              <p className="text-xs text-gray-500 mt-1">MP4, WebM, MOV, MKV (up to 200MB)</p>
            </label>
          </div>

          {(fileError || error) && (
            <p className="text-xs text-red-600">{fileError || error}</p>
          )}

          {videoFile && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3">
                  <PlayCircle className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setVideoFile(null)}
                  className="text-xs text-red-600 hover:text-red-700 font-medium p-1"
                >
                  Remove
                </button>
              </div>
              <video
                controls
                src={URL.createObjectURL(videoFile)}
                className="w-full max-h-64 rounded-xl bg-black shadow"
              />
            </div>
          )}

          {!videoFile && currentVideoUrl && (currentVideoUrl.startsWith("uploads/") || currentVideoUrl.startsWith("/")) && (
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-2 font-medium">Current Demo Video:</p>
              <video
                controls
                src={baseUrl ? `${baseUrl}/${currentVideoUrl.replace(/^\//, '')}` : currentVideoUrl}
                className="w-full max-h-64 rounded-xl bg-black shadow"
              />
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <input
            type="text"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className={`w-full border rounded-xl px-4 py-3 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
              error ? "border-red-400" : "border-gray-200 dark:border-gray-600"
            }`}
            placeholder="e.g. https://www.youtube.com/watch?v=... or https://youtu.be/... or direct video URL"
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          {videoUrl && embedUrl && (
            <div className="mt-3">
              <iframe
                width="100%"
                height="220"
                src={embedUrl}
                title="Demo Video Preview"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-xl shadow"
              />
            </div>
          )}
          {videoUrl && !embedUrl && (
            <div className="mt-3">
              <video
                controls
                src={videoUrl.startsWith("http") ? videoUrl : baseUrl ? `${baseUrl}/${videoUrl.replace(/^\//, '')}` : videoUrl}
                className="w-full max-h-64 rounded-xl bg-black shadow"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const EditCourse = () => {
  const { id } = useParams();
  const location = useLocation();
  const dispatch = useDispatch();

  // Fallback extraction from pathname
  const courseId = id || location.pathname.split("/").pop();
  const {
    loading,
    error,
    data: courseData,
  } = useSelector((state: any) => state.course);

  // Tab state
  const [activeTab, setActiveTab] = useState("basic");
  console.log('Active Tab:', activeTab);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // For mobile sidebar toggle

  // Course state (unchanged)
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [verticalCarouselImageFile, setVerticalCarouselImageFile] = useState<File | null>(null);
  const [featuredImageBannerFile, setFeaturedImageBannerFile] = useState<File | null>(null);
  const [demoVideoUrl, setDemoVideoUrl] = useState("");
  const [demoVideoFile, setDemoVideoFile] = useState<File | null>(null);
  const [demoVideoType, setDemoVideoType] = useState<"file" | "url">("file");
  const [description, setDescription] = useState("");
  const [seoContent, setSeoContent] = useState("");
  const [modules, setModules] = useState([]);
  const [popup, setPopup] = useState({
    message: "",
    type: "success",
    isVisible: false,
  });
  const [formErrors, setFormErrors] = useState({});

  const [formData, setFormData] = useState<any>({
    title: "",
    subtitle: "",
    seoMetaDescription: "",
    categoryId: "",
    subCategoryId: "",
    level: "beginner",
    price: "",
    currency: "INR",
    salePrice: "",
    duration: "",
    instructorId: "",
    isPublished: false,
    enrollmentType: "open",
    maxStudents: "",
    enrolledStudentsCount: 0,
    certificateTemplate: true,
    isDownloadable: true,
    courseForum: true,
    isSubscription: false,
    isPrivate: false,
    isFeatured: false,
    enableWaitlist: false,
    coursePosition: "",
    showLifetimePlan: true,
    // Mentor fields
    mentorName: "",
    mentorTitle: "",
    mentorDescription: "",
    mentorImage: "",
    mentorImageFile: null as File | null,
    mentorAchievements: [] as string[],
    mentorSocialLinks: {
      linkedin: "",
      twitter: "",
      youtube: "",
      website: ""
    },
    // Learning outcomes and target audience
    learningOutcomes: [],
    targetAudience: [],
    // Certificate fields
    certificateImage: "",
    certificateImageFile: null,
    certificateTitle: "Certificate of Completion",
    certificateSubtitle: "Awarded for Excellence",
    certificateRecipientName: "Student Name",
    certificateIssuerName: "",
    certificateIssuerTitle: "",
    certificateOrganization: "Happy Life Academy",
    certificateDescription: "",
    // Enhanced Landing Page Sections
    landingPageSections: [],
    overviewSection: { show: false, title: "", subtitle: "", description: null, images: [] },
    comparisonSection: {
      show: false,
      title: "",
      leftTitle: "Traditional Program",
      rightTitle: "Our Program",
      content: null,
      leftPoints: [""],
      rightPoints: [""]
    },
    benefitsSection: { show: false, title: "", content: null, points: [""] },
    frameworkSection: { show: false, title: "", subtitle: "", description: null, media: "" },
    solutionSection: { show: false, title: "", content: null, points: [""] },
  });

  // Plans state
  const [plans, setPlans] = useState<
    { name: string; price: string; description: string; durationType: string; duration: string; salePrice: string; status: string; _id?: string }[]
  >([]);

  // Plan form state
  const [planForm, setPlanForm] = useState({
    name: "",
    price: "",
    description: "",
    durationType: "Month",
    duration: "",
    salePrice: "",
    status: "active",
    _id: undefined,
  });

  // Track if editing a plan (by index)
  const [editingPlanIdx, setEditingPlanIdx] = useState<number | null>(null);

  // Plan form errors
  const [planFormError, setPlanFormError] = useState("");

  // Predefined tags (unchanged)
  const predefinedTags = [
    "Programming",
    "Design",
    "Business",
    "Marketing",
    "Data Science",
    "Mobile Development",
    "AI/ML",
    "Web Development",
  ];

  const validateForm = (
    formData: any,
    description: string,
    seoContent: string,
    selectedTags: string[],
    files: any,
    demoVideoUrl: string,
    demoVideoType: "file" | "url"
  ) => {
    const errors: any = {};

    if (!formData.title || !formData.title.trim()) {
      errors.title = "Course title is required";
    } else if (formData.title.length > 100) {
      errors.title = "Title must be less than 100 characters";
    }

    if (formData.price !== undefined && formData.price !== null && String(formData.price).trim() !== "") {
      if (isNaN(Number(formData.price)) || Number(formData.price) < 0) {
        errors.price = "Price must be a non-negative number";
      } else if (Number(formData.price) > 1000000) {
        errors.price = "Price cannot exceed 1,000,000";
      }
    }

    if (formData.salePrice && String(formData.salePrice).trim() !== "") {
      if (isNaN(Number(formData.salePrice)) || Number(formData.salePrice) < 0) {
        errors.salePrice = "Sale price must be a non-negative number";
      } else if (Number(formData.salePrice) > 1000000) {
        errors.salePrice = "Sale price cannot exceed 1,000,000";
      }
    }

    if (formData.seoMetaDescription && formData.seoMetaDescription.length > 160) {
      errors.seoMetaDescription =
        "Meta description must be less than 160 characters";
    }

    if (seoContent && seoContent.length > 10000) {
      errors.seoContent = "SEO content must be less than 10,000 characters";
    }

    if (!files.thumbnailFile && !formData.thumbnail) {
      errors.thumbnailFile = "Thumbnail image is required";
    }

    if (demoVideoType === "url" && demoVideoUrl && demoVideoUrl.trim() !== "") {
      const isYoutube = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([\w-]{11})/i.test(demoVideoUrl);
      const isUrl = /^https?:\/\/.+/i.test(demoVideoUrl) || /^\/.+/i.test(demoVideoUrl);
      if (!isYoutube && !isUrl) {
        errors.demoVideoUrl = "Please enter a valid YouTube or video URL";
      }
    }

    if (selectedTags.length === 0) {
      errors.tags = "At least one tag is required";
    } else if (selectedTags.length > 10) {
      errors.tags = "Maximum 10 tags allowed";
    }

    return errors;
  };

  // Fetch course data for editing (unchanged)
  useEffect(() => {
    if (courseId) {
      const token = localStorage.getItem("token") || "";
      dispatch(fetchCourseById({ courseId, token }));
    }
  }, [courseId, dispatch]);

  const parseEditorData = (data: any) => {
    if (!data) return undefined;
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch (e) {
        return {
          blocks: [{ type: "paragraph", data: { text: data } }],
        };
      }
    }
    return data;
  };

  // Always process course data when it changes
  useEffect(() => {
    if (courseData) {
      const course = courseData?.data?.course || courseData?.course || courseData?.data || courseData;
      if (!course || (!course._id && !course.title)) return;

      setFormData((prev) => ({
        ...prev,
        title: course.title || "",
        subtitle: course.subtitle || "",
        seoMetaDescription: course.seoMetaDescription || "",
        thumbnail: course.thumbnail || "",
        demoVideo: course.demoVideo || "",
        coverImage: course.coverImage || "",
        verticalCarouselImage: course.verticalCarouselImage || "",
        featuredImageBanner: course.featuredImageBanner || "",
        categoryId:
          course.categoryId ||
          course.category?._id ||
          course.categoryId?._id ||
          "",
        subCategoryId:
          course.subCategoryId ||
          course.subCategory?._id ||
          course.subCategoryId?._id ||
          "",
        level: course.level || "beginner",
        price:
          typeof course.price === "object" && course.price?.$numberDecimal
            ? course.price.$numberDecimal
            : course.price || "",
        salePrice:
          typeof course.salePrice === "object" && course.salePrice?.$numberDecimal
            ? course.salePrice.$numberDecimal
            : course.salePrice || "",
        currency: course.currency || "INR",
        duration: course.duration || "",
        instructorId: course.instructorId || course.instructor?._id || "",
        isPublished: course.isPublished || false,
        enrollmentType: course.enrollmentType || "open",
        maxStudents: course.maxStudents || "",
        enrolledStudentsCount: course.enrolledStudentsCount || 0,
        certificateTemplate:
          course.certificateTemplate !== undefined
            ? course.certificateTemplate
            : true,
        isDownloadable:
          course.isDownloadable !== undefined ? course.isDownloadable : true,
        courseForum:
          course.courseForum !== undefined ? course.courseForum : true,
        isSubscription: course.isSubscription || false,
        isPrivate: course.isPrivate || false,
        isFeatured: course.isFeatured || false,
        enableWaitlist: course.enableWaitlist || false,
        coursePosition: course.coursePosition || "",
        showLifetimePlan: course.showLifetimePlan !== false,
        // Mentor fields
        mentorName: course.mentorName || "",
        mentorTitle: course.mentorTitle || "",
        mentorDescription: course.mentorDescription || "",
        mentorImage: course.mentorImage || "",
        mentorAchievements: course.mentorAchievements || [],
        mentorSocialLinks: course.mentorSocialLinks || {
          linkedin: "",
          twitter: "",
          youtube: "",
          website: ""
        },
        // Learning outcomes and target audience
        learningOutcomes: course.learningOutcomes || [],
        targetAudience: course.targetAudience || [],
        // Certificate fields
        certificateImage: course.certificateImage || "",
        certificateTitle: course.certificateTitle || "Certificate of Completion",
        certificateSubtitle: course.certificateSubtitle || "Awarded for Excellence",
        certificateRecipientName: course.certificateRecipientName || "Student Name",
        certificateIssuerName: course.certificateIssuerName || "",
        certificateIssuerTitle: course.certificateIssuerTitle || "",
        certificateOrganization: course.certificateOrganization || "Happy Life Academy",
        certificateDescription: course.certificateDescription || "",
        // Enhanced Landing Page Sections
        landingPageSections: (course.landingPageSections && course.landingPageSections.length > 0)
          ? course.landingPageSections.map((s: any, i: number) => ({
            ...s,
            order: s.order ?? i,
            sortOrder: s.sortOrder ?? i,
          }))
          : [
            { id: "1", type: "overview", order: 0, sortOrder: 0, data: { show: course.overviewSection?.show || false, title: course.overviewSection?.title || "", subtitle: course.overviewSection?.subtitle || "", description: parseEditorData(course.overviewSection?.description), images: course.overviewSection?.images || [] } },
            { id: "2", type: "comparison", order: 1, sortOrder: 1, data: { show: course.comparisonSection?.show || false, title: course.comparisonSection?.title || "", leftTitle: course.comparisonSection?.leftTitle || "Traditional Program", rightTitle: course.comparisonSection?.rightTitle || "Our Program", content: parseEditorData(course.comparisonSection?.content), leftPoints: course.comparisonSection?.leftPoints?.length ? course.comparisonSection.leftPoints : [""], rightPoints: course.comparisonSection?.rightPoints?.length ? course.comparisonSection.rightPoints : [""] } },
            { id: "3", type: "benefits", order: 2, sortOrder: 2, data: { show: course.benefitsSection?.show || false, title: course.benefitsSection?.title || "", content: parseEditorData(course.benefitsSection?.content), points: course.benefitsSection?.points?.length ? course.benefitsSection.points : [""] } },
            { id: "4", type: "framework", order: 3, sortOrder: 3, data: { show: course.frameworkSection?.show || false, title: course.frameworkSection?.title || "", subtitle: course.frameworkSection?.subtitle || "", description: parseEditorData(course.frameworkSection?.description), media: course.frameworkSection?.media || "" } },
            { id: "5", type: "solution", order: 4, sortOrder: 4, data: { show: course.solutionSection?.show || false, title: course.solutionSection?.title || "", content: parseEditorData(course.solutionSection?.content), points: course.solutionSection?.points?.length ? course.solutionSection.points : [""] } }
          ].filter(Boolean),
        overviewSection: {
          show: course.overviewSection?.show || false,
          title: course.overviewSection?.title || "",
          subtitle: course.overviewSection?.subtitle || "",
          images: course.overviewSection?.images || [],
          description: parseEditorData(course.overviewSection?.description)
        },
        comparisonSection: {
          show: course.comparisonSection?.show || false,
          title: course.comparisonSection?.title || "",
          leftTitle: course.comparisonSection?.leftTitle || "Traditional Program",
          rightTitle: course.comparisonSection?.rightTitle || "Our Program",
          leftPoints: (course.comparisonSection?.leftPoints && course.comparisonSection.leftPoints.length > 0)
            ? course.comparisonSection.leftPoints
            : [""],
          rightPoints: (course.comparisonSection?.rightPoints && course.comparisonSection.rightPoints.length > 0)
            ? course.comparisonSection.rightPoints
            : [""],
          content: parseEditorData(course.comparisonSection?.content)
        },
        benefitsSection: {
          show: course.benefitsSection?.show || false,
          title: course.benefitsSection?.title || "",
          points: (course.benefitsSection?.points && course.benefitsSection.points.length > 0)
            ? course.benefitsSection.points
            : [""],
          content: parseEditorData(course.benefitsSection?.content)
        },
        frameworkSection: {
          show: course.frameworkSection?.show || false,
          title: course.frameworkSection?.title || "",
          subtitle: course.frameworkSection?.subtitle || "",
          media: course.frameworkSection?.media || "",
          description: parseEditorData(course.frameworkSection?.description)
        },
        solutionSection: {
          show: course.solutionSection?.show || false,
          title: course.solutionSection?.title || "",
          points: (course.solutionSection?.points && course.solutionSection.points.length > 0)
            ? course.solutionSection.points
            : [""],
          content: parseEditorData(course.solutionSection?.content)
        },
      }));

      setDescription(course.description || "");
      setSeoContent(course.seoContent || "");
      setSelectedTags(course.tags || []);
      setDemoVideoUrl(course.demoVideo || "");

      const courseModules = course.modules || [];
      // Map modules and lessons, including textLessons and files for each lesson
      const processedModules = courseModules.map((module) => ({
        _id: module._id || undefined,
        title: module.title || "",
        description: module.description || "",
        image: module.image || "",          // ← preserve module thumbnail
        estimatedDuration: module.estimatedDuration || 60,
        isPublished: module.isPublished || false,
        courseId: module.courseId || courseId,
        lessons: (module.lessons || []).map((lesson) => ({
          _id: lesson._id || undefined,
          title: lesson.title || "",
          type: lesson.type || "video",
          content: lesson.content || "",
          videoUrl: lesson.videoUrl || "",
          duration: lesson.duration || "",
          order: lesson.order || 0,
          // Add textLessons and files if present
          quiz: lesson.quiz || [],
          videoLessons: lesson.videoLessons || [],
          assignment: lesson?.assignment || [],
          textLessons: lesson.textLessons || [],
          files: lesson.files || [],
        })),
        order: module.order || 0,
      }));

      setModules(processedModules);

      // --- Load initial plans from backend ---
      if (Array.isArray(course.plans)) {
        setPlans(
          course.plans.map((p) => ({
            name: p.name || "",
            price: String(p.price ?? ""),
            description: p.description || "",
            durationType: p.durationType || "Month",
            duration: String(p.duration ?? ""),
            salePrice: String(p.salePrice ?? ""),
            status: p.status || "active",
            _id: p._id,
          }))
        );
      }
    }
  }, [courseData]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    const checked = e.target.checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const addTag = (tag) => {
    if (selectedTags.length >= 5) {
      setPopup({
        isVisible: true,
        message: "Maximum 5 tags allowed",
        type: "error",
      });
      return;
    }
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
      setFormErrors((prev) => ({ ...prev, tags: "" }));
    }
  };

  const handleCategoryChange = (categoryId, categoryName) => {
    setFormData((prev) => ({
      ...prev,
      categoryId,
      subCategoryId: "",
    }));
    setFormErrors((prev) => ({ ...prev, categoryId: "", subCategoryId: "" }));
  };

  const handleSubcategoryChange = (subCategoryId, subCategoryName) => {
    setFormData((prev) => ({
      ...prev,
      subCategoryId,
    }));
    setFormErrors((prev) => ({ ...prev, subCategoryId: "" }));
  };

  const removeTag = (tagToRemove) => {
    setSelectedTags(selectedTags.filter((tag) => tag !== tagToRemove));
  };

  const addCustomTag = () => {
    if (selectedTags.length >= 5) {
      setPopup({
        isVisible: true,
        message: "Maximum 5 tags allowed",
        type: "error",
      });
      return;
    }
    if (
      customTag.trim() &&
      !selectedTags.includes(customTag.trim())
    ) {
      setSelectedTags([...selectedTags, customTag.trim()]);
      setCustomTag("");
      setFormErrors((prev) => ({ ...prev, tags: "" }));
    }
  };

  const handleModulesChange = (updatedModules: any) => {
    // Only update modules state, do not show popup here
    setModules(updatedModules);
  };

  // Add or update plan
  const handleAddOrUpdatePlan = () => {
    const name = String(planForm.name || "").trim();
    const price = String(planForm.price ?? "").trim();
    const durationType = String(planForm.durationType || "Month");
    const duration = String(planForm.duration ?? "").trim();
    const description = String(planForm.description || "").trim();
    const salePrice = String(planForm.salePrice ?? "").trim();
    const status = String(planForm.status || "active");

    if (!name || !price || !durationType || !duration) {
      setPlanFormError("Name, price, duration type, and duration are required");
      return;
    }

    if (editingPlanIdx !== null) {
      // Update existing plan preserving its _id
      const existingId = plans[editingPlanIdx]?._id || planForm._id;
      setPlans((prev) =>
        prev.map((p, idx) =>
          idx === editingPlanIdx
            ? { name, price, description, durationType, duration, salePrice, status, _id: existingId }
            : p
        )
      );
      setEditingPlanIdx(null);
    } else {
      // Add new plan
      setPlans([...plans, { name, price, description, durationType, duration, salePrice, status }]);
    }
    setPlanForm({ name: "", price: "", description: "", durationType: "Month", duration: "", salePrice: "", status: "active", _id: undefined });
    setPlanFormError("");
  };

  // Edit plan
  const handleEditPlan = (idx: number) => {
    const p = plans[idx];
    if (!p) return;
    setPlanForm({
      name: p.name || "",
      price: String(p.price ?? ""),
      description: p.description || "",
      durationType: p.durationType || "Month",
      duration: String(p.duration ?? ""),
      salePrice: String(p.salePrice ?? ""),
      status: p.status || "active",
      _id: p._id,
    });
    setEditingPlanIdx(idx);
    setPlanFormError("");
  };

  // Remove plan
  const handleRemovePlan = (idx: number) => {
    setPlans(plans.filter((_, i) => i !== idx));
    if (editingPlanIdx === idx) {
      setPlanForm({ name: "", price: "", description: "", durationType: "Month", duration: "", salePrice: "", status: "active", _id: undefined });
      setEditingPlanIdx(null);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setPlanForm({ name: "", price: "", description: "", durationType: "Month", duration: "", salePrice: "", status: "active", _id: undefined });
    setEditingPlanIdx(null);
    setPlanFormError("");
  };

  const handleSubmit = async (e, isDraft = false) => {
    e.preventDefault();

    const files = {
      thumbnailFile,
      coverImageFile,
      verticalCarouselImageFile,
      featuredImageBannerFile,
      demoVideoFile,
    };
    const errors = validateForm(
      formData,
      description,
      seoContent,
      selectedTags,
      files,
      demoVideoUrl,
      demoVideoType
    );

    console?.log('Validation errors:', errors);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);

      // Auto-switch to the first tab that has an error
      if (errors.title || errors.description) {
        setActiveTab("basic");
      } else if (errors.categoryId || errors.subCategoryId || errors.duration) {
        setActiveTab("details");
      } else if (errors.thumbnailFile || errors.demoVideoUrl || errors.demoVideoFile) {
        setActiveTab("media");
      } else if (errors.price || errors.salePrice) {
        setActiveTab("pricing");
      } else if (errors.tags) {
        setActiveTab("tags");
      } else if (errors.seoMetaDescription || errors.seoContent) {
        setActiveTab("seo");
      }

      const errorList = Object.values(errors).map((err) => `• ${err}`).join("\n");
      setPopup({
        isVisible: true,
        message: `Please complete the following required fields:\n\n${errorList}`,
        type: "error",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const submitFormData = new FormData();

    Object.keys(formData).forEach((key) => {
      const value = formData[key];
      if (key === "isPublished") {
        submitFormData.set("isPublished", (!isDraft && !!formData.isPublished).toString());
      } else if (key === "learningOutcomes" || key === "targetAudience" || key === "mentorAchievements") {
        // Handle arrays properly
        if (Array.isArray(value) && value.length > 0) {
          submitFormData.append(key, JSON.stringify(value.filter(item => item && item.trim() !== "")));
        }
      } else if (key === "mentorSocialLinks") {
        // Handle mentor social links object
        if (value && typeof value === "object") {
          submitFormData.append(key, JSON.stringify(value));
        }
      } else if (key === "mentorImageFile") {
        // Handle mentor image file upload
        if (value) {
          submitFormData.set("mentorImage", value);
        }
      } else if (key === "certificateImageFile") {
        // Handle certificate image file upload
        if (value) {
          submitFormData.set("certificateImage", value);
        }
      } else if (key === "landingPageSections") {
        submitFormData.append(key, JSON.stringify(value));
      } else if (Array.isArray(value)) {
        submitFormData.append(key, value.length > 0 ? String(value[0]) : "");
      } else if (key === "overviewSection" || key === "comparisonSection" || key === "benefitsSection" || key === "frameworkSection" || key === "solutionSection") {
        // Handle individual landing page sections objects (for backward compatibility or direct updates)
        if (value && typeof value === "object") {
          // Clean up comparisonSection: filter out empty strings from points arrays
          if (key === "comparisonSection") {
            const cleanedSection = {
              ...value,
              leftPoints: Array.isArray(value.leftPoints)
                ? value.leftPoints.filter((point: any) => point != null && String(point).trim() !== '')
                : [],
              rightPoints: Array.isArray(value.rightPoints)
                ? value.rightPoints.filter((point: any) => point != null && String(point).trim() !== '')
                : []
            };
            submitFormData.append(key, JSON.stringify(cleanedSection));
          } else if (key === "benefitsSection" || key === "solutionSection") {
            // Clean up benefitsSection and solutionSection: filter out empty strings from points array
            const cleanedSection = {
              ...value,
              points: Array.isArray(value.points)
                ? value.points.filter((point: any) => point != null && String(point).trim() !== '')
                : []
            };
            submitFormData.append(key, JSON.stringify(cleanedSection));
          } else {
            submitFormData.append(key, JSON.stringify(value));
          }
        }
      } else if (value !== null && value !== undefined && value !== "") {
        if (key === "instructorId" || key === "subCategoryId") {
          if (String(value).trim()) {
            submitFormData.append(key, String(value));
          }
        } else {
          submitFormData.append(key, String(value));
        }
      }
    });

    submitFormData.set("title", String(formData.title));
    submitFormData.set("subtitle", String(formData.subtitle));
    submitFormData.set("seoMetaDescription", String(formData.seoMetaDescription));
    submitFormData.set("description", description);
    submitFormData.set("seoContent", seoContent);
    submitFormData.set("tags", JSON.stringify(selectedTags));
    submitFormData.set("level", formData.level || "beginner");
    if (demoVideoType === "file" && demoVideoFile) {
      submitFormData.set("demoVideo", demoVideoFile);
    } else if (demoVideoType === "url" && demoVideoUrl) {
      submitFormData.set("demoVideo", demoVideoUrl);
    } else if (!demoVideoFile && !demoVideoUrl) {
      submitFormData.set("demoVideo", "");
    }

    // Handle mentor image file separately if uploaded
    if (formData.mentorImageFile) {
      submitFormData.set("mentorImage", formData.mentorImageFile);
    } else if (formData.mentorImage !== undefined) {
      submitFormData.set("mentorImage", formData.mentorImage || "");
    }

    // Handle certificate image file separately if uploaded
    if (formData.certificateImageFile) {
      submitFormData.set("certificateImage", formData.certificateImageFile);
    } else if (formData.certificateImage !== undefined) {
      submitFormData.set("certificateImage", formData.certificateImage || "");
    }

    if (verticalCarouselImageFile) {
      submitFormData.set("verticalCarouselImage", verticalCarouselImageFile);
    } else {
      submitFormData.set("verticalCarouselImage", formData.verticalCarouselImage ?? "");
    }

    if (featuredImageBannerFile) {
      submitFormData.set("featuredImageBanner", featuredImageBannerFile);
    } else {
      submitFormData.set("featuredImageBanner", formData.featuredImageBanner ?? "");
    }

    if (thumbnailFile) {
      submitFormData.set("thumbnail", thumbnailFile);
    } else {
      submitFormData.set("thumbnail", formData.thumbnail ?? "");
    }

    if (coverImageFile) {
      submitFormData.set("coverImage", coverImageFile);
    } else {
      submitFormData.set("coverImage", formData.coverImage ?? "");
    }

    // --- FLATTEN PLANS IN PAYLOAD WITHOUT QUOTES ---
    let finalPlans = [...plans];
    if (editingPlanIdx !== null && planForm.name && planForm.price) {
      const existingId = plans[editingPlanIdx]?._id || planForm._id;
      finalPlans = finalPlans.map((p, idx) =>
        idx === editingPlanIdx ? { ...planForm, _id: existingId } : p
      );
    }

    submitFormData.set("hasPlansSubmitted", "true");
    finalPlans.forEach((plan, idx) => {
      Object.entries(plan).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          submitFormData.append(`plans[${idx}][${key}]`, String(value));
        }
      });
    });
    // --- END FLATTEN PLANS ---

    try {
      await dispatch(
        updateCourse({ id: courseId, data: submitFormData })
      ).unwrap();
      setVerticalCarouselImageFile(null);
      setFeaturedImageBannerFile(null);
      setThumbnailFile(null);
      setCoverImageFile(null);
      setPopup({
        isVisible: true,
        message: isDraft
          ? "Course saved as draft successfully!"
          : "Course updated successfully!",
        type: "success",
      });
      // Refetch course data after update to get latest price/salePrice
      const token = localStorage.getItem("token") || "";
      dispatch(fetchCourseById({ courseId, token }));

    } catch (error: any) {
      setPopup({
        isVisible: true,
        message:
          typeof error === "string"
            ? error
            : error?.message ||
              error?.err?.message ||
              "Failed to update course. Please try again.",
        type: "error",
      });
    }
  };

  const getUrlFromFile = (file) => {
    if (!file) return "";
    return URL.createObjectURL(file);
  };

  if (loading && !courseData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-300">Loading course data...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: "basic", title: "Basic Information", icon: Type, isRequired: true },
    { key: "details", title: "Course Details", icon: FileText, isRequired: true },
    { key: "media", title: "Media Files", icon: Image, isRequired: true },
    { key: "pricing", title: "Pricing", icon: DollarSign, isRequired: true },
    { key: "features", title: "Course Features", icon: Award, isRequired: false },
    { key: "tags", title: "Tags", icon: Tag, isRequired: true },
    { key: "seo", title: "SEO Content", icon: Search, isRequired: false },
    { key: "modules", title: "Course Modules", icon: Settings, isRequired: false },
    { key: "faqs", title: "FAQs", icon: MessageCircle, isRequired: false },
    { key: "mentor", title: "Mentor Information", icon: Users, isRequired: false },
    { key: "landingPage", title: "Landing Page Sections", icon: Layout, isRequired: false },
    { key: "certificate", title: "Certificate", icon: Award, isRequired: false },
    { key: "publication", title: "Publication Status", icon: Eye, isRequired: false },
    { key: "reviews", title: "Reviews", icon: Star, isRequired: false },
  ];

  return (
    <>
      <SuccessPopup
        message={popup.message}
        type={popup.type}
        isVisible={popup.isVisible}
        onClose={() => setPopup({ ...popup, isVisible: false })}
      />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            } lg:translate-x-0 lg:static lg:w-64`}
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Course Editor
            </h2>
            <button
              className="lg:hidden mt-2 text-gray-600 dark:text-gray-300"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <nav className="p-4 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveTab(tab.key);
                  setIsSidebarOpen(false); // Close sidebar on mobile after selection
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === tab.key
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 shadow-sm"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.title}</span>
                {tab.isRequired && (
                  <span className="text-red-500 text-xs">*</span>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-8">
          {/* Mobile Sidebar Toggle */}
          <button
            className="lg:hidden mb-4 p-2 bg-blue-600 text-white rounded-lg"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
            <h1 className="text-3xl font-bold flex items-center gap-3 text-gray-900 dark:text-gray-100">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Edit className="w-8 h-8 text-blue-600" />
              </div>
              Edit Course
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Update your course details below
            </p>
            {formData.title && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Currently editing: <strong>{formData.title}</strong>
              </p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-6 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="text-red-700 dark:text-red-300 text-sm">
                {typeof error === "string"
                  ? error
                  : (error as any)?.message ||
                    (error as any)?.err?.message ||
                    JSON.stringify(error)}
              </span>
            </div>
          )}

          {activeTab === "reviews" ? (
            <AddReview />
          ) : (
            <form onSubmit={(e) => handleSubmit(e, false)}>
              {/* Tab Content */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                {activeTab === "basic" && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                          Course Title *
                        </label>
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          className={`w-full border rounded-lg px-4 py-3 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formErrors.title
                            ? "border-red-400"
                            : "border-gray-300 dark:border-gray-600"
                            }`}
                          placeholder="Enter course title"
                          required
                        />
                        {formErrors.title && (
                          <p className="mt-1 text-xs text-red-600">
                            {formErrors.title}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                          Course Subtitle
                        </label>
                        <input
                          type="text"
                          name="subtitle"
                          value={formData.subtitle}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 dark:text-gray-200 dark:border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter course subtitle"
                        />
                      </div>
                    </div>
                    <div className="mt-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        Course Position
                      </label>
                      <input
                        type="number"
                        name="coursePosition"
                        value={formData.coursePosition}
                        onChange={handleInputChange}
                        min={0}
                        className={`w-full border rounded-lg px-4 py-3 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formErrors.coursePosition
                          ? "border-red-400"
                          : "border-gray-300 dark:border-gray-600"
                          }`}
                        placeholder="Enter course position (numeric)"
                      />
                      {formErrors.coursePosition && (
                        <p className="mt-1 text-xs text-red-600">{formErrors.coursePosition}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        Course Description *
                      </label>
                      <QuillEditor
                        value={description}
                        onChange={setDescription}
                        placeholder="Describe your course in detail..."
                      />
                      {formErrors.description && (
                        <p className="mt-2 text-xs text-red-600">
                          {formErrors.description}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "details" && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Course Details</h3>
                    <CategorySubcategoryDropdowns
                      selectedCategoryId={formData.categoryId}
                      selectedSubcategoryId={formData.subCategoryId}
                      onCategoryChange={handleCategoryChange}
                      onSubcategoryChange={handleSubcategoryChange}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                          Level
                        </label>
                        <select
                          name="level"
                          value={typeof formData.level == "string" && formData.level ? formData.level : "beginner"}
                          onChange={handleInputChange}
                          className="w-full border dark:text-gray-200 border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                          Duration (mins) *
                        </label>
                        <input
                          type="number"
                          name="duration"
                          value={formData.duration}
                          onChange={handleInputChange}
                          className={`w-full border dark:text-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent border-gray-300 dark:border-gray-600`}
                          placeholder="Enter duration in minutes"
                          min={1}
                          step={1}
                          onWheel={(e) => e.currentTarget.blur()}
                          onInput={(e) => {
                            const value = e.currentTarget.value;
                            if (value && value.includes(".")) {
                              e.currentTarget.value = value.split(".")[0];
                            }
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-600" />
                          Enrolled Students Count
                        </label>
                        <input
                          type="number"
                          name="enrolledStudentsCount"
                          value={formData.enrolledStudentsCount}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === "" || /^\d+$/.test(value)) {
                              handleInputChange(e);
                            }
                          }}
                          step="1"
                          min="0"
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Number of enrolled students"
                          onWheel={(e) => e.currentTarget.blur()}
                          onInput={(e) => {
                            const value = e.currentTarget.value;
                            if (value && value.includes(".")) {
                              e.currentTarget.value = value.split(".")[0];
                            }
                          }}
                        />
                      </div>
                    </div>

                    {/* Learning Outcomes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        What You'll Learn (Learning Outcomes)
                      </label>
                      <div className="space-y-2">
                        {(formData.learningOutcomes || []).map((outcome, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={outcome}
                              onChange={(e) => {
                                const updated = [...(formData.learningOutcomes || [])];
                                updated[index] = e.target.value;
                                setFormData({ ...formData, learningOutcomes: updated });
                              }}
                              className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter learning outcome"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const updated = (formData.learningOutcomes || []).filter((_, i) => i !== index);
                                setFormData({ ...formData, learningOutcomes: updated });
                              }}
                              className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              learningOutcomes: [...(formData.learningOutcomes || []), ""]
                            });
                          }}
                          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add Learning Outcome
                        </button>
                      </div>
                    </div>

                    {/* Target Audience */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        Who This Course Is For (Target Audience)
                      </label>
                      <div className="space-y-2">
                        {(formData.targetAudience || []).map((audience, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={audience}
                              onChange={(e) => {
                                const updated = [...(formData.targetAudience || [])];
                                updated[index] = e.target.value;
                                setFormData({ ...formData, targetAudience: updated });
                              }}
                              className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter target audience"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const updated = (formData.targetAudience || []).filter((_, i) => i !== index);
                                setFormData({ ...formData, targetAudience: updated });
                              }}
                              className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              targetAudience: [...(formData.targetAudience || []), ""]
                            });
                          }}
                          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add Target Audience
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "media" && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Media Files</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FileUpload
                        label="Thumbnail Image * (1280x720px)"
                        accept="image/*"
                        onFileChange={setThumbnailFile}
                        currentFile={thumbnailFile}
                        existingUrl={formData.thumbnail}
                        onClearExisting={() => setFormData((prev: any) => ({ ...prev, thumbnail: "" }))}
                        icon={Image}
                      />
                      <FileUpload
                        label="Cover Image (1920x1080px)"
                        accept="image/*"
                        onFileChange={setCoverImageFile}
                        currentFile={coverImageFile}
                        existingUrl={formData.coverImage}
                        onClearExisting={() => setFormData((prev: any) => ({ ...prev, coverImage: "" }))}
                        icon={Image}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FileUpload
                        label="Vertical Carousel Image (1080x1350px)"
                        accept="image/*"
                        onFileChange={setVerticalCarouselImageFile}
                        currentFile={verticalCarouselImageFile}
                        existingUrl={formData.verticalCarouselImage}
                        onClearExisting={() => setFormData((prev: any) => ({ ...prev, verticalCarouselImage: "" }))}
                        icon={Image}
                      />
                      <FileUpload
                        label="Featured Image Banner (1920x1080px)"
                        accept="image/*"
                        onFileChange={setFeaturedImageBannerFile}
                        currentFile={featuredImageBannerFile}
                        existingUrl={formData.featuredImageBanner}
                        onClearExisting={() => setFormData((prev: any) => ({ ...prev, featuredImageBanner: "" }))}
                        icon={Image}
                      />
                    </div>
                    <DemoVideoInput
                      videoType={demoVideoType}
                      setVideoType={setDemoVideoType}
                      videoUrl={demoVideoUrl}
                      setVideoUrl={(url) => {
                        setDemoVideoUrl(url);
                        setFormErrors((prev: any) => ({ ...prev, demoVideoUrl: "" }));
                      }}
                      videoFile={demoVideoFile}
                      setVideoFile={(file) => {
                        setDemoVideoFile(file);
                        setFormErrors((prev: any) => ({ ...prev, demoVideoFile: "" }));
                      }}
                      currentVideoUrl={formData.demoVideo}
                      baseUrl={baseUrl}
                      error={formErrors.demoVideoUrl || formErrors.demoVideoFile}
                    />
                  </div>
                )}

                {activeTab === "pricing" && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Pricing</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          Price *
                        </label>
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (
                              value === "" ||
                              /^\d+(\.\d{0,2})?$/.test(value)
                            ) {
                              handleInputChange(e);
                            }
                          }}
                          className={`w-full border rounded-lg px-4 py-3 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formErrors.price ? "border-red-400" : "border-gray-300 dark:border-gray-600"
                            }`}
                          placeholder="Enter price"
                          required
                          step="0.01"
                          min="0"
                          onWheel={(e) => e.currentTarget.blur()}
                        />
                        {formErrors.price && (
                          <p className="mt-1 text-xs text-red-600">
                            {formErrors.price}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          Sale Price
                        </label>
                        <input
                          type="number"
                          name="salePrice"
                          value={formData.salePrice}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (
                              value === "" ||
                              /^\d+(\.\d{0,2})?$/.test(value)
                            ) {
                              handleInputChange(e);
                            }
                          }}
                          className={`w-full border rounded-lg px-4 py-3 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formErrors.salePrice ? "border-red-400" : "border-gray-300 dark:border-gray-600"
                            }`}
                          placeholder="Enter Sale price"
                          required
                          step="0.01"
                          min="0"
                          onWheel={(e) => e.currentTarget.blur()}
                        />
                        {formErrors.salePrice && (
                          <p className="mt-1 text-xs text-red-600">
                            {formErrors.salePrice}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                          Currency
                        </label>
                        <select
                          name="currency"
                          value={formData.currency}
                          onChange={handleInputChange}
                          className="w-full border dark:text-gray-200 border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option className="dark:text-black" value="INR">
                            INR (₹)
                          </option>
                        </select>
                      </div>

                      {/* Show / Hide Lifetime Plan Toggle */}
                      <div className="col-span-full p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-between">
                        <div>
                          <label className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            Show Lifetime Full Access Plan on Frontend
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Enable to offer the permanent Lifetime Access plan. Disable if you only want to offer duration plans (e.g. 1 Year, 6 Months) and hide the Lifetime Access plan.
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.showLifetimePlan !== false}
                            onChange={(e) => setFormData((prev: any) => ({ ...prev, showLifetimePlan: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                    {/* --- Plans Section --- */}
                    <div className="mt-8">
                      <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-2">
                        Course Plans
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-7 gap-3 mb-2">
                        <input
                          type="text"
                          placeholder="Plan Name"
                          value={planForm.name}
                          onChange={e => setPlanForm({ ...planForm, name: e.target.value })}
                          className="border rounded px-2 py-2 text-sm"
                        />
                        <input
                          type="number"
                          placeholder="Price"
                          value={planForm.price}
                          onChange={e => setPlanForm({ ...planForm, price: e.target.value })}
                          className="border rounded px-2 py-2 text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Description"
                          value={planForm.description}
                          onChange={e => setPlanForm({ ...planForm, description: e.target.value })}
                          className="border rounded px-2 py-2 text-sm"
                        />
                        <select
                          value={planForm.durationType}
                          onChange={e => setPlanForm({ ...planForm, durationType: e.target.value })}
                          className="border rounded px-2 py-2 text-sm"
                        >
                          <option value="Month">Month</option>
                          <option value="Year">Year</option>
                          <option value="Day">Day</option>
                        </select>
                        <input
                          type="number"
                          placeholder="Duration"
                          value={planForm.duration}
                          onChange={e => setPlanForm({ ...planForm, duration: e.target.value })}
                          className="border rounded px-2 py-2 text-sm"
                        />
                        <input
                          type="number"
                          placeholder="Sale Price"
                          value={planForm.salePrice}
                          onChange={e => setPlanForm({ ...planForm, salePrice: e.target.value })}
                          className="border rounded px-2 py-2 text-sm"
                        />
                        <select
                          value={planForm.status}
                          onChange={e => setPlanForm({ ...planForm, status: e.target.value })}
                          className="border rounded px-2 py-2 text-sm"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleAddOrUpdatePlan}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
                        >
                          {editingPlanIdx !== null ? "Update Plan" : "Add Plan"}
                        </button>
                        {editingPlanIdx !== null && (
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm font-medium dark:bg-gray-700 dark:text-gray-200"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                      {planFormError && (
                        <div className="text-xs text-red-600 mt-1">{planFormError}</div>
                      )}
                      {plans.length > 0 && (
                        <div className="mt-4">
                          <table className="w-full text-sm border">
                            <thead>
                              <tr className="bg-gray-100 dark:bg-gray-700">
                                <th className="p-2">Name</th>
                                <th className="p-2">Price</th>
                                <th className="p-2">Description</th>
                                <th className="p-2">Duration Type</th>
                                <th className="p-2">Duration</th>
                                <th className="p-2">Sale Price</th>
                                <th className="p-2">Status</th>
                                <th className="p-2"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {plans.map((plan, idx) => (
                                <tr key={idx}>
                                  <td className="p-2">{plan.name}</td>
                                  <td className="p-2">{plan.price}</td>
                                  <td className="p-2">{plan.description}</td>
                                  <td className="p-2">{plan.durationType}</td>
                                  <td className="p-2">{plan.duration}</td>
                                  <td className="p-2">{plan.salePrice}</td>
                                  <td className="p-2">{plan.status}</td>
                                  <td className="p-2">
                                    <button
                                      type="button"
                                      onClick={() => handleEditPlan(idx)}
                                      className="text-blue-500 hover:underline mr-2"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleRemovePlan(idx)}
                                      className="text-red-500 hover:underline"
                                    >
                                      Remove
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                    {/* --- End Plans Section --- */}
                  </div>
                )}

                {activeTab === "features" && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Course Features</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="certificateTemplate"
                          checked={formData.certificateTemplate}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                        />
                        <Award className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-gray-700 dark:text-gray-200">
                          Certificate Available
                        </span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="isDownloadable"
                          checked={formData.isDownloadable}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                        />
                        <Download className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-gray-700 dark:text-gray-200">
                          Downloadable Content
                        </span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="courseForum"
                          checked={formData.courseForum}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                        />
                        <MessageCircle className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-gray-700 dark:text-gray-200">
                          Course Forum
                        </span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="isPrivate"
                          checked={formData.isPrivate}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                        />
                        <Lock className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-gray-700 dark:text-gray-200">
                          Private Course
                        </span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="isFeatured"
                          checked={formData.isFeatured}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-yellow-500 border-gray-300 dark:border-gray-600 rounded focus:ring-yellow-500"
                        />
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-200">
                          Featured Course
                        </span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="enableWaitlist"
                          checked={formData.enableWaitlist}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                        />
                        <Users className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-gray-700 dark:text-gray-200">
                          Enable Waitlist
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                {activeTab === "tags" && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Course Tags</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        Course Tags *
                      </label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {predefinedTags.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => addTag(tag)}
                            className={`px-3 py-1 rounded-full text-sm transition-colors ${selectedTags.includes(tag)
                              ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-600"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                              }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={customTag}
                          onChange={(e) => setCustomTag(e.target.value)}
                          className="flex-1 border dark:text-gray-200 border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Add custom tag"
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addCustomTag();
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={addCustomTag}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      {formErrors.tags && (
                        <p className="mt-1 text-xs text-red-600">
                          {formErrors.tags}
                        </p>
                      )}
                    </div>
                    {selectedTags.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                          Selected Tags:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedTags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 rounded-full text-sm"
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "seo" && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">SEO Content</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        SEO Meta Description
                      </label>
                      <textarea
                        name="seoMetaDescription"
                        value={formData.seoMetaDescription}
                        onChange={handleInputChange}
                        rows={3}
                        className={`w-full border dark:text-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formErrors.seoMetaDescription
                          ? "border-red-400"
                          : "border-gray-300 dark:border-gray-600"
                          }`}
                        placeholder="Enter meta description for search engines (max 160 characters)"
                        maxLength={160}
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formData.seoMetaDescription.length}/160 characters
                      </p>
                      {formErrors.seoMetaDescription && (
                        <p className="mt-1 text-xs text-red-600">
                          {formErrors.seoMetaDescription}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        SEO Content
                      </label>
                      <QuillEditor
                        value={seoContent}
                        onChange={setSeoContent}
                        placeholder="Add SEO-friendly content for better search rankings..."
                      />
                      {formErrors.seoContent && (
                        <p className="mt-2 text-xs text-red-600">
                          {formErrors.seoContent}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "modules" && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Course Modules</h3>
                    {console?.log("modules 0987", modules)}
                    <ModuleSection
                      modules={modules}
                      onModulesChange={handleModulesChange}
                      courseId={courseId}
                    />
                  </div>
                )}

                {activeTab === "faqs" && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">FAQs</h3>
                    <Faqs courseId={courseId} />
                  </div>
                )}

                {activeTab === "mentor" && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Mentor Information</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                          Mentor Name
                        </label>
                        <input
                          type="text"
                          name="mentorName"
                          value={formData.mentorName || ""}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter mentor name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                          Mentor Title
                        </label>
                        <input
                          type="text"
                          name="mentorTitle"
                          value={formData.mentorTitle || ""}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., Digital Marketing Expert"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        Mentor Description
                      </label>
                      <QuillEditor
                        value={formData.mentorDescription || ""}
                        onChange={(value) => setFormData({ ...formData, mentorDescription: value })}
                        placeholder="Enter mentor description"
                      />
                    </div>

                    <div>
                      <FileUpload
                        label="Mentor Image (400x400px)"
                        accept="image/*"
                        onFileChange={(file) => {
                          setFormData({ ...formData, mentorImageFile: file });
                        }}
                        currentFile={formData.mentorImageFile || null}
                        existingUrl={formData.mentorImage}
                        onClearExisting={() => setFormData({ ...formData, mentorImage: "" })}
                        icon={Image}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        Mentor Achievements
                      </label>
                      <div className="space-y-2">
                        {(formData.mentorAchievements || []).map((achievement, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={achievement}
                              onChange={(e) => {
                                const updated = [...(formData.mentorAchievements || [])];
                                updated[index] = e.target.value;
                                setFormData({ ...formData, mentorAchievements: updated });
                              }}
                              className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter achievement"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const updated = (formData.mentorAchievements || []).filter((_, i) => i !== index);
                                setFormData({ ...formData, mentorAchievements: updated });
                              }}
                              className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              mentorAchievements: [...(formData.mentorAchievements || []), ""]
                            });
                          }}
                          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add Achievement
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        Social Links
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">LinkedIn</label>
                          <input
                            type="url"
                            value={formData.mentorSocialLinks?.linkedin || ""}
                            onChange={(e) => setFormData({
                              ...formData,
                              mentorSocialLinks: {
                                ...(formData.mentorSocialLinks || {}),
                                linkedin: e.target.value
                              }
                            })}
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
                            placeholder="https://linkedin.com/in/..."
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">YouTube</label>
                          <input
                            type="url"
                            value={formData.mentorSocialLinks?.youtube || ""}
                            onChange={(e) => setFormData({
                              ...formData,
                              mentorSocialLinks: {
                                ...(formData.mentorSocialLinks || {}),
                                youtube: e.target.value
                              }
                            })}
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
                            placeholder="https://youtube.com/..."
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Twitter</label>
                          <input
                            type="url"
                            value={formData.mentorSocialLinks?.twitter || ""}
                            onChange={(e) => setFormData({
                              ...formData,
                              mentorSocialLinks: {
                                ...(formData.mentorSocialLinks || {}),
                                twitter: e.target.value
                              }
                            })}
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
                            placeholder="https://twitter.com/..."
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Website</label>
                          <input
                            type="url"
                            value={formData.mentorSocialLinks?.website || ""}
                            onChange={(e) => setFormData({
                              ...formData,
                              mentorSocialLinks: {
                                ...(formData.mentorSocialLinks || {}),
                                website: e.target.value
                              }
                            })}
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
                            placeholder="https://example.com"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "landingPage" && (
                  <LandingPageSections formData={formData} setFormData={setFormData} />
                )}

                {activeTab === "certificate" && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Certificate Settings</h3>

                    {/* Certificate Preview */}
                    {!formData.certificateImage && (
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                          Certificate Preview
                        </label>
                        <div className="w-full max-w-4xl mx-auto bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg shadow-2xl p-8 border-4 border-amber-400">
                          {/* Certificate Header */}
                          <div className="bg-gradient-to-r from-[#0f172a] via-[#1e3a8a] to-[#0f172a] text-white py-5 px-6 rounded-t-lg mb-6 text-center border-b-2 border-amber-400">
                            <span className="text-[10px] font-bold text-amber-300 uppercase tracking-[0.3em]">HAPPY LIFE ACADEMY</span>
                            <h3 className="text-2xl font-bold mt-1 text-white">
                              {(formData as any).certificateTitle || "Certificate of Completion"}
                            </h3>
                            <p className="text-amber-200 text-xs mt-1 tracking-wider uppercase">
                              {(formData as any).certificateSubtitle || "Awarded for Excellence"}
                            </p>
                          </div>

                          {/* Certificate Body */}
                          <div className="py-8 px-6 text-center">
                            <p className="text-gray-800 text-lg leading-relaxed mb-8">
                              {(() => {
                                const recipientName = (formData as any).certificateRecipientName || "Student Name";
                                let description = (formData as any).certificateDescription ||
                                  `This certificate is awarded to **${recipientName}** for successfully completing the course.`;

                                // Replace any instance of "Student Name" (with or without **) with the actual recipient name
                                description = description.replace(/Student Name/g, recipientName);

                                return description.split('**').map((part: string, index: number) =>
                                  index % 2 === 1 ? (
                                    <strong key={index} className="text-[#1e3a8a] font-bold">
                                      {part || recipientName}
                                    </strong>
                                  ) : (
                                    <span key={index}>{part}</span>
                                  )
                                );
                              })()}
                            </p>

                            {/* Certificate Footer */}
                            <div className="mt-12 flex justify-between items-end border-t-2 border-amber-300 pt-6 text-left">
                              <div>
                                <p className="font-bold text-gray-800">
                                  {(formData as any).certificateIssuerName || (formData as any).mentorName || "Authorized Instructor"}
                                </p>
                                {((formData as any).certificateIssuerTitle || (formData as any).mentorTitle) && (
                                  <p className="text-sm text-gray-600">
                                    {(formData as any).certificateIssuerTitle || (formData as any).mentorTitle}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-[#1e3a8a]">
                                  {(formData as any).certificateOrganization || "Happy Life Academy"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          This preview shows how the certificate will look with your current settings. The recipient name shown is the placeholder value.
                        </p>
                      </div>
                    )}

                    <div>
                      <FileUpload
                        label="Certificate Image (Custom Design / Template)"
                        accept="image/*"
                        onFileChange={(file) => {
                          setFormData({ ...formData, certificateImageFile: file });
                        }}
                        currentFile={formData.certificateImageFile || null}
                        existingUrl={formData.certificateImage}
                        onClearExisting={() => setFormData({ ...formData, certificateImage: "" })}
                        icon={Image}
                        helperText="Used instead of the default template"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                          Certificate Title
                        </label>
                        <input
                          type="text"
                          name="certificateTitle"
                          value={formData.certificateTitle || "Certificate of Completion"}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
                          placeholder="Certificate of Completion"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                          Certificate Subtitle
                        </label>
                        <input
                          type="text"
                          name="certificateSubtitle"
                          value={formData.certificateSubtitle || "Awarded for Excellence"}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
                          placeholder="Awarded for Excellence"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        Certificate Description
                      </label>
                      <textarea
                        name="certificateDescription"
                        value={formData.certificateDescription || ""}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
                        placeholder="This certificate is awarded to **Student Name** for successfully completing the course."
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Use **text** for bold text (e.g., **Student Name** will be bold)
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                          Default Recipient Name (Placeholder)
                        </label>
                        <input
                          type="text"
                          name="certificateRecipientName"
                          value={formData.certificateRecipientName || "Student Name"}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
                          placeholder="Student Name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                          Certificate Organization
                        </label>
                        <input
                          type="text"
                          name="certificateOrganization"
                          value={formData.certificateOrganization || "Happy Life Academy"}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
                          placeholder="Happy Life Academy"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                          Issuer Name
                        </label>
                        <input
                          type="text"
                          name="certificateIssuerName"
                          value={formData.certificateIssuerName || formData.mentorName || ""}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
                          placeholder="Instructor Name"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Leave empty to use mentor name
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                          Issuer Title
                        </label>
                        <input
                          type="text"
                          name="certificateIssuerTitle"
                          value={formData.certificateIssuerTitle || formData.mentorTitle || ""}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
                          placeholder="Instructor Title"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Leave empty to use mentor title
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "publication" && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Publication Status</h3>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                      <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
                        Publication Status
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-400 mb-3">
                        Choose whether to publish your course immediately or save as draft.
                      </p>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="isPublished"
                          checked={formData.isPublished}
                          // Only update local state, do NOT call handleSubmit here
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setFormData((prev) => ({
                              ...prev,
                              isPublished: checked,
                            }));
                            setFormErrors((prev) => ({ ...prev, isPublished: "" }));
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                        />
                        <Eye className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-gray-700 dark:text-gray-200">
                          Publish Course
                        </span>
                      </label>
                    </div>
                    {formData.isPublished && (
                      <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="font-medium text-green-900 dark:text-green-300">
                            Ready to Publish
                          </span>
                        </div>
                        <p className="text-sm text-green-700 dark:text-green-400">
                          Your course will be visible to students once published.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex justify-end bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Update Course
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div >
      </div >
    </>
  );
};

export default EditCourse;