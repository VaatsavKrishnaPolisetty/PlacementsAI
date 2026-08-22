import React, { useState, useRef } from 'react';
import Icon from '../common/Icons';
import { useToast } from '../common/ToastContext';
import { useProgressBarAnimation } from '../../animations/useGsapAnimations';

export default function SkillGapAnalytics({ skillGaps = [] }) {
  const { showToast } = useToast();
  const [selectedSkill, setSelectedSkill] = useState(null);
  const containerRef = useRef(null);

  // Animate skill demand/supply progress bars with GSAP
  useProgressBarAnimation(containerRef, '.animate-skill-bar', JSON.stringify(skillGaps));

  const handleLaunchWorkshop = (skill) => {
    showToast(`Upskilling Bootcamp scheduled for: "${skill.skill}"`, 'success');
  };

  return (
    <div ref={containerRef} className="card flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Market Skill Gap Analysis</h3>
            <p className="text-xs text-slate-500">Corporate Hiring Demand vs Student Skill Supply</p>
          </div>
          <span className="badge badge-info text-xs">
            <Icon name="sparkles" className="w-3 h-3 text-indigo-600" />
            AI Curriculum Insights
          </span>
        </div>

        <div className="space-y-4">
          {skillGaps.map((item, idx) => {
            const gapPercentage = Math.round((item.gap / item.demand) * 100);
            const fillWidth = `${Math.min(100, (item.supply / item.demand) * 100)}%`;
            const isSelected = selectedSkill?.skill === item.skill;

            return (
              <div
                key={idx}
                onClick={() => setSelectedSkill(isSelected ? null : item)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50/50 border-indigo-300 shadow-sm ring-1 ring-indigo-400/30'
                    : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs text-slate-900">{item.skill}</h4>
                    <span className="badge badge-neutral text-[10px] py-0">{item.category}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-semibold">
                    <span className="text-slate-500">
                      Demand: <strong className="text-slate-900">{item.demand}</strong>
                    </span>
                    <span className="text-slate-500">
                      Supply: <strong className="text-emerald-700">{item.supply}</strong>
                    </span>
                    <span className="text-rose-700 font-extrabold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 text-[11px]">
                      -{item.gap} deficit ({gapPercentage}%)
                    </span>
                  </div>
                </div>

                {/* Progress bar comparison */}
                <div className="relative h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  {/* Supply Filled Bar */}
                  <div
                    className="h-full bg-indigo-600 rounded-full animate-skill-bar"
                    data-width={fillWidth}
                    style={{ width: fillWidth }}
                  />
                </div>

                {/* Expanded Action Insight */}
                {isSelected && item.action && (
                  <div className="mt-3 pt-3 border-t border-indigo-100 flex items-center justify-between text-xs text-indigo-950 animate-fade-in">
                    <p className="leading-snug">
                      <strong>Target Remediation:</strong> {item.action}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLaunchWorkshop(item);
                      }}
                      className="btn-primary text-xs py-1 px-3 flex-shrink-0 ml-3"
                    >
                      Launch Workshop
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Recommendations */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-500 font-medium">
          Priority Focus Areas: <strong className="text-slate-800">GenAI, Cloud Kubernetes & Spring Boot</strong>
        </span>
        <button
          onClick={() => showToast('Generated Comprehensive 2024 Curriculum Alignment Report', 'info')}
          className="btn-ghost text-xs font-bold"
        >
          Export Report →
        </button>
      </div>
    </div>
  );
}
