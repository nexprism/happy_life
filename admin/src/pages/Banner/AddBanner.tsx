import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { createBanner } from "../../store/slices/banner";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

const AddBanner: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [mobileImage, setMobileImage] = useState<File | null>(null);
  const [isActive, setIsActive] = useState(true);

  const bannerLoading = useAppSelector((state) => state.banner.loading);
  const bannerError = useAppSelector((state) => state.banner.error);
  const banners = useAppSelector((state) => state.banner.banners);
  const [lastBannerId, setLastBannerId] = useState<string | null>(null);
  const prevLoading = React.useRef(bannerLoading);

  useEffect(() => {
    if (prevLoading.current && !bannerLoading && !bannerError) {
      const latestBanner = banners && banners.length > 0 ? banners[0] : null;
      if (latestBanner && latestBanner._id !== lastBannerId) {
        toast.success("Banner added successfully!");
        setLastBannerId(latestBanner._id);
        setTimeout(() => {
          navigate("/banner");
        }, 800);
      }
    }
    prevLoading.current = bannerLoading;
  }, [bannerLoading, bannerError, banners, lastBannerId, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) {
      toast.error("Please select a banner image");
      return;
    }
    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("image", image);
    if (mobileImage) formData.append("mobileImage", mobileImage);
    formData.append("type", "all_events");
    formData.append("isActive", String(isActive));
    formData.append("priority", "0");
    dispatch(createBanner(formData));
  };

  return (
    <div>
      <PageMeta title="Add Banner | LMS Admin" description="Add a new banner for upcoming events" />
      <PageBreadcrumb pageTitle="Add Events Banner" />
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
            Desktop Banner Image (1920x1080px) *
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setImage(e.target.files ? e.target.files[0] : null)
            }
            className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 rounded"
            required
          />
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
        </div>

        <div className="mb-6 flex items-center">
          <input
            type="checkbox"
            id="isActive"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
          />
          <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
            Active (Display on Upcoming Events page)
          </label>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={bannerLoading}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors shadow-sm disabled:opacity-50"
          >
            {bannerLoading ? "Adding..." : "Add Banner"}
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

export default AddBanner;
