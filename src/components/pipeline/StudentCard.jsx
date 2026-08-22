import React, { useRef } from 'react';
import Icon from '../common/Icons';
import { useCardHoverPhysics } from '../../animations/useGsapAnimations';

export default function StudentCard({ student, jd, onViewProfile, onScheduleInterview }) {
  const cardRef = useRef(null);
  useCardHoverPhysics(cardRef);

  const matchData = student.matchedJDs?.find((m) => m.jdId === jd?.id) || student.matchedJDs?.[0];
  const matchScore = matchData?.matchScore || 85;
  const matchReason = matchData?.reason || 'Strong alignment across core project stack and problem-solving benchmarks.';

  const getScoreBadge = (score) => {
    if (score >= 90) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (score >= 75) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    if (score >= 60) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-rose-50 text-rose-700 border-rose-200';
  };

  return (
    <div
      ref={cardRef}
      className="card-interactive p-5 flex flex-col justify-between animate-card"
      onClick={() => onViewProfile?.(student)}
    >
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${student.avatarColor || 'from-indigo-600 to-blue-600'} text-white font-bold flex items-center justify-center text-sm shadow-md`}>
              {student.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm leading-snug">{student.name}</h3>
              <p className="text-xs text-slate-500 font-medium">
                {student.specialization} • CGPA: <strong className="text-indigo-600">{student.cgpa}</strong>
              </p>
            </div>
          </div>

          <div className={`flex flex-col items-center px-2.5 py-1 rounded-xl border ${getScoreBadge(matchScore)}`}>
            <span className="text-base font-extrabold leading-none">{matchScore}%</span>
            <span className="text-[9px] font-bold uppercase tracking-wider mt-0.5">Match</span>
          </div>
        </div>

        {/* Match Rationale Card */}
        <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 mb-3 text-xs">
          <p className="font-bold text-indigo-900 flex items-center gap-1 mb-1">
            <Icon name="sparkles" className="w-3.5 h-3.5 text-indigo-600" />
            AI Fit Rationale
          </p>
          <p className="text-slate-700 text-[11px] leading-relaxed line-clamp-2">{matchReason}</p>
        </div>

        {/* Skills */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1.5">
            {student.skills.slice(0, 4).map((skill, idx) => (
              <span key={idx} className="badge badge-neutral text-[11px] bg-slate-100 text-slate-800 font-medium">
                {skill}
              </span>
            ))}
            {student.skills.length > 4 && (
              <span className="badge bg-slate-100 text-slate-500 text-[11px]">
                +{student.skills.length - 4}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="text-xs">
          <span className="text-slate-500 font-medium">ATS Score: </span>
          <strong className="text-emerald-600 font-bold">{student.resumeScore}/100</strong>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (student.onWhyThisStudent) {
                student.onWhyThisStudent(student);
              } else if (onViewProfile) {
                onViewProfile(student, 'why');
              }
            }}
            className="btn-secondary text-xs py-1 px-2.5 bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 font-bold"
          >
            <Icon name="sparkles" className="w-3 h-3 text-indigo-600" />
            Why This Student?
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onScheduleInterview?.(student);
            }}
            className="btn-primary text-xs py-1 px-2.5"
          >
            <Icon name="calendar" className="w-3 h-3" />
            Schedule
          </button>
        </div>
      </div>
    </div>
  );
}
