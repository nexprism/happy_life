import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { fetchOverview } from "../../store/slices/dashboard";
import axiosInstance from "../../services/axiosConfig";
import toast from "react-hot-toast";
import {
  BookOpen,
  Users,
  MessageSquare,
  HelpCircle,
  TrendingUp,
  DollarSign,
  Calendar,
  IndianRupee,
  Eye,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Clock,
  UserPlus,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const Home: React.FC = () => {
  const dispatch = useAppDispatch();
  const { overview, loading, error } = useAppSelector(
    (state) => state.dashboard
  );


  const navigate = useNavigate();
  const [showRegisterBtn, setShowRegisterBtn] = useState<boolean>(true);
  const [updatingSetting, setUpdatingSetting] = useState<boolean>(false);
  const [whatsappLink, setWhatsappLink] = useState<string>('');
  const [savingWhatsappLink, setSavingWhatsappLink] = useState<boolean>(false);

  useEffect(() => {
    dispatch(fetchOverview());

    // Fetch current settings
    const fetchSettings = async () => {
      try {
        const response = await axiosInstance.get('/settings/all');
        const s = response.data?.settings;
        if (s) {
          if (s.showLandingRegisterButton !== undefined) {
            setShowRegisterBtn(Boolean(s.showLandingRegisterButton));
          }
          if (s.whatsappCommunityLink) {
            setWhatsappLink(String(s.whatsappCommunityLink));
          }
        }
      } catch (err) {
        console.error("Failed to fetch settings:", err);
      }
    };

    fetchSettings();
  }, [dispatch]);

  const handleToggleRegisterButton = async () => {
    const nextVal = !showRegisterBtn;
    setShowRegisterBtn(nextVal);
    setUpdatingSetting(true);
    try {
      await axiosInstance.put('/settings', {
        showLandingRegisterButton: nextVal
      });
      toast.success(nextVal ? 'Landing Register Button is now VISIBLE on Home Screen' : 'Landing Register Button is now HIDDEN from Home Screen');
    } catch (err) {
      setShowRegisterBtn(!nextVal); // Rollback on error
      toast.error('Failed to update setting');
      console.error(err);
    } finally {
      setUpdatingSetting(false);
    }
  };

  const handleSaveWhatsappLink = async () => {
    if (!whatsappLink.trim()) {
      toast.error('Please enter a valid WhatsApp group link');
      return;
    }
    setSavingWhatsappLink(true);
    try {
      await axiosInstance.put('/settings', {
        whatsappCommunityLink: whatsappLink.trim()
      });
      toast.success('WhatsApp Community Link saved successfully!');
    } catch (err) {
      toast.error('Failed to save WhatsApp link');
      console.error(err);
    } finally {
      setSavingWhatsappLink(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex items-center space-x-2 text-red-800">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Error loading dashboard</span>
          </div>
          <p className="text-red-600 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (!overview) return null;

  const { counts, latest } = overview;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'Inr',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-orange-100 text-orange-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <Clock className="w-3 h-3" />;
      case "resolved":
        return <CheckCircle className="w-3 h-3" />;
      default:
        return <AlertCircle className="w-3 h-3" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome back! Here's what's happening with your platform.
          </p>
        </div>

        {/* Website Controls & Feature Toggles */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className={`p-3 rounded-xl transition-colors ${showRegisterBtn ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-base font-semibold text-gray-900">
                  Landing Page Register Button
                </h3>
                <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                  showRegisterBtn ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {showRegisterBtn ? 'Visible' : 'Hidden'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Toggle the fixed circular register button on the bottom right of the landing page.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 self-end sm:self-center">
            <span className="text-xs font-medium text-gray-500">
              {updatingSetting ? 'Saving...' : showRegisterBtn ? 'Enabled' : 'Disabled'}
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={showRegisterBtn}
                disabled={updatingSetting}
                onChange={handleToggleRegisterButton}
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* WhatsApp Community Link Setting */}
        <div className="bg-white rounded-xl shadow-sm border border-emerald-100 p-5 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-3">
            <div className="flex items-center space-x-3.5">
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  WhatsApp Community Link
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Students will receive this link to join your community group immediately after payment and in their dashboard.
                </p>
              </div>
            </div>
            {whatsappLink && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                <span>Test Link</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-3">
            <div className="relative flex-1">
              <input
                type="url"
                value={whatsappLink}
                onChange={(e) => setWhatsappLink(e.target.value)}
                placeholder="https://chat.whatsapp.com/..."
                className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-gray-800 placeholder-gray-400"
              />
            </div>
            <button
              onClick={handleSaveWhatsappLink}
              disabled={savingWhatsappLink}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              {savingWhatsappLink ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save WhatsApp Link</span>
              )}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex sm:flex-row items-center sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Courses
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {counts?.totalCourses}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex sm:flex-row items-center sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Students
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {counts?.totalStudents}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex sm:flex-row items-center sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Support Tickets
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {counts?.totalSupportTickets}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <HelpCircle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex sm:flex-row items-center sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Forum Threads
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {counts?.totalForumThreads}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Sales Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex sm:flex-row items-center sm:items-center justify-between gap-4 mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Sales Overview
              </h3>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {counts?.todaySales}
                </p>
                <p className="text-sm text-gray-600">Today</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {counts?.thisMonthSales}
                </p>
                <p className="text-sm text-gray-600">This Month</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {counts?.thisYearSales}
                </p>
                <p className="text-sm text-gray-600">This Year</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {counts?.totalSales}
                </p>
                <p className="text-sm text-gray-600">All Time</p>
              </div>
            </div>
          </div>

          <div className="bg-[#2171B5] rounded-xl shadow-sm p-6 text-white">
            <div className="flex sm:flex-row items-center sm:items-center justify-between gap-4 mb-4">
              <h3 className="text-lg font-semibold">Platform Revenue</h3>
              <IndianRupee className="w-5 h-5 text-white/90" />
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">
                {formatCurrency(counts?.platformIncome)}
              </p>
              <p className="text-blue-100 text-sm mt-1">
                Total Revenue Generated
              </p>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Latest Courses */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex sm:flex-row items-center sm:items-center justify-between gap-4 mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Latest Courses
              </h3>
              <Eye className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {latest?.courses?.slice(0, 3).map((course) => (
                <div key={course._id} className="flex items-start space-x-3">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-12 h-12 rounded-lg object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iOCIgZmlsbD0iI0Y3RjhGQSIvPgo8cGF0aCBkPSJNMjQgMTZWMzJNMzIgMjRIMTYiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPC9zdmc+";
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {course.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(course.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <button
            onClick={()=>navigate('/courses/all/courses')}
            className="w-full mt-4 flex items-center justify-center space-x-2 text-sm text-blue-600 hover:text-blue-700 py-2">
              <span>View All Courses</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Support Tickets */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex sm:flex-row items-center sm:items-center justify-between gap-4 mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Tickets
              </h3>
              <HelpCircle className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {latest?.supportTickets?.slice(0, 3).map((ticket) => (
                <div
                  key={ticket?._id}
                  className="border-l-4 border-blue-500 pl-4"
                >
                  <div className="flex sm:flex-row items-center sm:items-center justify-between gap-4 mb-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {ticket?.subject?.substring(0, 30)}...
                    </p>
                    <span
                      className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        ticket?.status
                      )}`}
                    >
                      {getStatusIcon(ticket?.status)}
                      <span className="capitalize">{ticket?.status}</span>
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {ticket?.userId?.fullName}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDate(ticket?.createdAt)}
                  </p>
                </div>
              ))}
            </div>
            <button 
            onClick={()=>navigate('/requests')}
            className="w-full mt-4 flex items-center justify-center space-x-2 text-sm text-blue-600 hover:text-blue-700 py-2">
              <span>View All Tickets</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Forum Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex sm:flex-row items-center sm:items-center justify-between gap-4 mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Forum Activity
              </h3>
              <MessageSquare className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {latest?.forumThreads?.slice(0, 3)?.map((thread) => (
                <div key={thread._id} className="space-y-2">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium text-purple-600">
                        {thread?.createdBy?.fullName.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {thread.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {thread?.createdBy?.fullName}
                      </p>
                      {thread?.courseId && (
                        <p className="text-xs text-gray-400 truncate">
                          in {thread?.courseId?.title}
                        </p>
                      )}
                      <p className="text-xs text-gray-400">
                        {formatDate(thread.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
