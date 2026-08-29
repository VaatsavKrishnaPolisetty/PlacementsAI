import React, { useState, useEffect, useRef } from 'react';
import Icon from '../common/Icons';
import { useToast } from '../common/ToastContext';
import { useModalEntrance } from '../../animations/useGsapAnimations';

const MATCHING_WORKFLOW_STEPS = [
  { title: 'Ingesting Student Resumes & Course Transcripts', status: 'done' },
  { title: 'Parsing Skill Embeddings & ATS Scoring Matrices', status: 'processing' },
  { title: 'Evaluating JD Eligibility & Branch Prerequisites', status: 'pending' },
  { title: 'Synthesizing Optimal Candidate Match Rankings', status: 'pending' },
  { title: 'Broadcasting Automated Calendar & Room Invites', status: 'pending' },
];

const SCHEDULING_WORKFLOW_STEPS = [
  { title: 'Ingesting Candidate Shortlist & Drive Requirements', status: 'done' },
  { title: 'Evaluating Panel & Room Venue Availabilities', status: 'processing' },
  { title: 'Running Autonomous Conflict Guard & Timetable Solver', status: 'pending' },
  { title: 'Allocating Optimized Interview Slots & Rooms', status: 'pending' },
  { title: 'Publishing Final Schedule & Student In-App Alerts', status: 'pending' },
];

export default function AgentWorkflowModal({ agentType = 'Matching Agent', onClose, onComplete }) {
  const { showToast } = useToast();
  const [progress, setProgress] = useState(15);
  const [currentStep, setCurrentStep] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const modalRef = useRef(null);
  const backdropRef = useRef(null);

  const steps = agentType.toLowerCase().includes('schedul') ? SCHEDULING_WORKFLOW_STEPS : MATCHING_WORKFLOW_STEPS;

  useModalEntrance(modalRef, backdropRef);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 25;
        if (next >= 100) {
          clearInterval(timer);
          setIsFinished(true);
          setCurrentStep(steps.length - 1);
          return 100;
        }
        return next;
      });

      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 600);

    return () => clearInterval(timer);
  }, [steps.length]);

  const handleFinish = () => {
    showToast(
      `🎉 ${agentType} execution completed! ${agentType.toLowerCase().includes('schedul') ? 'Interview roster allocated & notifications dispatched.' : '38 candidates matched & verified!'}`,
      'success'
    );
    onComplete?.();
    onClose();
  };

  return (
    <div ref={backdropRef} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto w-screen h-screen">
      <div ref={modalRef} className="my-auto relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-indigo-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-800 text-indigo-300 border border-indigo-700">
              <Icon name="agent" className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{agentType} Execution</h3>
              <p className="text-xs text-indigo-300">Deep Reasoning & Conflict Mitigation in Progress</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-indigo-300 hover:text-white rounded-lg hover:bg-indigo-800 transition-colors"
          >
            <Icon name="x" className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="p-6 space-y-5">
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-2">
              <span>Autonomous Task Pipeline</span>
              <span className="text-indigo-600">{progress}% Complete</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className="h-full bg-gradient-to-r from-indigo-600 via-blue-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Steps List */}
          <div className="space-y-3">
            {steps.map((step, idx) => {
              const isDone = idx < currentStep || isFinished;
              const isCurrent = idx === currentStep && !isFinished;

              return (
                <div
                  key={idx}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-xs transition-all ${
                    isDone
                      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900 font-medium'
                      : isCurrent
                      ? 'bg-indigo-50/80 border-indigo-300 text-indigo-900 font-semibold shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  {isDone ? (
                    <Icon name="check-circle" className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : isCurrent ? (
                    <Icon name="refresh" className="w-4 h-4 text-indigo-600 animate-spin flex-shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-300 flex-shrink-0" />
                  )}
                  <span>{step.title}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
          {isFinished ? (
            <button onClick={handleFinish} className="btn-primary">
              <Icon name="check" className="w-4 h-4" />
              Apply Results & Close
            </button>
          ) : (
            <button onClick={onClose} className="btn-secondary">
              Run in Background
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
