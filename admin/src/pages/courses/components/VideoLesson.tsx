import React, { useState, useEffect, ChangeEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  UploadCloud,
  FileVideo,
  Loader2,
  CheckCircle2,
  X,
  Clock,
  AlertCircle,
  Play,
  Upload,
  Video,
  MonitorPlay,
  Sparkles,
  Check,
  XCircle,
  Info,
  Link2,
  Code
} from "lucide-react";
import {
  uploadVideo,
  updateVideo,
} from "../../../store/slices/vedio";
import axiosInstance from "../../../services/axiosConfig";

// Fixed interface to match your store structure
interface RootState {
  vedio: {
    loading: boolean;
    error: string | null;
    data: any;
  };
}

// Fixed props interface to include fileId
type VideoLessonProps = {
  lessonId: string;
  videoId?: string;
  fileId?: string; // Added this missing prop
  onClose: () => void;
  onSaveSuccess?: (data: any) => void;
};

const VimeoIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.396 7.164c-.093 2.026-1.507 4.8-4.245 8.32C15.323 19.161 12.927 21 10.97 21c-1.214 0-2.24-1.12-3.079-3.359-.56-2.053-1.119-4.106-1.68-6.159-.622-2.24-1.29-3.36-2.004-3.36-.156 0-.7.328-1.634.981L1.447 7.76c1.183-1.04 2.348-2.08 3.498-3.12 1.588-1.37 2.756-2.099 3.504-2.19 1.868-.216 3.018.995 3.454 3.633.468 2.83.794 4.593.98 5.289.56 2.38 1.166 3.57 1.82 3.57.5 0 1.246-.778 2.243-2.334.996-1.556 1.525-2.738 1.588-3.546.124-1.306-.374-1.96-1.5-1.96-.53 0-1.074.124-1.634.373 1.09-3.577 3.176-5.308 6.257-5.195 2.274.093 3.348 1.54 3.224 4.34z" />
  </svg>
);

const sourcePlatforms = [
  {
    value: "videocypher",
    label: "VdoCipher",
    subtitle: "DRM Stream & Upload",
    icon: MonitorPlay,
    activeBorder: "border-blue-500 bg-blue-50/70 ring-2 ring-blue-500/20 shadow-sm",
    iconColor: "text-blue-600",
    checkColor: "text-blue-600",
  },
  {
    value: "youtube",
    label: "YouTube",
    subtitle: "Public / Unlisted Link",
    icon: Play,
    activeBorder: "border-red-500 bg-red-50/70 ring-2 ring-red-500/20 shadow-sm",
    iconColor: "text-red-600",
    checkColor: "text-red-600",
  },
  {
    value: "vimeo",
    label: "Vimeo",
    subtitle: "Standard & Privacy Hash",
    icon: VimeoIcon,
    activeBorder: "border-sky-500 bg-sky-50/70 ring-2 ring-sky-500/20 shadow-sm",
    iconColor: "text-sky-500",
    checkColor: "text-sky-500",
  },
];

