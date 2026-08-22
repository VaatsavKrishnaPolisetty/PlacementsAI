import React, { useState } from 'react';
import Icon from '../common/Icons';
import { useToast } from '../common/ToastContext';

export default function NotificationCenter({ notifications = [], onMarkAllRead, onResolveConflict }) {
  const [filter, setFilter] = useState('all');
  const { showToast } = useToast();

  const getNotifIcon = (type) => {
    switch (type) {
      case 'interview_scheduled':
        return { icon: 'calendar', color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200' };
      case 'offer_generated':
        return { icon: 'award', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' };
      case 'conflict_alert':
        return { icon: 'alert-triangle', color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' };
      case 'eligibility_check':
      default:
        return { icon: 'check-circle', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' };
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'all') return true;
    return n.type === filter;
  });

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Alert & Notification Center</h3>
          <p className="text-xs text-slate-500">Autonomous Placement Operations Stream</p>
        </div>
        <button
          onClick={() => {
            onMarkAllRead?.();
            showToast('All notifications marked as read', 'info');
          }}
          className="btn-secondary text-xs py-1.5 px-3"
        >
          <Icon name="check" className="w-3.5 h-3.5" />
          Mark all as read
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4 pb-2 border-b border-slate-100 overflow-x-auto">
        {[
          { id: 'all', label: 'All Notifications' },
          { id: 'unread', label: 'Unread' },
          { id: 'interview_scheduled', label: 'Interviews' },
          { id: 'offer_generated', label: 'Offers' },
          { id: 'conflict_alert', label: 'Conflicts' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filter === f.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notif) => {
            const iconConfig = getNotifIcon(notif.type);
            return (
              <div
                key={notif.id}
                className={`p-4 rounded-xl border transition-all ${
                  notif.read ? 'bg-white border-slate-200' : 'bg-indigo-50/40 border-indigo-200/80 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${iconConfig.bg}`}>
                    <Icon name={iconConfig.icon} className={`w-4 h-4 ${iconConfig.color}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-xs text-slate-900 leading-snug truncate">
                        {notif.title}
                      </h4>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100/80">
                      <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                        <Icon name="clock" className="w-3 h-3" />
                        {notif.timestamp}
                      </span>

                      {notif.type === 'conflict_alert' && (
                        <button
                          onClick={() => onResolveConflict?.(notif)}
                          className="btn-ghost text-[11px] py-0.5 px-2 font-bold"
                        >
                          Resolve Alert →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Icon name="bell" className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">No alerts found</p>
            <p className="text-xs text-slate-400 mt-1">Everything in this category is up to date.</p>
          </div>
        )}
      </div>
    </div>
  );
}
