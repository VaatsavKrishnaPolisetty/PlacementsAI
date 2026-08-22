import React from 'react';
import { Activity, Bot, CheckCircle, AlertTriangle, MessageSquare, Calendar, Building, Radio } from 'lucide-react';

interface EventItem {
  id: string;
  time: string;
  type: 'SCHEDULE' | 'ELIGIBILITY' | 'COMMS' | 'PANEL' | 'SYSTEM';
  message: string;
  badge: string;
}

export const LiveEventFeed: React.FC = () => {
  const events: EventItem[] = [
    {
      id: 'e1',
      time: '14:28:12',
      type: 'SCHEDULE',
      message: 'Room CR-101 locked for Google Round 1 (Candidate: Aarav Sharma).',
      badge: 'Auto-Allocated'
    },
    {
      id: 'e2',
      time: '14:26:05',
      type: 'COMMS',
      message: 'Dispatched 48 WhatsApp interview reminders with venue maps.',
      badge: 'Delivered (100%)'
    },
    {
      id: 'e3',
      time: '14:22:40',
      type: 'ELIGIBILITY',
      message: 'Verified 80 candidates against Microsoft Azure SDE requirements.',
      badge: 'Verified'
    },
    {
      id: 'e4',
      time: '14:18:15',
      type: 'PANEL',
      message: 'Panel Sneha Roy checked in to Microsoft AI Suite CR-102.',
      badge: 'In-Session'
    },
    {
      id: 'e5',
      time: '14:10:00',
      type: 'SYSTEM',
      message: 'Constraint satisfaction solver initialized: 0 room conflicts.',
      badge: 'Success'
    }
  ];

  return (
    <div className="glass-panel rounded-2xl border border-slate-800/80 p-5 shadow-xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-['Outfit']">
                Live Agent Event Telemetry
              </h3>
              <p className="text-xs text-slate-400">Autonomous workflow logs & dispatch events</p>
            </div>
          </div>

          <span className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono font-bold rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            STREAMING
          </span>
        </div>

        {/* Stream List */}
        <div className="space-y-3">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start justify-between gap-3 text-xs hover:bg-slate-900 transition-colors"
            >
              <div className="flex items-start gap-2.5">
                <span className="text-[11px] font-mono text-slate-500 mt-0.5">{ev.time}</span>
                <p className="text-slate-200 leading-relaxed font-medium">{ev.message}</p>
              </div>

              <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-indigo-300 border border-slate-700">
                {ev.badge}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 text-right">
        Auto-refreshes every 5s • 100% Audit Logged
      </div>
    </div>
  );
};