// Enhanced popup component with better animations
const EnhancedPopup: React.FC<{
  isVisible: boolean;
  message: string;
  type: string;
  onClose: () => void;
  autoClose?: boolean;
}> = ({ isVisible, message, type, onClose, autoClose = true }) => {
  useEffect(() => {
    if (isVisible && autoClose && type === "success") {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, autoClose, type, onClose]);

  if (!isVisible) return null;

  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-800";
      case "error":
        return "bg-gradient-to-r from-red-50 to-rose-50 border-red-200 text-red-800";
      case "warning":
        return "bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200 text-amber-800";
      case "info":
        return "bg-gradient-to-r from-blue-50 to-sky-50 border-blue-200 text-blue-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      case "info":
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="fixed inset-0  bg-transparent backdrop-blur-xs transition-opacity flex items-center justify-center z-50 p-4">
      <div className={`max-w-md w-full rounded-xl border-2 p-6 max-h-[700px] overflow-scroll shadow-xl transform transition-all duration-300 scale-100 ${getTypeStyles()}`}>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium leading-relaxed">
              {message}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {type === "success" && (
          <div className="mt-4 bg-white bg-opacity-60 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-green-700">
              <Clock className="w-4 h-4" />
              <span>Processing will continue in the background</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Upload progress component
const UploadProgress: React.FC<{
  isVisible: boolean;
  progress: number;
  fileName: string;
  stage: string;
}> = ({ isVisible, progress, fileName, stage }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-xs transition-opacity flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
            <Upload className="w-8 h-8 text-white animate-pulse" />
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Uploading to VdoCipher
          </h3>
          
          <p className="text-sm text-gray-600 mb-6">
            {fileName}
          </p>
          
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="flex justify-between text-sm text-gray-500 mb-4">
            <span>{stage}</span>
            <span>{progress}%</span>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <Sparkles className="w-4 h-4" />
              <span>This may take a few minutes depending on file size</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const VideoLesson: React.FC<VideoLessonProps> = ({
  lessonId,
  videoId,
  fileId,
  onClose,
  onSaveSuccess,
}) => {
  const dispatch = useDispatch();

  const { data, loading, error } = useSelector(
    (state: RootState) => state.vedio
  );

  const [form, setForm] = useState({
    title: "",
    description: "",
    sourcePlatform: "",
    file: null as File | null,
    videoId: "",
    secureUrl: "",
    embedUrl: "",
    originalUrl: "",
    youtubeUrl: "",
    vimeoUrl: "",
    vimeoInputType: "direct" as "direct" | "embed",
    vimeoEmbedCode: "",
    vdocipherVideoId: "", // Added for existing VdoCipher videos
    uploadMethod: "file", // Added to track upload method: "file" or "videoId"
    thumbnail: "",
    quality: "auto",
    status: "",
  });
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [popup, setPopup] = useState({
    isVisible: false,
    message: "",
    type: "",
  });

  const [uploadProgress, setUploadProgress] = useState({
    isVisible: false,
    progress: 0,
    fileName: "",
    stage: "Preparing upload...",
  });

  // Mock upload progress simulation
  const uploadInChunks = async (file: File) => {
    const CHUNK_SIZE = 100 * 1024 * 1024; // 100MB
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    const fileId = `${file.name}-${Date.now()}`;

    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(file.size, start + CHUNK_SIZE);
      const chunk = file.slice(start, end);

      const formData = new FormData();
      formData.append("chunk", chunk);

      await axiosInstance.post("/chunk/upload-chunk", formData, {
        headers: {
          "content-type": "multipart/form-data",
          "fileid": fileId,
          "chunkindex": i.toString(),
          "totalchunks": totalChunks.toString(),
        },
        onUploadProgress: (e) => {
          const progress = Math.round(((i + e.loaded / e.total!) / totalChunks) * 100);
          setUploadProgress({
            isVisible: true,
            progress,
            fileName: file.name,
            stage: `Uploading chunk ${i + 1}/${totalChunks} (est. ${Math.ceil((totalChunks - i) * 2)} min left)...`,
          });
        },
        timeout: 3600000, // Increased timeout to 60 seconds for large chunks
      });
    }

    // Merge chunks
    const { data } = await axiosInstance.post("/chunk/merge-chunks", {
      fileId,
      fileName: file.name,
      totalChunks,
    }, {
      timeout: 3600000, // 1 hour timeout for merging large files
    });

    setUploadProgress({
      isVisible: false,
      progress: 100,
      fileName: file.name,
      stage: "Done",
    });

    showSuccessMessage();
    console?.log("data", data)

    return data.filePath; // <--- Return merged file path
  };

  const showSuccessMessage = () => {
    setPopup({
      isVisible: true,
      message: "Video uploaded successfully! 🎉 Your video is now being processed by VdoCipher. You can check back in a few minutes to see the processed video with optimized streaming quality.",
      type: "success",
    });
  };

  // Enhanced getData function to handle VdoCipher data structure
  const getData = async () => {
    try {
      setIsEditMode(true);
      const response = await axiosInstance.get(`/video/${fileId}`);
      const videoData = response.data.data;
      
        const isVimeoEmbed = videoData.uploadMethod === "embed" || 
          videoData.vimeoInputType === "embed" ||
          Boolean(videoData.vimeoEmbedCode) ||
          Boolean(videoData.vimeoUrl && (videoData.vimeoUrl.includes("player.vimeo.com") || videoData.vimeoUrl.includes("<iframe"))) ||
          Boolean(videoData.embedUrl && videoData.embedUrl.includes("player.vimeo.com") && (!videoData.vimeoUrl || videoData.vimeoUrl.includes("player.vimeo.com")));

        const loadedDirectUrl = !isVimeoEmbed 
          ? (videoData.vimeoUrl || (videoData.sourcePlatform === "vimeo" && videoData.originalUrl && !videoData.originalUrl.includes("player.vimeo.com") ? videoData.originalUrl : ""))
          : "";

        const loadedEmbedCode = isVimeoEmbed
          ? (videoData.vimeoEmbedCode || (videoData.vimeoUrl && videoData.vimeoUrl.includes("player.vimeo.com") ? videoData.vimeoUrl : "") || videoData.embedUrl || videoData.originalUrl || "")
          : "";

        setForm({
          title: videoData.title || "",
          description: videoData.description || "",
          sourcePlatform: videoData.sourcePlatform || "",
          file: null,
          videoId: videoData.videoId || "", // VdoCipher video ID
          secureUrl: videoData.secureUrl || "",
          embedUrl: videoData.secureUrl || "", // Use secureUrl for embed
          originalUrl: videoData.secureUrl || "",
          youtubeUrl: videoData.youtubeUrl || (videoData.sourcePlatform === "youtube" ? (videoData.originalUrl || videoData.secureUrl || "") : ""),
          vimeoUrl: loadedDirectUrl,
          vimeoInputType: isVimeoEmbed ? "embed" : "direct",
          vimeoEmbedCode: loadedEmbedCode,
          vdocipherVideoId: videoData.videoId || "", // Set for existing video ID mode
          uploadMethod: videoData.uploadMethod === "existing_video_id" ? "videoId" : "file",
          thumbnail: videoData.thumbnail || "",
          quality: videoData.quality || "auto",
          status: videoData.status || "",
        });
      
      console.log("Fetched VdoCipher video data:", videoData);
    } catch (error) {
      console.error("Error fetching video data:", error);
      setPopup({
        isVisible: true,
        message: "Failed to fetch video data",
        type: "error",
      });
    }
  };

  useEffect(() => {
    if (fileId) {
      getData();
    }
  }, [fileId]);

  useEffect(() => {
    if (isEditMode && data && !loading && !error) {
      const isVimeoEmbed = data.uploadMethod === "embed" || 
        data.vimeoInputType === "embed" ||
        Boolean(data.vimeoEmbedCode) ||
        Boolean(data.vimeoUrl && (data.vimeoUrl.includes("player.vimeo.com") || data.vimeoUrl.includes("<iframe"))) ||
        Boolean(data.embedUrl && data.embedUrl.includes("player.vimeo.com") && (!data.vimeoUrl || data.vimeoUrl.includes("player.vimeo.com")));

      const loadedDirectUrl = !isVimeoEmbed 
        ? (data.vimeoUrl || (data.sourcePlatform === "vimeo" && data.originalUrl && !data.originalUrl.includes("player.vimeo.com") ? data.originalUrl : ""))
        : "";

      const loadedEmbedCode = isVimeoEmbed
        ? (data.vimeoEmbedCode || (data.vimeoUrl && data.vimeoUrl.includes("player.vimeo.com") ? data.vimeoUrl : "") || data.embedUrl || data.originalUrl || "")
        : "";

      setForm({
        title: data.title || "",
        description: data.description || "",
        sourcePlatform: data.sourcePlatform || "",
        file: null,
        videoId: data.videoId || "",
        secureUrl: data.secureUrl || "",
        embedUrl: data.embedUrl || data.secureUrl || "",
        originalUrl: data.originalUrl || data.secureUrl || "",
        youtubeUrl: data.youtubeUrl || (data.sourcePlatform === "youtube" ? (data.originalUrl || data.secureUrl || "") : ""),
        vimeoUrl: loadedDirectUrl,
        vimeoInputType: isVimeoEmbed ? "embed" : "direct",
        vimeoEmbedCode: loadedEmbedCode,
        vdocipherVideoId: data.videoId || "",
        uploadMethod: data.uploadMethod === "existing_video_id" ? "videoId" : "file",
        thumbnail: data.thumbnail || "",
        quality: data.quality || "auto",
        status: data.status || "",
      });
    }
  }, [data, isEditMode, loading, error]);

  useEffect(() => {
    if (!loading && (data || error)) {
      if (data && !error) {
        if (onSaveSuccess) onSaveSuccess(data);
      } else if (error) {
        setPopup({
          isVisible: true,
          message: `Failed to ${isEditMode ? "update" : "upload"} video: ${error}`,
          type: "error",
        });
      }
    }
  }, [data, error, loading, isEditMode, onSaveSuccess]);

  const extractVimeoUrl = (input: string): string => {
    if (!input || typeof input !== "string") return "";
    const trimmed = input.trim();
    // Extract src from <iframe ... src="..." ...> if an iframe embed code was pasted
    const iframeMatch = trimmed.match(/<iframe[^>]+src=["']([^"']+)["']/i);
    if (iframeMatch && iframeMatch[1]) {
      return iframeMatch[1].replace(/&amp;/g, "&").trim();
    }
    return trimmed;
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, files } = e.target as any;
    if (name === "file") {
      setForm((prev) => ({ ...prev, file: files?.[0] || null }));
    } else if (name === "vimeoUrl") {
      setForm((prev) => ({ ...prev, vimeoUrl: value }));
    } else if (name === "vimeoEmbedCode") {
      setForm((prev) => ({ ...prev, vimeoEmbedCode: value }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const isValidYouTubeUrl = (url: string): boolean => {
    const youtubeRegex =
      /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)[\w-]+/;
    return youtubeRegex.test(url);
  };

  const isValidVimeoUrl = (url: string): boolean => {
    if (!url || typeof url !== "string") return false;
    const clean = extractVimeoUrl(url);
    const vimeoRegex =
      /^(https?:\/\/)?(www\.|player\.)?vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^\/]+\/videos\/|album\/(?:\d+\/)?video\/|video\/|manage\/videos\/)?(\d+)(?:\/([a-zA-Z0-9_-]+))?(\?.*)?$/i;
    const directIdRegex = /^\d+(?:\/[a-zA-Z0-9_-]+)?$/;
    return vimeoRegex.test(clean) || directIdRegex.test(clean);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      setPopup({
        isVisible: true,
        message: "Please enter a video title.",
        type: "error",
      });
      return;
    }
    
    if (!form.sourcePlatform) {
      setPopup({
        isVisible: true,
        message: "Please select a source platform.",
        type: "error",
      });
      return;
    }

    // Enhanced validation for VdoCipher, YouTube, and Vimeo
    if (form.sourcePlatform === "youtube") {
      if (!form.youtubeUrl.trim()) {
        setPopup({
          isVisible: true,
          message: "Please enter a YouTube URL.",
          type: "error",
        });
        return;
      }
      if (!isValidYouTubeUrl(form.youtubeUrl)) {
        setPopup({
          isVisible: true,
          message: "Please enter a valid YouTube URL.",
          type: "error",
        });
        return;
      }
    } else if (form.sourcePlatform === "vimeo") {
      const activeRaw = form.vimeoInputType === "embed" ? form.vimeoEmbedCode : form.vimeoUrl;
      const cleanVimeo = extractVimeoUrl(activeRaw);
      if (!cleanVimeo) {
        setPopup({
          isVisible: true,
          message: form.vimeoInputType === "embed"
            ? "Please enter a Vimeo embedded link or iframe code."
            : "Please enter a Vimeo URL or Video ID.",
          type: "error",
        });
        return;
      }
      if (!isValidVimeoUrl(cleanVimeo)) {
        setPopup({
          isVisible: true,
          message: form.vimeoInputType === "embed"
            ? "Please enter a valid Vimeo embed player link or iframe code."
            : "Please enter a valid Vimeo URL or Video ID.",
          type: "error",
        });
        return;
      }
    } else if (form.sourcePlatform === "videocypher") {
      if (form.uploadMethod === "file") {
        // For new uploads, file is required
        if (!isEditMode && !form.file) {
          setPopup({
            isVisible: true,
            message: "Please select a video file to upload.",
            type: "error",
          });
          return;
        }
      } else if (form.uploadMethod === "videoId") {
        // For existing video ID, validate the ID
        if (!form.vdocipherVideoId.trim()) {
          setPopup({
            isVisible: true,
            message: "Please enter a VdoCipher Video ID.",
            type: "error",
          });
          return;
        }
        // Basic validation for video ID format (alphanumeric)
        const videoIdPattern = /^[a-zA-Z0-9]+$/;
        if (!videoIdPattern.test(form.vdocipherVideoId.trim())) {
          setPopup({
            isVisible: true,
            message: "Please enter a valid VdoCipher Video ID (alphanumeric characters only).",
            type: "error",
          });
          return;
        }
      }
    }

    try {
      let response;
      
      // Handle VdoCipher video ID linking (no file upload needed)
      if (form.sourcePlatform == "videocypher" && form.uploadMethod == "videoId") {
        const videoData = {
          lessonId,
          sourcePlatform: form.sourcePlatform,
          title: form.title,
          description: form.description,
          videoId: form.vdocipherVideoId.trim(),
          uploadMethod: "existing_video_id",
          quality: form.quality || "auto",
        };

        if (isEditMode && (fileId || videoId)) {
          response = await dispatch(
            updateVideo({
              videoId: (fileId || videoId)!,
              lessonId: videoData.lessonId,
              sourcePlatform: videoData.sourcePlatform,
              title: videoData.title,
              description: videoData.description,
              uploadMethod: videoData.uploadMethod,
              quality: videoData.quality,
              vdocipherVideoId: videoData.videoId,
              filePath: "", // No file path needed for video ID linking
              accessToken: "",
              refreshToken: "",
            }) as any
          );
        } else {
          response = await dispatch(
            uploadVideo({
              lessonId: videoData.lessonId,
              sourcePlatform: videoData.sourcePlatform,
              title: videoData.title,
              description: videoData.description,
              uploadMethod: videoData.uploadMethod,
              quality: videoData.quality,
              videoId: videoData.videoId,
              filePath: "", // No file path needed for video ID linking
              accessToken: "",
              refreshToken: "",
            }) as any
          );
        }

        if (response.payload?.success) {
          setPopup({
            isVisible: true,
            message: "VdoCipher video linked successfully! 🎬 Your existing video is now available for streaming.",
            type: "success",
          });
          setTimeout(() => {
            handleClose();
          }, 1500);
        } else {
          setPopup({
            isVisible: true,
            message: `Failed to link VdoCipher video: ${
              response.payload?.message || "Please verify the Video ID is correct and the video is in ready state."
            }`,
            type: "error",
          });
        }
        return;
      }
      
      if (isEditMode && (fileId || videoId)) {
        // For VdoCipher updates, we need to use the correct ID
        const updateId = fileId || videoId;
        
        // Show confirmation if replacing video file
        if (form.file && form.sourcePlatform === "videocypher") {
          const confirmReplace = window.confirm(
            `Are you sure you want to replace the current video with "${form.file.name}"? This action cannot be undone.`
          );
          if (!confirmReplace) {
            return;
          }
        }

        let finalPath = "";
        
        // Only upload chunks for VdoCipher file uploads in edit mode
        if (form.sourcePlatform === "videocypher" && form.uploadMethod === "file" && form.file) {
          console.log("Starting chunked upload for file:", form.file.name);
          finalPath = await uploadInChunks(form.file);
          console?.log("finalPath", finalPath);
        }

        const isVimeo = form.sourcePlatform === "vimeo";
        const isEmbed = isVimeo && form.vimeoInputType === "embed";
        const vimeoDirectValue = isVimeo && !isEmbed ? extractVimeoUrl(form.vimeoUrl) : "";
        const vimeoEmbedValue = isVimeo && isEmbed ? form.vimeoEmbedCode : "";

        response = await dispatch(
          updateVideo({
            videoId: updateId!, // Use fileId for VdoCipher updates
            ...(form.file && { file: form.file }),
            lessonId,
            sourcePlatform: form.sourcePlatform,
            title: form.title,
            description: form.description,
            uploadMethod: form.sourcePlatform === "videocypher" && form.uploadMethod === "videoId"
              ? "existing_video_id"
              : "file",
            filePath: finalPath,
            youtubeUrl: form.sourcePlatform === "youtube" ? form.youtubeUrl : undefined,
            vimeoUrl: isVimeo ? vimeoDirectValue : undefined,
            vimeoEmbedCode: isVimeo ? vimeoEmbedValue : undefined,
            vimeoInputType: isVimeo ? form.vimeoInputType : undefined,
            // Include VdoCipher specific fields if updating VdoCipher video
            ...(form.sourcePlatform === "videocypher" && {
              quality: form.quality,
              thumbnail: form.thumbnail,
              replaceVideo: !!form.file, // Flag to indicate video replacement
              ...(form.uploadMethod === "videoId" && {
                vdocipherVideoId: form.vdocipherVideoId.trim(),
              }),
            }),
            accessToken: "",
            refreshToken: "",
          }) as any
        );
      } else {
        let finalPath = "";
        
        // Only upload chunks for VdoCipher file uploads
        if (form.sourcePlatform === "videocypher" && form.uploadMethod === "file" && form.file) {
          finalPath = await uploadInChunks(form.file);
        }
        
        const isVimeo = form.sourcePlatform === "vimeo";
        const isEmbed = isVimeo && form.vimeoInputType === "embed";
        const vimeoDirectValue = isVimeo && !isEmbed ? extractVimeoUrl(form.vimeoUrl) : "";
        const vimeoEmbedValue = isVimeo && isEmbed ? form.vimeoEmbedCode : "";

        response = await dispatch(
          uploadVideo({
            ...(form.file && { file: form.file }),
            lessonId,
            sourcePlatform: form.sourcePlatform,
            title: form.title,
            description: form.description,
            filePath: finalPath,
            uploadMethod: form.sourcePlatform === "videocypher" && form.uploadMethod === "videoId"
              ? "existing_video_id"
              : "file",
            youtubeUrl: form.sourcePlatform === "youtube" ? form.youtubeUrl : undefined,
            vimeoUrl: isVimeo ? vimeoDirectValue : undefined,
            vimeoEmbedCode: isVimeo ? vimeoEmbedValue : undefined,
            vimeoInputType: isVimeo ? form.vimeoInputType : undefined,
            // Include VdoCipher specific fields if uploading to VdoCipher
            ...(form.sourcePlatform === "videocypher" && {
              quality: form.quality || "auto",
              ...(form.uploadMethod === "videoId" && {
                videoId: form.vdocipherVideoId.trim(),
              }),
            }),
            accessToken: "",
            refreshToken: "",
          }) as any
        );
      }
      
      console.log("Video operation response:", response);
      
      // For YouTube and Vimeo, show immediate success without progress
      if (form.sourcePlatform === "youtube" || form.sourcePlatform === "vimeo") {
        const platformName = form.sourcePlatform === "youtube" ? "YouTube" : "Vimeo";
        if (response.payload?.success) {
          setPopup({
            isVisible: true,
            message: `${platformName} video linked successfully! 🎬 Your video is now available for streaming.`,
            type: "success",
          });
          // Close after a short delay to show success message
          setTimeout(() => {
            handleClose();
          }, 1500);
        } else {
          setPopup({
            isVisible: true,
            message: `Failed to ${isEditMode ? "update" : "link"} ${platformName} video: ${
              response.payload?.message || response.payload?.error || "Unknown error"
            }`,
            type: "error",
          });
        }
      } else {
        if (form.sourcePlatform === "videocypher") {
          // For VdoCipher, the success message is shown by showSuccessMessage after upload simulation
          if (response.payload?.success) {
            showSuccessMessage();
            // Close after a short delay to show success message
            setTimeout(() => {
              handleClose();
            }, 1500);
          }
        }
        // For VdoCipher, the success message is shown by showSuccessMessage after upload simulation
        else if (!response.payload?.success) {
          setUploadProgress(prev => ({ ...prev, isVisible: false }));
          setPopup({
            isVisible: true,
            message: `Failed to ${isEditMode ? "update" : "upload"} video: ${
              response.payload?.message || "Unknown error"
            }`,
            type: "error",
          });
        }
      }
    } catch (error: unknown) {
      console.error("Error saving video:", error);
      setUploadProgress(prev => ({ ...prev, isVisible: false }));
      setPopup({
        isVisible: true,
        message: `Failed to ${isEditMode ? "update" : "upload"} video: ${
          error instanceof Error ? error.message : "Network error"
        }`,
        type: "error",
      });
    }
  };

  const handleClose = () => {
    setPopup({ isVisible: false, message: "", type: "" });
    onClose();
  };

  // Enhanced render function to show VdoCipher status
  const renderVdoCipherInfo = () => {
    if (form.sourcePlatform === "videocypher" && isEditMode) {
      return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-5 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <MonitorPlay className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-blue-900">VdoCipher Video Details</h4>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Video ID</p>
              <p className="font-mono text-blue-800">{form.videoId || "N/A"}</p>
            </div>
            <div>
              <p className="text-gray-600">Status</p>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                form.status === 'ready' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {form.status === 'ready' ? (
                  <>
                    <Check className="w-3 h-3 mr-1" />
                    Ready
                  </>
                ) : (
                  <>
                    <Clock className="w-3 h-3 mr-1" />
                    Processing
                  </>
                )}
              </span>
            </div>
            <div>
              <p className="text-gray-600">Quality</p>
              <p className="text-blue-800 capitalize">{form.quality}</p>
            </div>
            <div>
              <p className="text-gray-600">Secure Streaming</p>
              <p className="text-green-600 font-medium">
                {form.secureUrl ? "✓ Enabled" : "Setting up..."}
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderSourceInput = () => {
    if (form.sourcePlatform === "youtube") {
      return (
        <div className="space-y-2.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
            YouTube URL <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="url"
              name="youtubeUrl"
              value={form.youtubeUrl}
              onChange={handleChange}
              className="w-full pl-11 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
              placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
              required
            />
            <Play className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-500 fill-current" />
          </div>
          {form.youtubeUrl && !isValidYouTubeUrl(form.youtubeUrl) && (
            <div className="flex items-center gap-1.5 text-red-600 text-xs">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Please enter a valid YouTube video URL</span>
            </div>
          )}
          {form.youtubeUrl && isValidYouTubeUrl(form.youtubeUrl) && (
            <div className="flex items-center gap-1.5 text-green-600 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Valid YouTube URL detected</span>
            </div>
          )}
          <div className="bg-red-50/80 border border-red-200/80 rounded-xl p-3">
            <p className="text-xs text-red-800">
              💡 Supports standard YouTube watch URLs and short links (e.g., <code>https://youtu.be/abc123xyz</code>).
            </p>
          </div>
        </div>
      );
    } else if (form.sourcePlatform === "vimeo") {
      const activeEmbedUrl = extractVimeoUrl(form.vimeoEmbedCode);
      const isEmbedValid = Boolean(form.vimeoEmbedCode && isValidVimeoUrl(form.vimeoEmbedCode));
      const isDirectValid = Boolean(form.vimeoUrl && isValidVimeoUrl(form.vimeoUrl));

      const getPreviewSrc = (raw: string) => {
        const clean = extractVimeoUrl(raw);
        if (clean.includes("player.vimeo.com/video/")) return clean;
        const m = clean.match(/(\d+)(?:\/([a-zA-Z0-9_-]+))?/);
        if (m) {
          return m[2]
            ? `https://player.vimeo.com/video/${m[1]}?h=${m[2]}&title=0&byline=0&portrait=0`
            : `https://player.vimeo.com/video/${m[1]}?title=0&byline=0&portrait=0`;
        }
        return clean;
      };

      return (
        <div className="space-y-4">
          {/* Vimeo Method Switcher */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">
              Vimeo Option <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, vimeoInputType: "direct" }))}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                  form.vimeoInputType === "direct"
                    ? "border-sky-500 bg-sky-50/90 text-sky-950 shadow-sm ring-1 ring-sky-500/20"
                    : "border-gray-200 hover:border-gray-300 text-gray-600 bg-white"
                }`}
              >
                <div
                  className={`p-2 rounded-lg flex-shrink-0 ${
                    form.vimeoInputType === "direct" ? "bg-sky-500 text-white" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <Link2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold">Direct Link</div>
                  <div className="text-[11px] text-gray-500 truncate">Vimeo URL / Video ID</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, vimeoInputType: "embed" }))}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                  form.vimeoInputType === "embed"
                    ? "border-sky-500 bg-sky-50/90 text-sky-950 shadow-sm ring-1 ring-sky-500/20"
                    : "border-gray-200 hover:border-gray-300 text-gray-600 bg-white"
                }`}
              >
                <div
                  className={`p-2 rounded-lg flex-shrink-0 ${
                    form.vimeoInputType === "embed" ? "bg-sky-500 text-white" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <Code className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold">Embedded Link</div>
                  <div className="text-[11px] text-gray-500 truncate">Embed Link / &lt;iframe&gt;</div>
                </div>
              </button>
            </div>
          </div>

          {/* Direct Link Option */}
          {form.vimeoInputType === "direct" ? (
            <div className="space-y-2.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                Direct Vimeo URL or ID <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="vimeoUrl"
                  value={form.vimeoUrl}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200"
                  placeholder="https://vimeo.com/123456789 or 123456789/abcdef"
                  required
                />
                <div className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-sky-500">
                  <VimeoIcon className="w-4 h-4" />
                </div>
              </div>

              {form.vimeoUrl && !isDirectValid && (
                <div className="flex items-center gap-1.5 text-red-600 text-xs">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Please enter a valid Vimeo URL (e.g., vimeo.com/123456789 or vimeo.com/123456789/hash)</span>
                </div>
              )}
              {form.vimeoUrl && isDirectValid && (
                <div className="flex items-center gap-1.5 text-green-600 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Valid Direct Vimeo link detected</span>
                </div>
              )}

              <div className="bg-sky-50/80 border border-sky-200/80 rounded-xl p-3">
                <p className="text-xs text-sky-800">
                  💡 Supports direct public links (<code>vimeo.com/123456789</code>) and unlisted links with privacy hash (<code>vimeo.com/123456789/abcdef</code>).
                </p>
              </div>

              {isDirectValid && (
                <div className="overflow-hidden rounded-xl border border-sky-200 bg-sky-50/40 p-2.5">
                  <div className="mb-2 flex items-center justify-between px-1">
                    <span className="text-xs font-semibold text-sky-900 flex items-center gap-1.5">
                      <MonitorPlay className="w-3.5 h-3.5" /> Video Preview
                    </span>
                    <span className="text-[11px] font-mono text-gray-500">
                      ID: {extractVimeoUrl(form.vimeoUrl).match(/(\d+)/)?.[1]}
                    </span>
                  </div>
                  <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black shadow-inner">
                    <iframe
                      src={getPreviewSrc(form.vimeoUrl)}
                      className="w-full h-full border-0"
                      allow="autoplay; fullscreen; picture-in-picture"
                      title="Vimeo Preview"
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Embedded Link Option */
            <div className="space-y-2.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                Vimeo Embedded Link or &lt;iframe&gt; Code <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <textarea
                  name="vimeoEmbedCode"
                  value={form.vimeoEmbedCode}
                  onChange={handleChange}
                  rows={3}
                  className="w-full pl-11 pr-4 py-2.5 text-xs font-mono border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 resize-none"
                  placeholder='Paste Vimeo embed player link (https://player.vimeo.com/video/...) or full <iframe src="https://player.vimeo.com/video/..." ...></iframe>'
                  required
                />
                <div className="absolute left-3.5 top-3 text-sky-500">
                  <Code className="w-4 h-4" />
                </div>
              </div>

              {form.vimeoEmbedCode && !isEmbedValid && (
                <div className="flex items-center gap-1.5 text-red-600 text-xs">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Please enter a valid Vimeo embed code or player URL (player.vimeo.com/video/...)</span>
                </div>
              )}
              {form.vimeoEmbedCode && isEmbedValid && (
                <div className="flex items-center gap-1.5 text-green-600 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Valid Vimeo embedded code/link detected</span>
                </div>
              )}

              <div className="bg-sky-50/80 border border-sky-200/80 rounded-xl p-3">
                <p className="text-xs text-sky-800">
                  💡 Vimeo par video open karke <strong>Share → Copy Embed Code</strong> (ya direct player link <code>player.vimeo.com/video/...</code>) copy karke yahan paste karein.
                </p>
              </div>

              {isEmbedValid && (
                <div className="overflow-hidden rounded-xl border border-sky-200 bg-sky-50/40 p-2.5">
                  <div className="mb-2 flex items-center justify-between px-1">
                    <span className="text-xs font-semibold text-sky-900 flex items-center gap-1.5">
                      <MonitorPlay className="w-3.5 h-3.5" /> Embedded Player Preview
                    </span>
                    <span className="text-[11px] font-mono text-gray-500">
                      ID: {activeEmbedUrl.match(/(\d+)/)?.[1]}
                    </span>
                  </div>
                  <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black shadow-inner">
                    <iframe
                      src={getPreviewSrc(form.vimeoEmbedCode)}
                      className="w-full h-full border-0"
                      allow="autoplay; fullscreen; picture-in-picture"
                      title="Vimeo Embed Preview"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      );
    } else if (form.sourcePlatform === "videocypher") {
      return (
        <div className="space-y-4">
          {/* Upload Method Tabs */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Upload Method *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div
                className={`relative border-2 rounded-xl p-3 cursor-pointer transition-all ${
                  form.uploadMethod === "file"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setForm(prev => ({ ...prev, uploadMethod: "file", vdocipherVideoId: "" }))}
              >
                <div className="flex items-center gap-2">
                  <Upload className={`w-5 h-5 ${
                    form.uploadMethod === "file" ? "text-blue-600" : "text-gray-400"
                  }`} />
                  <span className={`font-medium text-sm ${
                    form.uploadMethod === "file" ? "text-blue-900" : "text-gray-700"
                  }`}>
                    Upload New File
                  </span>
                </div>
                {form.uploadMethod === "file" && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  </div>
                )}
              </div>
              
              <div
                className={`relative border-2 rounded-xl p-3 cursor-pointer transition-all ${
                  form.uploadMethod === "videoId"
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setForm(prev => ({ ...prev, uploadMethod: "videoId", file: null }))}
              >
                <div className="flex items-center gap-2">
                  <MonitorPlay className={`w-5 h-5 ${
                    form.uploadMethod === "videoId" ? "text-green-600" : "text-gray-400"
                  }`} />
                  <span className={`font-medium text-sm ${
                    form.uploadMethod === "videoId" ? "text-green-900" : "text-gray-700"
                  }`}>
                    Use Existing Video
                  </span>
                </div>
                {form.uploadMethod === "videoId" && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* File Upload Section */}
          {form.uploadMethod === "file" && (
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">
                Video File {!isEditMode ? '*' : ''}
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  name="file"
                  accept="video/*"
                  onChange={handleChange}
                  className="hidden"
                  id="video-file"
                  required={!isEditMode}
                />
                <label htmlFor="video-file" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Video className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        {form.file ? form.file.name : "Click to select video file"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        MP4, AVI, MOV up to 2GB
                      </p>
                    </div>
                  </div>
                </label>
              </div>
              
              {form.file && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Selected: {form.file.name}</span>
                  </div>
                </div>
              )}
              
              {isEditMode && !form.file && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-700">
                    💡 Leave empty to keep current video, or select a new file to replace it
                  </p>
                </div>
              )}
              
              {isEditMode && form.file && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-amber-800">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      This will replace the current video with: {form.file.name}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Video ID Section */}
          {form.uploadMethod === "videoId" && (
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">
                VdoCipher Video ID *
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="vdocipherVideoId"
                  value={form.vdocipherVideoId}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 font-mono"
                  placeholder="e.g., 1a2b3c4d5e6f7g8h9i0j"
                  required
                />
                <MonitorPlay className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Info className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-green-900 text-sm">Using Existing VdoCipher Video</h4>
                    <ul className="text-xs text-green-700 space-y-1">
                      <li>• Video must already be uploaded and in "ready" state in VdoCipher</li>
                      <li>• Enter the exact Video ID from your VdoCipher dashboard</li>
                      <li>• This will link the video to your lesson without re-uploading</li>
                      <li>• Make sure the video ID is correct to avoid playback issues</li>
                    </ul>
                  </div>
                </div>
              </div>

              {form.vdocipherVideoId && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Video ID: {form.vdocipherVideoId}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <div className="bg-white rounded-2xl w-full flex flex-col max-h-[85vh] overflow-hidden shadow-2xl border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-5 text-white flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 bg-white/15 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 shadow-sm">
              <FileVideo className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {isEditMode ? "Edit Video Lesson" : "Upload Video Lesson"}
              </h2>
              <p className="text-blue-100 text-xs font-normal">
                {isEditMode ? "Update your video lesson details" : "Add a video to your lesson module"}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
              Video Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="Enter an engaging title for your video"
              required
            />
          </div>
          
          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
              placeholder="Describe what students will learn from this video..."
            />
          </div>
          
          {/* Source Platform */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
              Source Platform <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {sourcePlatforms.map((platform) => {
                const Icon = platform.icon;
                const isSelected = form.sourcePlatform === platform.value;
                return (
                  <div
                    key={platform.value}
                    className={`relative border-2 rounded-xl p-3.5 cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? platform.activeBorder
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50 bg-white"
                    }`}
                    onClick={() => setForm(prev => ({ ...prev, sourcePlatform: platform.value }))}
                  >
                    <input
                      type="radio"
                      name="sourcePlatform"
                      value={platform.value}
                      checked={isSelected}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isSelected ? "bg-white shadow-xs" : "bg-gray-100"}`}>
                        <Icon className={`w-5 h-5 ${platform.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`block font-semibold text-sm leading-snug ${
                          isSelected ? "text-gray-900" : "text-gray-700"
                        }`}>
                          {platform.label}
                        </span>
                        <span className="block text-[11px] text-gray-500 truncate">
                          {platform.subtitle}
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2.5 right-2.5">
                        <CheckCircle2 className={`w-4 h-4 ${platform.checkColor}`} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {isEditMode && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 flex items-center gap-2 text-amber-800 text-xs">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Changing platform will replace the current video stream source</span>
              </div>
            )}
          </div>

          {/* Platform-specific inputs */}
          {form.sourcePlatform && (
            <div className="bg-gray-50/80 border border-gray-200/80 rounded-xl p-4.5">
              {renderSourceInput()}
            </div>
          )}
          
          {/* VdoCipher info */}
          {renderVdoCipherInfo()}
        </div>
        
        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex flex-row items-center justify-between flex-shrink-0 rounded-b-2xl">
          <div className="text-xs text-gray-500">
            <span className="text-red-500">*</span> Required fields
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              type="button"
              className="px-5 py-2 text-sm rounded-xl font-semibold text-gray-700 border-2 border-gray-300 hover:bg-gray-100 transition-all duration-200"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              type="button"
              disabled={loading || uploadProgress.isVisible}
              className={`px-6 py-2 text-sm rounded-xl font-semibold flex items-center gap-2 transition-all duration-200 ${
                loading || uploadProgress.isVisible
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg active:scale-98"
              }`}
            >
              {loading || uploadProgress.isVisible ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isEditMode ? "Updating..." : "Processing..."}
                </>
              ) : (
                <>
                  {form.sourcePlatform === "youtube" || form.sourcePlatform === "vimeo" ? (
                    <Play className="w-4 h-4 fill-current" />
                  ) : (
                    <UploadCloud className="w-4 h-4" />
                  )}
                  {isEditMode
                    ? "Update Video"
                    : form.sourcePlatform === "youtube" || form.sourcePlatform === "vimeo"
                    ? "Link Video"
                    : "Upload Video"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Upload Progress Modal */}
      <UploadProgress
        isVisible={uploadProgress.isVisible}
        progress={uploadProgress.progress}
        fileName={uploadProgress.fileName}
        stage={uploadProgress.stage}
      />
      
      {/* Enhanced Popup */}
      <EnhancedPopup
        message={popup.message}
        type={popup.type}
        isVisible={popup.isVisible}
        onClose={() => setPopup({ isVisible: false, message: "", type: "" })}
      />
    </>
  );
};

export default VideoLesson;