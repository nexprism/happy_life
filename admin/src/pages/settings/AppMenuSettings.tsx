import React, { useState, useEffect } from 'react';
import axiosInstance from '../../services/axiosConfig';
import toast from 'react-hot-toast';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';

interface MenuConfig {
  [key: string]: boolean;
}

const menuCategories = [
  {
    title: 'Learning Hub',
    items: [
      { key: 'mySubmissions', label: 'My Submissions' },
      { key: 'leaderboard', label: 'Leaderboard' },
      { key: 'consultation', label: 'Consultation' },
      { key: 'liveClasses', label: 'Live Classes' },
      { key: 'peerCommunity', label: 'Peer Community' },
      { key: 'myPurchases', label: 'My Purchases' },
      { key: 'myDownloadedNews', label: 'My Downloaded News' },
    ]
  },
  {
    title: 'Tools & Utilities',
    items: [
      { key: 'changePassword', label: 'Change Password' },
      { key: 'changeTheme', label: 'Change Theme' },
      { key: 'eventsAndWorkshops', label: 'Events & Workshops' },
      { key: 'careerTest', label: 'Career Test (Android Only)' },
      { key: 'bookmarks', label: 'Bookmarks (Android Only)' },
    ]
  },
  {
    title: 'Content & Resources',
    items: [
      { key: 'newsAndArticles', label: 'News & Articles' },
      { key: 'messages', label: 'Messages' },
      { key: 'myForumPosts', label: 'My Forum Posts' },
    ]
  },
  {
    title: 'Support & Info',
    items: [
      { key: 'helpAndSupport', label: 'Help & Support' },
      { key: 'aboutUs', label: 'About Us' },
      { key: 'termsAndConditions', label: 'Terms & Conditions' },
      { key: 'privacyPolicy', label: 'Privacy Policy' },
      { key: 'rateUs', label: 'Rate Us' },
    ]
  }
];

const AppMenuSettings: React.FC = () => {
  const [config, setConfig] = useState<MenuConfig>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axiosInstance.get('/settings/all');
      if (response.data?.settings?.appMenuConfig) {
        setConfig(response.data.settings.appMenuConfig);
      } else {
        // Default all to true if missing
        const defaultConfig: MenuConfig = {};
        menuCategories.forEach(cat => cat.items.forEach(item => {
          defaultConfig[item.key] = true;
        }));
        setConfig(defaultConfig);
      }
    } catch (error) {
      toast.error('Failed to load menu settings');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key: string) => {
    setConfig(prev => ({
      ...prev,
      [key]: prev[key] === undefined ? false : !prev[key]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axiosInstance.put('/settings', {
        appMenuConfig: config
      });
      toast.success('App menu settings updated successfully!');
    } catch (error) {
      toast.error('Failed to update menu settings');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading settings...</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <PageMeta title="App Menu Settings | Admin Dashboard" description="Manage visibility of app menu items" />
      <PageBreadcrumb pageTitle="App Menu Settings" />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Mobile App Menu Configuration</h2>
            <p className="text-sm text-gray-500 mt-1">Toggle which items appear in the side menu of the mobile app. Changes require the app to be restarted to take full effect.</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-4 py-2 bg-brand-500 text-white rounded-lg font-medium transition-colors ${saving ? 'opacity-70 cursor-not-allowed' : 'hover:bg-brand-600'}`}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {menuCategories.map((category) => (
            <div key={category.title} className="bg-gray-50 rounded-xl p-5 border border-gray-100">
              <h3 className="font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">{category.title}</h3>
              <div className="space-y-4">
                {category.items.map((item) => {
                  // Default to true if undefined
                  const isChecked = config[item.key] === undefined ? true : config[item.key];
                  
                  return (
                    <label key={item.key} className="flex items-center justify-between cursor-pointer group">
                      <span className="text-sm text-gray-700 font-medium group-hover:text-brand-600 transition-colors">{item.label}</span>
                      <div className="relative inline-flex items-center">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={isChecked}
                          onChange={() => handleToggle(item.key)}
                        />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-brand-300 dark:peer-focus:ring-brand-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-600"></div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AppMenuSettings;
