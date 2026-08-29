import React, { useState, useRef } from 'react';
import Icon from '../common/Icons';
import { useToast } from '../common/ToastContext';
import { useModalEntrance } from '../../animations/useGsapAnimations';
import api from '../../services/api';

export default function ScheduleModal({ interview, candidate, onClose, onSave }) {
  const { showToast } = useToast();
  const modalRef = useRef(null);
  const backdropRef = useRef(null);
  const [loading, setLoading] = useState(false);

  useModalEntrance(modalRef, backdropRef);

  const [formData, setFormData] = useState({
    interviewId: interview?.id || interview?.interviewId || `INT_${Date.now()}`,
    studentName: candidate?.name || interview?.studentName || 'Rahul Verma',
    studentId: candidate?.studentId || interview?.studentId || 'STU101',
    company: interview?.company || 'Tata Consultancy Services',
    type: interview?.type || interview?.interviewType || 'Technical Round 1',
    date: interview?.date || '2026-08-25',
    time: interview?.startTime || interview?.scheduledTime || '10:30 AM',
    roomNo: interview?.roomNo || interview?.roomId || 'Block A - Room 204',
    panel: interview?.panel?.join?.(', ') || interview?.panelName || 'Technical Panel A',
    duration: interview?.duration || '60 mins',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Call API to update interview slot
      const interviewId = interview?.interviewId || interview?.id || `INT_${Date.now()}`;
      await api.updateInterviewSlot(interviewId, {
        date: formData.date,
        startTime: formData.time,
        endTime: formData.time.includes('10:') ? '11:30 AM' : '3:00 PM',
        roomId: formData.roomNo,
        roomNo: formData.roomNo,
        panelId: formData.panel,
      });

      const roomChanged = interview && (interview.roomNo || interview.roomId) && (interview.roomNo || interview.roomId) !== formData.roomNo;
      const timeChanged = interview && (interview.startTime || interview.scheduledTime) && (interview.startTime || interview.scheduledTime) !== formData.time;

      if (roomChanged && timeChanged) {
        showToast(`🚨 Time shifted to ${formData.time} & Room moved to ${formData.roomNo}. Request sent to Admin & Approval notified to student!`, 'warning');
      } else if (roomChanged) {
        showToast(`🚨 Room changed to ${formData.roomNo}! Request sent to Admin & Approval notified to student.`, 'warning');
      } else if (timeChanged) {
        showToast(`⚠️ Time moved to ${formData.time}. Request sent to Admin & Approval notified to student.`, 'info');
      } else {
        showToast(`📩 Reschedule request sent to Admin & Approval notification sent to ${formData.studentName}!`, 'success');
      }

      onSave?.(formData);
      onClose();
    } catch (err) {
      showToast(err.message || 'Error updating schedule', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={backdropRef} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto w-screen h-screen">
      <div ref={modalRef} className="my-auto relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-md">
              <Icon name="calendar" className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">
                {interview ? 'Modify Interview Room & Time' : 'Schedule Interview Session'}
              </h3>
              <p className="text-xs text-indigo-200">Autonomous Room & Conflict Guard Active</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 flex items-center justify-center transition-colors"
          >
            <Icon name="x" className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Candidate Name
            </label>
            <input
              type="text"
              value={formData.studentName}
              onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Target Company
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Interview Round
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              >
                <option value="Technical Round 1">Technical Round 1</option>
                <option value="Technical System Design">Technical System Design</option>
                <option value="HR & Culture Round">HR & Culture Round</option>
                <option value="Executive Discussion">Executive Discussion</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Date & Time
              </label>
              <input
                type="text"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                placeholder="e.g. 2:00 PM or 10:30 AM"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-indigo-600"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Allocated Room Venue
              </label>
              <input
                type="text"
                value={formData.roomNo}
                onChange={(e) => setFormData({ ...formData, roomNo: e.target.value })}
                placeholder="e.g. Block B - Room 302"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-rose-600"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Assigned Interviewer Panel
            </label>
            <input
              type="text"
              value={formData.panel}
              onChange={(e) => setFormData({ ...formData, panel: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>

          {/* Prompt / Live Notification Preview */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-1 text-xs">
            <div className="flex items-center gap-1.5 font-extrabold text-indigo-950">
              <Icon name="sparkles" className="w-4 h-4 text-indigo-600" />
              <span>Automated Urgent Student Notification</span>
            </div>
            <p className="text-slate-600 text-[11px]">
              Changing room or time will immediately trigger a high-priority Socket.io notification to{' '}
              <strong>{formData.studentName}</strong> and update their portal dashboard in real-time.
            </p>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="btn-secondary text-xs py-2 px-4 font-bold">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary text-xs py-2 px-5 font-bold shadow-md flex items-center gap-2"
            >
              {loading ? <span className="animate-spin">⏳</span> : <Icon name="check-circle" className="w-4 h-4" />}
              Save & Notify Student
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
