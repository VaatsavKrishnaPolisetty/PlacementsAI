import React, { useRef } from 'react';
import Icon from '../common/Icons';
import { useToast } from '../common/ToastContext';
import { useModalEntrance } from '../../animations/useGsapAnimations';

export default function JDDetailModal({ jd, onClose, onMatchCandidates }) {
  const { showToast } = useToast();
  const modalRef = useRef(null);
  const backdropRef = useRef(null);

  useModalEntrance(modalRef, backdropRef);

  if (!jd) return null;

  const fillPercentage = Math.round((jd.filled / jd.positions) * 100);

  const handleApplyAction = () => {
    showToast(`AI Matching Engine triggered for ${jd.title} (${jd.company})`, 'info');
    onMatchCandidates?.(jd);
  };

  return (
    <div ref={backdropRef} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto w-screen h-screen">
      <div ref={modalRef} className="my-auto relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-start justify-between bg-slate-50/80">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-lg shadow-md shadow-indigo-600/20">
              {jd.company.substring(0, 3).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900">{jd.title}</h3>
                <span className="badge badge-info">{jd.stage}</span>
              </div>
              <p className="text-sm font-medium text-slate-600 flex items-center gap-2 mt-1">
                <span>{jd.company}</span> • 
                <span className="flex items-center gap-1"><Icon name="map-pin" className="w-3.5 h-3.5" /> {jd.location}</span> • 
                <span className="text-emerald-700 font-semibold">{jd.ctc}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <Icon name="x" className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Description */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Role Overview</h4>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              {jd.description || 'Design and scale production software architectures within autonomous campus placement cycles.'}
            </p>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-center">
              <p className="text-xs text-slate-500 font-medium">Positions</p>
              <p className="text-lg font-bold text-slate-900 mt-0.5">{jd.positions}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-center">
              <p className="text-xs text-slate-500 font-medium">Filled</p>
              <p className="text-lg font-bold text-emerald-600 mt-0.5">{jd.filled}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-center">
              <p className="text-xs text-slate-500 font-medium">Min CGPA</p>
              <p className="text-lg font-bold text-indigo-600 mt-0.5">{jd.eligibility?.minCGPA || 6.5}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-center">
              <p className="text-xs text-slate-500 font-medium">Experience</p>
              <p className="text-lg font-bold text-slate-900 mt-0.5">{jd.experience}</p>
            </div>
          </div>

          {/* Hiring Progress */}
          <div>
            <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-2">
              <span>Hiring Pipeline Fulfillment</span>
              <span>{jd.filled} of {jd.positions} Roles ({fillPercentage}%)</span>
            </div>
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-600 to-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${fillPercentage}%` }}
              />
            </div>
          </div>

          {/* Required Skills */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">Required Skills & Technologies</h4>
            <div className="flex flex-wrap gap-2">
              {jd.skills.map((skill, idx) => (
                <span key={idx} className="badge badge-info text-xs px-3 py-1 bg-indigo-50/80">
                  <Icon name="sparkles" className="w-3 h-3 text-indigo-500" />
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Eligibility Criteria */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Eligibility Guidelines</h4>
            <div className="space-y-1.5 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <Icon name="check-circle" className="w-4 h-4 text-emerald-600" />
                <span>Eligible Branches: <strong>{jd.eligibility?.specializations?.join(', ') || 'CSE, IT'}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="check-circle" className="w-4 h-4 text-emerald-600" />
                <span>Minimum Cumulative CGPA: <strong>{jd.eligibility?.minCGPA}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="check-circle" className="w-4 h-4 text-emerald-600" />
                <span>Active Backlogs: <strong>0 Backlogs Permitted</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
          <div className="flex gap-2">
            <button onClick={handleApplyAction} className="btn-primary">
              <Icon name="sparkles" className="w-4 h-4" />
              Run AI Candidate Matching
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
