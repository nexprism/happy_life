import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { fetchBannerById, updateBanner } from "../../store/slices/banner";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

const getAdminImageUrl = (img: string, baseUrl: string) => {
  if (!img) return "";
  if (img.startsWith("http")) return img;
  const clean = img.startsWith("/") ? img.slice(1) : img;
  const path = clean.startsWith("uploads/") ? clean : `uploads/${clean}`;
  return `${baseUrl}/${path}`;
};

const EditBanner: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const [updateRequested, setUpdateRequested] = useState(false);

  const { banner, loading } = useAppSelector((state) => state.banner);
  const [title, setTitle] = useState("");
  const [image, setImage] = useState<string | File>("");
  const [mobileImage, setMobileImage] = useState<string | File | null>(null);
  const [isActive, setIsActive] = useState(true);
  const prevLoading = React.useRef(loading);

  const ImageBaseURL = import.meta.env.VITE_IMAGE_URL || "http://localhost:5000";

  useEffect(() => {
    if (id) dispatch(fetchBannerById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (banner) {
      setTitle(banner.title || "");
      setImage(banner.image || "");
      setMobileImage(banner.mobileImage || null);
      setIsActive(banner.isActive !== undefined ? banner.isActive : true);
    }
  }, [banner]);

  useEffect(() => {
    if (updateRequested && prevLoading.current && !loading) {
      toast.success("Banner updated successfully!");
      setUpdateRequested(false);
      setTimeout(() => {
        navigate("/banner");
      }, 800);
    }
    prevLoading.current = loading;
  }, [loading, updateRequested, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (id) {
      const formData = new FormData();
      formData.append("title", title.trim());
      if (image && typeof image !== "string") formData.append("image", image);
      if (mobileImage && typeof mobileImage !== "string") formData.append("mobileImage", mobileImage);
      formData.append("type", "all_events");
      formData.append("isActive", String(isActive));
      setUpdateRequested(true);
      dispatch(updateBanner({ id, bannerData: formData }));
    }
  };

  return (
    <div>
      <PageMeta
        title="Edit Banner | LMS Admin"
        description="Edit banner details"
      />
      <PageBreadcrumb pageTitle="Edit Events Banner" />
      <form
        onSubmit={handleSubmit}
        className="max-w-xl mx-auto bg-white dark:bg-gray-900 p-6 rounded-xl shadow border border-gray-100 dark:border-gray-800"
      >
        <div className="mb-5">
          <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
            Banner Title <span className="text-xs text-gray-400 font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 rounded focus:ring-2 focus:ring-indigo-500"
            placeholder="Optional title (leave blank for clean image-only banner)"
          />
          <p className="text-xs text-gray-400 mt-1">
            If left blank, the banner image will be displayed without text overlay.
          </p>
        </div>

        <div className="mb-5">
          <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
            Desktop Banner Image (1920x1080px)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files ? e.target.files[0] : "")}
            className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 rounded"
          />
          {typeof image === "string" && image && (
            <div className="mt-2">
              <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Current Preview:</span>
              <img
                src={getAdminImageUrl(image, ImageBaseURL)}
                alt="Current Banner"
                className="w-48 h-28 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "https://placehold.co/600x300?text=Banner+Image";
                }}
              />
            </div>
          )}
        </div>

        <div className="mb-5">
          <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
            Mobile Banner Image (1080x1080px, Optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setMobileImage(e.target.files ? e.target.files[0] : null)
            }
            className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 rounded"
          />
          {typeof mobileImage === "string" && mobileImage && (
            <div className="mt-2">
              <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Current Mobile Preview:</span>
              <img
                src={getAdminImageUrl(mobileImage, ImageBaseURL)}
                alt="Current Mobile Banner"
                className="w-28 h-28 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "https://placehold.co/300x300?text=Mobile+Image";
                }}
              />
            </div>
          )}
        </div>

        <div className="mb-6 flex items-center">
          <input
            type="checkbox"
            id="isActiveEdit"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
          />
          <label htmlFor="isActiveEdit" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
            Active (Display on Upcoming Events page)
          </label>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? "Saving Changes..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/banner")}
            className="px-4 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditBanner;
