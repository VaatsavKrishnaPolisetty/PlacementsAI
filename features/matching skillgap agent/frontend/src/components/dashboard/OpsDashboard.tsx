import React from 'react';
import {
  PlacementStats,
  Room3D,
  AgentActionItem,
  PlacementDrive,
  Student,
  ScheduledInterview
} from '../../types/placement';
import { Campus3DViewer } from '../3d/Campus3DViewer';
import { AgentHologram3D } from '../3d/AgentHologram3D';
import { AgentActionQueue } from './AgentActionQueue';
import { LiveEventFeed } from './LiveEventFeed';
import {
  Building2,
  Users2,
  CalendarCheck,
  Award,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Radio,
  ArrowUpRight,
  Plus
} from 'lucide-react';

interface OpsDashboardProps {
  stats: PlacementStats;
  rooms: Room3D[];
  selectedRoom: Room3D | null;
  onSelectRoom: (room: Room3D) => void;
  actions: AgentActionItem[];
  onApproveAction: (actionId: string) => void;
  onRejectAction: (actionId: string) => void;
  drives: PlacementDrive[];
  students: Student[];
  schedules: ScheduledInterview[];
  onNavigateToTab: (tab: any) => void;
}

export const OpsDashboard: React.FC<OpsDashboardProps> = ({
  stats,
  rooms,
  selectedRoom,
  onSelectRoom,
  actions,
  onApproveAction,
  onRejectAction,
  drives,
  students,
  schedules,
  onNavigateToTab
}) => {
  return (
    <div className="space-y-6">
      {/* Welcome & Live Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-black text-white font-['Outfit'] tracking-tight">
              Placement Operations Command Center
            </h2>
            <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Live Autonomous Grid
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-room interview tracking, AI agent decision pipelines, and student flow coordination
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateToTab('interviews-schedule')}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700"
          >
            <CalendarCheck className="w-4 h-4 text-cyan-400" />
            <span>View Timeline</span>
          </button>

          <button
            onClick={() => onNavigateToTab('candidate-matching')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-cyan-300" />
            <span>3D Talent Cosmos</span>
          </button>
        </div>
      </div>

      {/* High-Level Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl border border-slate-800 p-4 space-y-1 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Registered Pool</span>
            <Users2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{students.length} Candidates</div>
          <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> 100% Eligibility Verified
          </span>
        </div>

        <div className="glass-panel rounded-2xl border border-slate-800 p-4 space-y-1 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Company Drives</span>
            <Building2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-300 font-mono">{drives.length} Drives</div>
          <span className="text-[11px] text-cyan-400 font-semibold">Tier-1 Dream & Super Dream</span>
        </div>

        <div className="glass-panel rounded-2xl border border-slate-800 p-4 space-y-1 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Scheduled Slots Today</span>
            <CalendarCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-indigo-300 font-mono">{schedules.length} Interviews</div>
          <span className="text-[11px] text-indigo-400 font-semibold">0 Scheduling Overlaps</span>
        </div>

        <div className="glass-panel rounded-2xl border border-slate-800 p-4 space-y-1 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">3D Rooms In-Session</span>
            <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-amber-300 font-mono">
            {stats.roomsOccupied} / {stats.totalRooms} Rooms
          </div>
          <span className="text-[11px] text-amber-400 font-semibold">Hardware & AV Active</span>
        </div>
      </div>

      {/* Main 3D Campus Operations Center & 3D Agent Core */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 3D Campus Room Visualizer */}
        <div className="lg:col-span-8 space-y-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
              <Building2 className="w-4 h-4 text-cyan-400" />
              3D Campus Interview Center (Interactive WebGL)
            </h3>
            <span className="text-[11px] text-slate-400">Click room to inspect active interview</span>
          </div>

          <Campus3DViewer
            rooms={rooms}
            selectedRoom={selectedRoom}
            onSelectRoom={onSelectRoom}
          />
        </div>

        {/* 3D Agent Hologram & Quick Status */}
        <div className="lg:col-span-4 space-y-4">
          <div className="px-1">
            <h3 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Autonomous Agent Neural Core
            </h3>
          </div>

          <AgentHologram3D
            statusText="Monitoring 4 Drives & 6 Rooms"
            operationsCount={188}
          />

          {/* Quick Active Drive Mini List */}
          <div className="glass-panel rounded-2xl border border-slate-800 p-4 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Drives Overview
            </div>

            <div className="space-y-2">
              {drives.slice(0, 3).map((drive) => (
                <div
                  key={drive.id}
                  onClick={() => onNavigateToTab('drives-eligibility')}
                  className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-all cursor-pointer text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-md bg-white p-0.5 flex items-center justify-center">
                      <img src={drive.logo} alt={drive.companyName} className="max-h-full max-w-full object-contain" />
                    </div>
                    <div>
                      <span className="font-bold text-white block">{drive.companyName}</span>
                      <span className="text-[10px] text-slate-400">{drive.role.split(' ')[0]}</span>
                    </div>
                  </div>
                  <span className="font-bold text-emerald-400 font-mono text-[11px]">{drive.ctc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Human-in-the-Loop Action Queue & Live Event Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <AgentActionQueue
            actions={actions}
            onApproveAction={onApproveAction}
            onRejectAction={onRejectAction}
          />
        </div>

        <div className="lg:col-span-5">
          <LiveEventFeed />
        </div>
      </div>
    </div>
  );
};
