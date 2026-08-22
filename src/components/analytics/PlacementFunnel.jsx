import React, { useRef } from 'react';
import Icon from '../common/Icons';
import { useProgressBarAnimation } from '../../animations/useGsapAnimations';

export default function PlacementFunnel({ overview, branchDistribution = [] }) {
  const funnelRef = useRef(null);

  // GSAP animation for funnel bars
  useProgressBarAnimation(funnelRef, '.animate-funnel-bar', JSON.stringify(overview));

  const funnelStages = [
    { label: 'Registered Batch', count: overview.registeredStudents, percent: 100, color: 'from-slate-700 to-slate-800' },
    { label: 'Verified Eligible', count: 356, percent: 92, color: 'from-indigo-600 to-indigo-700' },
    { label: 'Skill-Matched & Shortlisted', count: 284, percent: 73, color: 'from-blue-600 to-blue-700' },
    { label: 'Interview Assessment', count: 198, percent: 51, color: 'from-teal-600 to-emerald-600' },
    { label: 'Final Offers Confirmed', count: overview.placedStudents, percent: 40, color: 'from-emerald-600 to-green-600' },
  ];

  return (
    <div ref={funnelRef} className="card flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Campus Placement Conversion Funnel</h3>
            <p className="text-xs text-slate-500">Autonomous Student Progression Milestones</p>
          </div>
          <span className="badge badge-success text-xs">
            <Icon name="trending-up" className="w-3.5 h-3.5 text-emerald-700" />
            85.2% Overall Rate
          </span>
        </div>

        {/* Funnel Bars */}
        <div className="space-y-3.5 mb-6">
          {funnelStages.map((stage, idx) => (
            <div key={idx}>
              <div className="flex justify-between items-center text-xs mb-1.5 font-semibold">
                <span className="text-slate-800 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                    {idx + 1}
                  </span>
                  {stage.label}
                </span>
                <span className="text-indigo-600 font-bold">{stage.count} Students ({stage.percent}%)</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80">
                <div
                  className={`h-full bg-gradient-to-r ${stage.color} rounded-full animate-funnel-bar`}
                  data-width={`${stage.percent}%`}
                  style={{ width: `${stage.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Department / Branch Breakdown */}
        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">Branch Placement Snapshot</h4>
          <div className="grid grid-cols-2 gap-2.5">
            {branchDistribution.map((branch, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-900 truncate">{branch.branch.split(' ')[0]}</span>
                  <span className="font-bold text-emerald-600">{branch.rate}%</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                  <span>{branch.placed}/{branch.total} Placed</span>
                  <span>Avg: {branch.avgPackage}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Highest CTC Offered: <strong className="text-slate-900 font-bold">{overview.highestPackage}</strong></span>
        <span>Median CTC: <strong className="text-indigo-600 font-bold">{overview.medianPackage}</strong></span>
      </div>
    </div>
  );
}
