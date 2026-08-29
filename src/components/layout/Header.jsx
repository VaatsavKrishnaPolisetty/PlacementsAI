import React, { useState, useRef, useEffect } from 'react';
import Icon from '../common/Icons';
import { useToast } from '../common/ToastContext';

export default function Header({
  currentUser,
  currentRole = 'student',
  onToggleRole,
  onOpenAuth,
  notifications = [],
  onNavigateTab,
  searchQuery,
  setSearchQuery,
  onMarkRead,
  onMarkAllRead,
}) {
  const { showToast } = useToast();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isAiActive, setIsAiActive] = useState(true);
  const notifRef = useRef(null);
  const searchRef = useRef(null);

  const unreadNotifications = notifications.filter((n) => !n.isRead && !n.read);
  const unreadCount = unreadNotifications.length;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleAi = () => {
    setIsAiActive(!isAiActive);
    showToast(
      !isAiActive ? 'Autonomous Placement Agents Activated' : 'Autonomous Placement Agents Paused',
      !isAiActive ? 'success' : 'warning'
    );
  };

  return (
    <header className="fixed top-0 right-0 left-64 h-16 glass-header flex items-center justify-between px-6 z-30 transition-all duration-300">
      {/* Left: Portal Title & Role Switcher */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>{currentRole === 'student' ? 'Student Career & Placement Portal' : 'Placement Operations Hub'}</span>
            <span className={`badge text-[10px] font-bold py-0.5 ${currentRole === 'student' ? 'badge-primary' : 'badge-info'}`}>
              {currentRole === 'student' ? 'Candidate View' : 'Admin / TPO'}
            </span>
          </h1>
          <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
            {currentRole === 'student' ? 'AI Matchmaking & Autonomous Coordination' : 'Autonomous Placement Operations System'}
          </p>
        </div>

        {/* Live Agent Status Pulse Pill (Admin only) */}
        {currentRole !== 'student' && (
          <button
            onClick={handleToggleAi}
            className={`hidden lg:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
              isAiActive
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
            }`}
            title="Click to toggle autonomous agents"
          >
            <span className={`w-2 h-2 rounded-full ${isAiActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            <span>{isAiActive ? '5 Agents Active' : 'Agents Paused'}</span>
          </button>
        )}
      </div>

      {/* Right: Search, Notifications, Profile */}
      <div className="flex items-center gap-3.5">

        {/* Search Bar */}
        <div ref={searchRef} className="relative hidden xl:block">
          <div className="flex items-center bg-slate-100/90 border border-slate-200/80 rounded-xl px-3 py-1.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-400 transition-all">
            <Icon name="search" className="w-3.5 h-3.5 text-slate-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none text-xs text-slate-800 placeholder-slate-400 w-36"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="p-0.5 text-slate-400 hover:text-slate-600">
                <Icon name="x" className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Notification Bell with Dropdown */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            aria-label="Open notifications"
          >
            <Icon name="bell" className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold shadow-sm animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Drawer */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 p-4 z-50 animate-slide-up">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">Notifications & Alerts</h4>
                  {unreadCount > 0 && <span className="badge badge-info text-[10px]">{unreadCount} Unread</span>}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={() => {
                        if (onMarkAllRead) onMarkAllRead();
                        showToast('All notifications marked as read', 'info');
                      }}
                      className="text-[11px] font-bold text-indigo-600 hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      onNavigateTab?.('notifications');
                    }}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-900"
                  >
                    View All
                  </button>
                </div>
              </div>

              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {notifications.length === 0 ? (
                  <p className="text-xs text-center text-slate-400 py-6">No notifications yet</p>
                ) : (
                  notifications.slice(0, 5).map((notif) => {
                    const isUnread = !notif.isRead && !notif.read;
                    const isUrgent = notif.priority === 'urgent' || notif.type === 'room_changed' || notif.type === 'interview_update';

                    return (
                      <div
                        key={notif.notificationId || notif.id}
                        onClick={() => {
                          if (onMarkRead) onMarkRead(notif.notificationId || notif.id);
                        }}
                        className={`p-3 rounded-2xl border text-xs transition-colors cursor-pointer space-y-1 ${
                          isUrgent
                            ? 'bg-rose-50/90 border-rose-200 text-rose-950 shadow-2xs'
                            : isUnread
                            ? 'bg-indigo-50/50 border-indigo-100 text-slate-900 font-medium'
                            : 'bg-white border-slate-100 text-slate-600'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-extrabold text-xs">{notif.title}</span>
                          <span className="text-[10px] text-slate-400 font-medium shrink-0">
                            {notif.sentAt ? new Date(notif.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : notif.timestamp || 'Just now'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 line-clamp-2">{notif.message}</p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile / Auth Toggle */}
        <div
          onClick={onOpenAuth}
          className="flex items-center gap-2.5 pl-3 border-l border-slate-200 cursor-pointer hover:opacity-80 transition-opacity"
          title="Click to manage account or switch user"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white text-xs font-black shadow-sm">
            {currentUser?.name ? currentUser.name.split(' ').map((n) => n[0]).join('') : currentRole === 'student' ? 'RV' : 'DS'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-900 leading-tight">
              {currentUser?.name || (currentRole === 'student' ? 'Rahul Verma' : 'Dr. Sharma')}
            </p>
            <p className="text-[10px] font-bold text-indigo-600">
              {currentRole === 'student' ? (currentUser?.studentId || 'STU101 (Student)') : 'Placement Head'}
            </p>
          </div>
        </div>

      </div>
    </header>
  );
}
