import React, { useRef } from 'react';
import Icon from '../common/Icons';
import { useToast } from '../common/ToastContext';
import { useModalEntrance } from '../../animations/useGsapAnimations';

export default function StudentDetailModal({ student, onClose, onScheduleInterview }) {
  const { showToast } = useToast();
  const modalRef = useRef(null);
  const backdropRef = useRef(null);

  useModalEntrance(modalRef, backdropRef);

  if (!student) return null;

  const handleDownloadResume = () => {
    showToast(`Downloading verified ATS resume for ${student.name}`, 'info');
  };

  return (
    <div ref={backdropRef} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto w-screen h-screen">
      <div ref={modalRef} className="my-auto relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-start justify-between bg-slate-50/80">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white font-bold flex items-center justify-center text-xl shadow-lg shadow-indigo-500/20">
              {student.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900">{student.name}</h3>
                <span className="badge badge-success">Active Candidate</span>
              </div>
              <p className="text-sm font-medium text-slate-600 flex items-center gap-2 mt-1">
                <span>{student.rollNo || '21BCE1042'}</span> • 
                <span>{student.specialization}</span> • 
                <span className="font-semibold text-indigo-600">CGPA: {student.cgpa}</span>
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{student.email}</p>
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
          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-center">
              <p className="text-xs font-semibold text-emerald-800">Resume ATS Score</p>
              <p className="text-2xl font-extrabold text-emerald-700 mt-1">{student.resumeScore}<span className="text-sm font-medium text-emerald-600">/100</span></p>
            </div>
            <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl text-center">
              <p className="text-xs font-semibold text-indigo-800">Top Match Score</p>
              <p className="text-2xl font-extrabold text-indigo-700 mt-1">{student.matchedJDs?.[0]?.matchScore || 95}%</p>
            </div>
            <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl text-center">
              <p className="text-xs font-semibold text-amber-800">Completed Rounds</p>
              <p className="text-2xl font-extrabold text-amber-700 mt-1">{student.interviewRounds || 2}</p>
            </div>
          </div>

          {/* AI Matched Roles & Reasoning */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">AI Matching Rationale</h4>
            <div className="space-y-3">
              {student.matchedJDs && student.matchedJDs.length > 0 ? (
                student.matchedJDs.map((match, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <Icon name="sparkles" className="w-4 h-4 text-indigo-600" />
                        Target Match #{idx + 1}
                      </span>
                      <span className="badge badge-info">{match.matchScore}% Match Confidence</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{match.reason}</p>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                  Candidate profile ready for upcoming autonomous match pipelines.
                </div>
              )}
            </div>
          </div>

          {/* Technical Skills */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">Verified Technical Skills</h4>
            <div className="flex flex-wrap gap-2">
              {student.skills.map((skill, idx) => (
                <span key={idx} className="badge badge-neutral text-xs px-3 py-1 bg-slate-100 text-slate-800 font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button onClick={handleDownloadResume} className="btn-secondary">
            <Icon name="file-text" className="w-4 h-4" />
            Download Resume
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => {
                onClose();
                onScheduleInterview?.(student);
              }}
              className="btn-primary"
            >
              <Icon name="calendar" className="w-4 h-4" />
              Schedule Interview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
