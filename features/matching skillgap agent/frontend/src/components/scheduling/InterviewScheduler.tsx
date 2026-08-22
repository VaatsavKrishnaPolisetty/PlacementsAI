import React, { useState } from 'react';
import {
  ScheduledInterview,
  PlacementDrive,
  Student,
  PanelMember,
  Room3D
} from '../../types/placement';
import { autoGenerateRoundSchedules } from '../../services/schedulerEngine';
import {
  Calendar,
  Clock,
  Building2,
  User,
  Sparkles,
  Bot,
  Video,
  MapPin,
  CheckCircle2,
  Plus,
  Play,
  Filter,
  Check,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface InterviewSchedulerProps {
  schedules: ScheduledInterview[];
  drives: PlacementDrive[];
  students: Student[];
  panels: PanelMember[];
  rooms: Room3D[];
  onAddSchedules: (newSchedules: ScheduledInterview[], updatedRooms: Room3D[], updatedPanels: PanelMember[]) => void;
  onUpdateScheduleStatus: (scheduleId: string, status: ScheduledInterview['status'], score?: number, feedback?: string) => void;
}

export const InterviewScheduler: React.FC<InterviewSchedulerProps> = ({
  schedules,
  drives,
  students,
  panels,
  rooms,
  onAddSchedules,
  onUpdateScheduleStatus
}) => {
  const [selectedDriveId, setSelectedDriveId] = useState<string>('ALL');
  const [selectedRoundFilter, setSelectedRoundFilter] = useState<string>('ALL');
  const [isAutoScheduling, setIsAutoScheduling] = useState(false);

  const filteredSchedules = schedules.filter(s => {
    if (selectedDriveId !== 'ALL' && s.driveId !== selectedDriveId) return false;
    if (selectedRoundFilter !== 'ALL' && s.roundName !== selectedRoundFilter) return false;
    return true;
  });

  const handleAutoSchedule = () => {
    setIsAutoScheduling(true);

    setTimeout(() => {
      const activeDrive = drives[0];
      const shortlisted = students.filter(std => activeDrive.shortlistedCandidateIds.includes(std.id));

      const result = autoGenerateRoundSchedules({
        drive: activeDrive,
        shortlistedStudents: shortlisted,
        roundNumber: 2,
        panels,
        rooms,
        existingSchedules: schedules,
        interviewDate: '2026-08-21',
        startHour: 15
      });

      onAddSchedules(result.newSchedules, result.updatedRooms, result.updatedPanels);
      setIsAutoScheduling(false);

      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
    }, 700);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-white font-['Outfit']">
              Multi-Round Interview & Test Scheduler
            </h2>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Collision-Free Engine
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Autonomous constraint-satisfaction scheduling with real-time 3D room and panel synchronization
          </p>
        </div>

        {/* Action Button: Auto Schedule Batch */}
        <button
          onClick={handleAutoSchedule}
          disabled={isAutoScheduling}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
        >
          {isAutoScheduling ? (
            <>
              <Bot className="w-4 h-4 animate-spin" />
              <span>Optimizing Room & Panel Constraints...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>AI Auto-Schedule Shortlisted Queue</span>
            </>
          )}
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="glass-panel rounded-2xl border border-slate-800 p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-semibold">Filter Drive:</span>
          <select
            value={selectedDriveId}
            onChange={(e) => setSelectedDriveId(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-semibold focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Company Drives</option>
            {drives.map(d => (
              <option key={d.id} value={d.id}>{d.companyName}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-semibold">Total Scheduled Slots:</span>
          <span className="font-mono font-bold text-cyan-400 text-sm">{filteredSchedules.length}</span>
        </div>
      </div>

      {/* Timeline Schedule Cards */}
      <div className="space-y-3">
        {filteredSchedules.length === 0 ? (
          <div className="p-12 text-center glass-panel rounded-2xl border border-slate-800">
            <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-300">No Interview Slots Scheduled</h4>
            <p className="text-xs text-slate-400 mt-1">Click "AI Auto-Schedule Shortlisted Queue" to generate conflict-free slots.</p>
          </div>
        ) : (
          filteredSchedules.map((slot) => {
            const isInProgress = slot.status === 'In-Progress';
            const isCompleted = slot.status === 'Completed';

            return (
              <div
                key={slot.id}
                className={`p-4 rounded-2xl border transition-all duration-200 shadow-xl ${
                  isInProgress
                    ? 'glass-panel-glow border-cyan-500/60 bg-slate-900/90'
                    : isCompleted
                    ? 'glass-card border-slate-800 bg-slate-950/60 opacity-85'
                    : 'glass-card border-slate-800/80'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Slot Time & Round info */}
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center shrink-0">
                      <Clock className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
                      <div className="font-mono font-black text-sm text-white">{slot.startTime}</div>
                      <div className="text-[10px] text-slate-400">{slot.endTime}</div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {slot.companyName}
                        </span>
                        <h4 className="text-sm font-bold text-white">{slot.roundName}</h4>
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                            isInProgress
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 animate-pulse'
                              : isCompleted
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          {slot.status}
                        </span>
                      </div>

                      {/* Candidate & Panel info */}
                      <div className="mt-2.5 flex flex-wrap items-center gap-4 text-xs">
                        <div className="flex items-center gap-2">
                          <img
                            src={slot.candidateAvatar}
                            alt="Candidate"
                            className="w-6 h-6 rounded-full object-cover border border-slate-700"
                          />
                          <span className="font-bold text-slate-200">{slot.candidateName}</span>
                          <span className="font-mono text-slate-400 text-[11px]">({slot.candidateUSN})</span>
                        </div>

                        <span className="text-slate-600 hidden sm:inline">•</span>

                        <div className="flex items-center gap-1.5 text-slate-300">
                          <User className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Panel: <strong className="text-white">{slot.panelName}</strong></span>
                        </div>

                        <span className="text-slate-600 hidden sm:inline">•</span>

                        <div className="flex items-center gap-1.5 text-slate-300">
                          {slot.mode === 'Physical' ? (
                            <>
                              <Building2 className="w-3.5 h-3.5 text-amber-400" />
                              <span>Venue: <strong className="text-white">{slot.roomNumber}</strong></span>
                            </>
                          ) : (
                            <>
                              <Video className="w-3.5 h-3.5 text-cyan-400" />
                              <span>Virtual: <strong className="text-cyan-300 font-mono">Google Meet</strong></span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions for slot */}
                  <div className="flex items-center justify-end gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                    {slot.status === 'Scheduled' && (
                      <button
                        onClick={() => onUpdateScheduleStatus(slot.id, 'In-Progress')}
                        className="px-3 py-1.5 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/50 text-cyan-300 text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <Play className="w-3 h-3" /> Start Session
                      </button>
                    )}

                    {slot.status === 'In-Progress' && (
                      <button
                        onClick={() => onUpdateScheduleStatus(slot.id, 'Completed', 92, 'Candidate displayed strong architectural intuition and problem solving.')}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Submit Score & Pass
                      </button>
                    )}

                    {slot.status === 'Completed' && (
                      <div className="text-right">
                        <span className="text-xs font-bold text-emerald-400 font-mono">
                          Evaluated: {slot.score || 90}/100
                        </span>
                        <div className="text-[11px] text-slate-400 italic truncate max-w-xs">{slot.feedback}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
