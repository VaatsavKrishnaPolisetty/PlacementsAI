import React from 'react';
import { PanelMember, Room3D } from '../../types/placement';
import { Building2, User, CheckCircle2, Clock, AlertTriangle, ShieldAlert, Wifi, Monitor, Mic } from 'lucide-react';

interface RoomPanelMatrixProps {
  panels: PanelMember[];
  rooms: Room3D[];
  onSelectRoom: (room: Room3D) => void;
}

export const RoomPanelMatrix: React.FC<RoomPanelMatrixProps> = ({
  panels,
  rooms,
  onSelectRoom
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-white font-['Outfit']">
          Panel Load Balancer & Physical Venue Hub
        </h2>
        <p className="text-xs text-slate-400">
          Monitor interviewer slot distribution, physical 3D interview rooms, and hardware status
        </p>
      </div>

      {/* Panel Workload Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-400" />
            Interview Panels & Daily Slot Allocation
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {panels.length} Active Interviewers
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {panels.map((panel) => {
            const loadPercent = Math.round((panel.assignedSlotsCount / panel.maxDailySlots) * 100);
            const isNearMax = loadPercent >= 80;

            return (
              <div
                key={panel.id}
                className="glass-card rounded-2xl border border-slate-800 p-4 space-y-3 relative overflow-hidden"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={panel.avatar}
                    alt={panel.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-700 shadow-md"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-white truncate">{panel.name}</h4>
                    <span className="text-xs text-indigo-300 font-semibold block truncate">
                      {panel.company} • {panel.experienceYears}y Exp
                    </span>
                  </div>
                </div>

                {/* Workload Meter */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-400 text-[11px]">Daily Slot Load</span>
                    <span className={`font-mono font-bold ${isNearMax ? 'text-rose-400' : 'text-cyan-400'}`}>
                      {panel.assignedSlotsCount} / {panel.maxDailySlots} Slots ({loadPercent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isNearMax ? 'bg-rose-500' : 'bg-gradient-to-r from-indigo-500 to-cyan-400'
                      }`}
                      style={{ width: `${Math.min(100, loadPercent)}%` }}
                    />
                  </div>
                </div>

                {/* Domains */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {panel.domains.slice(0, 3).map((dom, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-800">
                      {dom}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3D Rooms & Hardware Matrix */}
      <div className="space-y-3 pt-4">
        <h3 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
          <Building2 className="w-4 h-4 text-cyan-400" />
          Campus Rooms & Hardware Equipment
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <div
              key={room.id}
              onClick={() => onSelectRoom(room)}
              className="glass-card rounded-2xl border border-slate-800 p-4 hover:border-cyan-500/50 transition-all cursor-pointer space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                    {room.roomNumber}
                  </span>
                  <h4 className="text-sm font-bold text-white mt-1.5">{room.name}</h4>
                  <p className="text-[11px] text-slate-400">{room.building} • {room.floor}</p>
                </div>

                <span
                  className={`text-[10px] font-extrabold uppercase px-2 py-1 rounded-lg border ${
                    room.status === 'In-Session'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 animate-pulse'
                      : room.status === 'Reserved'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}
                >
                  {room.status}
                </span>
              </div>

              {room.currentCandidateName && (
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                  <span className="text-slate-400 block text-[10px]">Active Candidate:</span>
                  <span className="font-bold text-cyan-300">{room.currentCandidateName}</span>
                </div>
              )}

              {/* Equipment */}
              <div className="flex flex-wrap gap-1 text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                {room.equipment.map((eq, i) => (
                  <span key={i} className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-300">
                    {eq}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
