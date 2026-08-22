import React from 'react';
import { Bot, Sparkles, Building2, Shield, Bell, Zap, Play, Pause, PlusCircle, CheckCircle2 } from 'lucide-react';
import { PlacementStats } from '../../types/placement';

interface NavbarProps {
  stats: PlacementStats;
  autoPilotEnabled: boolean;
  onToggleAutoPilot: () => void;
  onOpenJDExtractor: () => void;
  pendingApprovalsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  stats,
  autoPilotEnabled,
  onToggleAutoPilot,
  onOpenJDExtractor,
  pendingApprovalsCount
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#07090e]/90 backdrop-blur-xl px-4 lg:px-8 py-3.5 flex items-center justify-between shadow-2xl">
      {/* Brand & AI Identity */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/25">
            <div className="w-full h-full bg-[#0b0f19] rounded-[11px] flex items-center justify-center">
              <Bot className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-white font-['Outfit']">
                CAMPUS<span className="text-indigo-400">AI</span>
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Agentic 3D Ops
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Autonomous Placement & Interview Coordination Agent</p>
          </div>
        </div>
      </div>

      {/* Center Live Telemetry Pills */}
      <div className="hidden xl:flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-400">Active Drives:</span>
          <span className="font-bold text-white">{stats.activeDrives}</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
          <Building2 className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">3D Rooms Occupied:</span>
          <span className="font-bold text-cyan-300">{stats.roomsOccupied} / {stats.totalRooms}</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-400">Human Approvals:</span>
          <span className="font-bold text-amber-300">{pendingApprovalsCount}</span>
        </div>
      </div>

      {/* Right Controls & Quick Actions */}
      <div className="flex items-center gap-3">
        {/* Auto-Pilot Toggle */}
        <button
          onClick={onToggleAutoPilot}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-lg ${
            autoPilotEnabled
              ? 'bg-gradient-to-r from-emerald-600/30 to-cyan-600/30 border-emerald-500/50 text-emerald-300 shadow-emerald-500/10'
              : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
          title="Toggle Autonomous Agent Auto-Pilot"
        >
          {autoPilotEnabled ? (
            <>
              <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400 animate-pulse" />
              <span>Auto-Pilot: Active</span>
            </>
          ) : (
            <>
              <Pause className="w-3.5 h-3.5 text-amber-400" />
              <span>Auto-Pilot: Paused</span>
            </>
          )}
        </button>

        {/* Launch New Drive Button */}
        <button
          onClick={onOpenJDExtractor}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>AI JD Parser</span>
        </button>
      </div>
    </header>
  );
};
