import React from 'react';
import {
  LayoutDashboard,
  FileCode2,
  Users2,
  CalendarCheck,
  Building2,
  Send,
  BarChart3,
  Orbit,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  Clock
} from 'lucide-react';

export type NavigationTab =
  | 'command-center'
  | 'drives-eligibility'
  | 'candidate-matching'
  | 'interviews-schedule'
  | 'panel-rooms'
  | 'notifications'
  | 'analytics-reports';

interface SidebarProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  pendingApprovalsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  pendingApprovalsCount
}) => {
  const menuItems = [
    {
      id: 'command-center' as NavigationTab,
      label: 'Ops Command Center',
      icon: LayoutDashboard,
      badge: '3D Live',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
    },
    {
      id: 'drives-eligibility' as NavigationTab,
      label: 'AI JD & Eligibility',
      icon: FileCode2,
      badge: undefined
    },
    {
      id: 'candidate-matching' as NavigationTab,
      label: 'Candidate Match & Cosmos',
      icon: Orbit,
      badge: '3D Galaxy',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
    },
    {
      id: 'interviews-schedule' as NavigationTab,
      label: 'Smart Multi-Round Scheduler',
      icon: CalendarCheck,
      badge: undefined
    },
    {
      id: 'panel-rooms' as NavigationTab,
      label: 'Panels & 3D Venues',
      icon: Building2,
      badge: undefined
    },
    {
      id: 'notifications' as NavigationTab,
      label: 'Student Comms Hub',
      icon: Send,
      badge: undefined
    },
    {
      id: 'analytics-reports' as NavigationTab,
      label: 'Readiness & Analytics',
      icon: BarChart3,
      badge: 'Export'
    }
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-slate-800/80 bg-[#07090e]/70 backdrop-blur-xl p-4 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-65px)]">
      <div className="space-y-6">
        {/* Section Title */}
        <div>
          <div className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-2">
            Operations & AI Pipelines
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-600/90 text-white shadow-lg shadow-indigo-600/20 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider border ${
                        isActive ? 'bg-white/20 text-white border-white/30' : item.badgeColor || 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Human in the loop action widget */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-b from-indigo-950/40 to-slate-900/60 border border-indigo-500/20 shadow-inner">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Human-in-the-Loop</span>
            </div>
            {pendingApprovalsCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-[11px] font-black flex items-center justify-center animate-bounce">
                {pendingApprovalsCount}
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            {pendingApprovalsCount > 0
              ? `${pendingApprovalsCount} waiver & scheduling actions need your review.`
              : 'All automated operations running smoothly with zero pending exceptions.'}
          </p>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
        <span>TPO Autonomous v2.6</span>
        <span className="flex items-center gap-1 text-emerald-400 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Synchronized
        </span>
      </div>
    </aside>
  );
};
