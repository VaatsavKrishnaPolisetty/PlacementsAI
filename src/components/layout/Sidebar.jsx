import React, { useState } from 'react';
import Icon from '../common/Icons';

export default function Sidebar({ activeTab, setActiveTab, currentRole = 'student' }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const studentMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', badge: null },
    { id: 'profile', label: 'My Profile & Resume', icon: 'user', badge: 'Verified' },
    { id: 'jobs', label: 'Job Opportunities', icon: 'briefcase', badge: 'Active' },
    { id: 'applications', label: 'My Applications', icon: 'file-text', badge: null },
    { id: 'interviews', label: 'Interview Schedule', icon: 'calendar', badge: null },
    { id: 'notifications', label: 'Notifications', icon: 'bell', badge: null },
  ];

  const adminMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', badge: null },
    { id: 'pipeline', label: 'Placement Pipeline', icon: 'pipeline', badge: '6 Stages' },
    { id: 'interviews', label: 'Interview Schedule', icon: 'calendar', badge: '14' },
    { id: 'analytics', label: 'Analytics & Gaps', icon: 'analytics', badge: null },
    { id: 'notifications', label: 'Alerts & Conflicts', icon: 'bell', badge: '2' },
    { id: 'agents', label: 'Autonomous Agents', icon: 'agent', badge: '5 Active' },
  ];

  const menuItems = currentRole === 'student' ? studentMenuItems : adminMenuItems;

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-slate-900 border-r border-slate-800 text-white transition-all duration-300 z-40 flex flex-col ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/40">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Icon name={currentRole === 'student' ? 'user' : 'agent'} className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold tracking-tight text-white leading-none">
                {currentRole === 'student' ? 'StudentPortal' : 'AutoPlacement'}
              </h2>
              <span className="text-[10px] text-indigo-400 font-semibold tracking-wider uppercase">
                {currentRole === 'student' ? 'Career Agent' : 'AI Agent Hub'}
              </span>
            </div>
          </div>
        )}

        {isCollapsed && (
          <div className="w-8 h-8 mx-auto rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Icon name={currentRole === 'student' ? 'user' : 'agent'} className="w-5 h-5" />
          </div>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ${
            isCollapsed ? 'hidden' : 'block'
          }`}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Icon name="chevron-left" className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="p-3 space-y-1.5 flex-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all duration-150 cursor-pointer group relative ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon
                name={item.icon}
                className={`w-4 h-4 transition-transform group-hover:scale-110 flex-shrink-0 ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'
                }`}
              />
              {!isCollapsed && <span className="flex-1 text-left truncate">{item.label}</span>}
              {!isCollapsed && item.badge && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isActive
                      ? 'bg-indigo-700/80 text-white'
                      : item.id === 'notifications'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Mode Banner Footer */}
      {!isCollapsed && (
        <div className="p-3 m-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-semibold">Active Mode</span>
            <span className="badge badge-info text-[9px] font-bold">
              {currentRole === 'student' ? 'Student' : 'Admin'}
            </span>
          </div>
          <p className="text-[10px] text-slate-500">
            {currentRole === 'student' ? 'Viewing as Rahul Verma' : 'Viewing as Placement Admin'}
          </p>
        </div>
      )}

      {/* Toggle button in collapsed mode */}
      {isCollapsed && (
        <div className="p-3 flex justify-center border-t border-slate-800">
          <button
            onClick={() => setIsCollapsed(false)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Expand sidebar"
          >
            <Icon name="chevron-right" className="w-4 h-4" />
          </button>
        </div>
      )}
    </aside>
  );
}
