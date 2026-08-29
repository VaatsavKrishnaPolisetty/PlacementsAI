import React, { useRef } from 'react';
import Icon from '../common/Icons';
import { useCardHoverPhysics } from '../../animations/useGsapAnimations';

export default function InterviewScheduleCard({ interview, onReschedule, onConfirm }) {
  const cardRef = useRef(null);
  useCardHoverPhysics(cardRef);

  const getRoundBadge = (round) => {
    const badges = {
      1: 'badge-info',
      2: 'badge-warning',
      3: 'badge-success',
    };
    return badges[round] || 'badge-neutral';
  };

  const isConfirmed = interview.status === 'confirmed';

  return (
    <div ref={cardRef} className="card p-5 flex flex-col justify-between animate-card">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">{interview.studentName}</h4>
            <p className="text-xs text-indigo-600 font-semibold">{interview.company}</p>
          </div>
          <div className="flex items-center gap-1.5">
            {isConfirmed && (
              <span className="badge badge-success text-[10px] font-bold">✓ Confirmed</span>
            )}
            <span className={`badge ${getRoundBadge(interview.round)}`}>Round {interview.round || 1}</span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="space-y-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 mb-4 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <Icon name="clock" className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
            <span className="font-semibold text-slate-900">{interview.scheduledTime || `${interview.date || '2026-08-25'} ${interview.startTime || '10:30 AM'}`}</span>
            <span className="text-slate-400">({interview.duration || '60 mins'})</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <Icon name="building" className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">{interview.roomNo || interview.roomId || 'Block B - Room 302'}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <Icon name="users" className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate text-slate-600">{Array.isArray(interview.panel) ? interview.panel.join(', ') : interview.panel || 'Technical Panel A'}</span>
          </div>
        </div>

        {/* Interview Type Tag */}
        <div className="mb-4">
          <span className="badge badge-neutral text-[11px] font-medium">
            <Icon name="sparkles" className="w-3 h-3 text-indigo-500" />
            {interview.type || 'Technical Round 1'}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
        <button
          onClick={() => onReschedule?.(interview)}
          className="btn-secondary text-xs py-1.5 px-3 flex-1 font-semibold text-slate-700"
        >
          Reschedule
        </button>
        {isConfirmed ? (
          <div className="py-1.5 px-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-extrabold flex-1 flex items-center justify-center gap-1.5">
            <Icon name="check-circle" className="w-3.5 h-3.5 text-emerald-600" />
            Confirmed
          </div>
        ) : (
          <button
            onClick={() => onConfirm?.(interview)}
            className="btn-primary text-xs py-1.5 px-3 flex-1 font-semibold flex items-center justify-center gap-1"
          >
            <Icon name="check" className="w-3.5 h-3.5" />
            Confirm Slot
          </button>
        )}
      </div>
    </div>
  );
}
