import React, { useRef } from 'react';
import { useCardHoverPhysics } from '../../animations/useGsapAnimations';

export default function JDCard({ jd, onViewDetails }) {
  const cardRef = useRef(null);
  useCardHoverPhysics(cardRef);

  const fillPercentage = Math.round((jd.filled / jd.positions) * 100);

  const stageBadgeClass = {
    eligibility: 'badge-warning',
    matching: 'badge-info',
    scheduling: 'badge-info',
    interview: 'badge-error',
    offers: 'badge-success',
  }[jd.stage] || 'badge-neutral';

  return (
    <div
      ref={cardRef}
      className="card-interactive p-5 flex flex-col justify-between animate-card"
      onClick={() => onViewDetails?.(jd)}
    >
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
              {jd.company}
            </span>
            <h3 className="text-base font-bold text-slate-900 leading-snug">{jd.title}</h3>
          </div>
          <span className={`badge ${stageBadgeClass} uppercase text-[10px]`}>
            {jd.stage}
          </span>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 mb-4 text-xs">
          <div>
            <span className="text-slate-500 font-medium">Package:</span>
            <p className="font-bold text-emerald-700 mt-0.5">{jd.ctc}</p>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Location:</span>
            <p className="font-bold text-slate-900 mt-0.5 truncate">{jd.location}</p>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Experience:</span>
            <p className="font-bold text-slate-900 mt-0.5">{jd.experience}</p>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Min CGPA:</span>
            <p className="font-bold text-indigo-600 mt-0.5">{jd.eligibility?.minCGPA || 6.5}</p>
          </div>
        </div>

        {/* Hiring Fill Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1.5">
            <span>Fulfillment</span>
            <span className="text-indigo-600">{jd.filled} / {jd.positions} Roles</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-600 to-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${fillPercentage}%` }}
            />
          </div>
        </div>

        {/* Skills */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1.5">
            {jd.skills.slice(0, 3).map((skill, idx) => (
              <span key={idx} className="badge badge-neutral text-[11px] font-medium bg-slate-100 text-slate-800">
                {skill}
              </span>
            ))}
            {jd.skills.length > 3 && (
              <span className="badge bg-slate-100 text-slate-500 text-[11px]">
                +{jd.skills.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="flex gap-4 text-xs font-semibold">
          <span className="text-slate-500">Applied: <strong className="text-slate-900">{jd.appliedCount}</strong></span>
          <span className="text-slate-500">Selected: <strong className="text-emerald-600">{jd.selectedCount}</strong></span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails?.(jd);
          }}
          className="btn-primary text-xs py-1.5 px-3"
        >
          View JD
        </button>
      </div>
    </div>
  );
}
