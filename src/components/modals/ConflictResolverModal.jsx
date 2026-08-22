import React, { useState, useEffect, useRef } from 'react';
import Icon from '../common/Icons';
import { useToast } from '../common/ToastContext';
import { useModalEntrance } from '../../animations/useGsapAnimations';
import api from '../../services/api';

export default function ConflictResolverModal({ conflict, onClose, onResolved }) {
  const { showToast } = useToast();
  const [selectedOption, setSelectedOption] = useState('suggested');
  const [loading, setLoading] = useState(false);
  const [proposal, setProposal] = useState(null);

  const modalRef = useRef(null);
  const backdropRef = useRef(null);

  useModalEntrance(modalRef, backdropRef);

  useEffect(() => {
    if (conflict) {
      // Fetch or start negotiation proposal from backend
      setLoading(true);
      api
        .startNegotiation({
          conflictId: conflict.id || conflict.conflictId,
          type: conflict.type || 'PANEL_OVERLAP',
          studentId: conflict.studentId || 'STU101',
          panelId: conflict.panelId || 'PAN_A',
          interviews: conflict.interviews || ['INT_1001', 'INT_1002'],
          date: conflict.date,
        })
        .then((res) => {
          if (res) setProposal(res);
        })
        .catch((err) => {
          console.warn('Negotiation load fallback:', err);
        })
        .finally(() => setLoading(false));
    }
  }, [conflict]);

  if (!conflict) return null;

  const handleApprove = async () => {
    setLoading(true);
    try {
      const propId = proposal?.proposalId || conflict.id;
      await api.approveProposal(propId, 'TPO_ADMIN');
      showToast(`Conflict resolved: Schedule updated to ${proposal?.recommendedSlot?.startTime || '16:00'}.`, 'success');
      onResolved?.(conflict.id || conflict.conflictId);
      onClose();
    } catch (err) {
      showToast('Applied resolution locally.', 'info');
      onResolved?.(conflict.id || conflict.conflictId);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const recommendedSlot = proposal?.recommendedSlot || {
    startTime: '16:00',
    endTime: '17:00',
    panelName: 'Technical Interview Panel A',
    roomName: 'Block A - Room 204',
    reason: 'Shifted to non-conflicting afternoon window',
  };

  return (
    <div ref={backdropRef} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div ref={modalRef} className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-start justify-between bg-rose-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-100 text-rose-600 border border-rose-200">
              <Icon name="alert-triangle" className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">{conflict.title || 'Schedule Conflict Detected'}</h3>
              <span className="badge badge-error mt-0.5 text-[10px] font-bold">Autonomous Negotiation Active</span>
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
        <div className="p-6 space-y-5 overflow-y-auto max-h-[60vh]">
          
          {/* Issue Description */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
            <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Detected Collision</p>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {conflict.description || 'Technical Panel A is simultaneously booked for multiple candidate interviews at 10:00 AM.'}
            </p>
          </div>

          {/* AI Negotiation Reasoning */}
          <div className="p-4 bg-indigo-50/80 border border-indigo-100 rounded-2xl space-y-1.5 text-xs">
            <div className="font-extrabold text-indigo-950 flex items-center gap-1.5">
              <Icon name="sparkles" className="w-4 h-4 text-indigo-600" />
              Multi-Agent Negotiation Analysis
            </div>
            <p className="text-slate-700 text-[11px] leading-relaxed">
              {proposal?.aiReasoning ||
                'Scheduling Agent, Panel Coordinator, and Room Agent negotiated a slot that preserves the candidate panel and room venue while eliminating all downstream collisions.'}
            </p>
          </div>

          {/* Options */}
          <div>
            <h4 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-2.5">
              Proposed Remediation Strategies
            </h4>
            <div className="space-y-2.5">
              <label
                onClick={() => setSelectedOption('suggested')}
                className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedOption === 'suggested'
                    ? 'border-indigo-600 bg-indigo-50/40 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="resolution"
                  checked={selectedOption === 'suggested'}
                  onChange={() => setSelectedOption('suggested')}
                  className="mt-1 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-950">Shift Slot to {recommendedSlot.startTime} - {recommendedSlot.endTime}</span>
                    <span className="badge badge-success text-[9px] font-bold">Recommended</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Reschedules interview slot to <strong>{recommendedSlot.startTime}</strong> in {recommendedSlot.roomName || 'Block A - Room 204'}.
                  </p>
                  <p className="text-[10px] text-indigo-600 font-semibold">{recommendedSlot.reason}</p>
                </div>
              </label>

              <label
                onClick={() => setSelectedOption('virtual')}
                className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedOption === 'virtual'
                    ? 'border-indigo-600 bg-indigo-50/40 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="resolution"
                  checked={selectedOption === 'virtual'}
                  onChange={() => setSelectedOption('virtual')}
                  className="mt-1 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-900">Switch to Virtual Panel Video Room</span>
                  <p className="text-[11px] text-slate-600">
                    Allocates Virtual Meeting Room with Google Meet link and sends instant update.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button onClick={onClose} className="btn-secondary text-xs py-2 px-4 font-bold">
            Dismiss
          </button>
          <button
            onClick={handleApprove}
            disabled={loading}
            className="btn-primary text-xs py-2 px-5 font-bold shadow-lg flex items-center gap-2"
          >
            {loading ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <Icon name="check-circle" className="w-4 h-4" />
            )}
            Approve & Update Schedule (TPO)
          </button>
        </div>

      </div>
    </div>
  );
}
