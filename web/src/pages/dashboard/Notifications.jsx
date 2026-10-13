import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markNotificationsRead } from '../../redux/slices/notificationSlice';
import { useLanguage } from '../../context/LanguageContext';

const Notifications = () => {
  const dispatch = useDispatch();
  const { t } = useLanguage();
  const { items: notifications, total, loading } = useSelector((state) => state.notifications);
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    dispatch(fetchNotifications({ page, limit }));
  }, [dispatch, page]);

  const handleMarkAllRead = () => {
    dispatch(markNotificationsRead()).then(() => {
      dispatch(fetchNotifications({ page, limit }));
    });
  };

  const handleNextPage = () => {
    if (page * limit < total) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6 mt-8 px-2">
        <h1 className="text-slate-900 text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors">Notifications</h1>
        <button
          onClick={handleMarkAllRead}
          className="px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-sm font-semibold hover:bg-amber-100 transition-colors"
        >
          {t('markAllRead') || 'Mark All Read'}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {loading && <div className="p-8 text-center text-slate-500">Loading notifications...</div>}
        
        {!loading && notifications.length === 0 && (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No notifications yet</h3>
            <p className="text-slate-500">When you receive updates or alerts, they'll show up here.</p>
          </div>
        )}

        {!loading && notifications.length > 0 && (
          <div className="divide-y divide-slate-100">
            {notifications.map((item, index) => (
              <div 
                key={index} 
                className={`p-6 transition-colors hover:bg-slate-50 flex items-start gap-4 ${item.status === 1 ? 'bg-amber-50/20' : ''}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.status === 1 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {item.status === 1 ? (
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    ) : (
                      <polyline points="20 6 9 17 4 12"></polyline>
                    )}
                  </svg>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <h4 className={`text-base font-bold ${item.status === 1 ? 'text-slate-900' : 'text-slate-700'}`}>
                      {item.data?.title || 'Notification'}
                    </h4>
                    {item.status === 1 && (
                      <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 uppercase tracking-widest">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed mb-2">
                    {item.data?.description || item.data?.body || ''}
                  </p>
                  <p className="text-xs text-slate-400 font-medium">
                    {new Date(item.created_at || item.createdAt || Date.now()).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && total > limit && (
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="text-sm text-slate-500">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevPage}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={handleNextPage}
                disabled={page * limit >= total}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Notifications;
