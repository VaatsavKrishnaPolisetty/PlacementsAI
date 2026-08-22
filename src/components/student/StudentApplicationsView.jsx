import React, { useState } from 'react';
import Icon from '../common/Icons';

export default function StudentApplicationsView({ applications = [], onNavigate }) {
  const [expandedAppId, setExpandedAppId] = useState(null);

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'selected':
      case 'offer_accepted':
        return 'badge-success';
      case 'shortlisted':
      case 'interview_scheduled':
        return 'badge-primary';
      case 'under_review':
        return 'badge-warning';
      case 'rejected':
        return 'badge-error';
      default:
        return 'badge-info';
    }
  };

  const STAGE_ORDER = ['applied', 'under_review', 'shortlisted', 'interview_scheduled', 'selected'];

  const getStageStatus = (currentStatus, stage) => {
    const currentIndex = STAGE_ORDER.indexOf(currentStatus?.toLowerCase());
    const stageIndex = STAGE_ORDER.indexOf(stage);
    if (stageIndex < currentIndex) return 'completed';
    if (stageIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">My Job Applications & Status Tracking</h2>
          <p className="text-xs text-slate-500">
            Real-time status updates, stage history timelines, and attached interview session details.
          </p>
        </div>
        <button
          onClick={() => onNavigate('jobs')}
          className="btn-primary text-xs py-2 px-4 shadow-md font-bold flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Icon name="briefcase" className="w-4 h-4" />
          Apply for More Drives
        </button>
      </div>

      {/* Applications List */}
      {applications.length === 0 ? (
        <div className="card text-center p-12 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto text-2xl">
            📋
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-900">No applications submitted yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Explore available corporate recruitment drives and submit your first application.
            </p>
          </div>
          <button onClick={() => onNavigate('jobs')} className="btn-primary text-xs py-2 px-5 font-bold shadow-md">
            Explore Job Drives
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const appId = app.applicationId || app._id || app.id;
            const isExpanded = expandedAppId === appId;
            const history = app.statusHistory || [
              { status: 'applied', changedAt: app.appliedAt || new Date(), reason: 'Application submitted' },
            ];

            return (
              <div
                key={appId}
                className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm space-y-5 transition-all"
              >
                {/* Top Card Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white font-black flex items-center justify-center text-lg shadow-md shrink-0">
                      {app.company ? app.company[0] : 'C'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-slate-900 text-base">{app.company}</h3>
                        <span className={`badge text-[10px] font-extrabold ${getStatusBadge(app.status)}`}>
                          {app.status?.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-indigo-600 font-bold">{app.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-start sm:self-auto text-xs">
                    <div className="text-right hidden sm:block">
                      <p className="font-extrabold text-slate-900">{app.package || '₹14.0 LPA'}</p>
                      <p className="text-[10px] text-slate-400">
                        Applied on {new Date(app.appliedAt || Date.now()).toLocaleDateString()}
                      </p>
                    </div>

                    <button
                      onClick={() => setExpandedAppId(isExpanded ? null : appId)}
                      className="btn-secondary text-xs py-1.5 px-3 font-bold flex items-center gap-1"
                    >
                      <span>{isExpanded ? 'Hide Timeline' : 'View Timeline'}</span>
                      <Icon name={isExpanded ? 'chevron-up' : 'chevron-down'} className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Attached Interview Slot if Scheduled */}
                {app.interview && (
                  <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-extrabold text-indigo-950 text-xs">
                        <Icon name="calendar" className="w-4 h-4 text-indigo-600" />
                        <span>Attached Interview Session</span>
                      </div>
                      <span className="badge badge-success text-[10px] font-bold">Confirmed</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                      <div>
                        <span className="text-[10px] text-slate-500 font-medium">Date & Time</span>
                        <p className="font-bold text-slate-900">
                          {app.interview.date || 'August 25, 2026'} at {app.interview.startTime || '10:30 AM'}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-500 font-medium">Venue Room</span>
                        <p className="font-bold text-indigo-600">{app.interview.roomId || 'Block B - Room 302'}</p>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-500 font-medium">Round</span>
                        <p className="font-bold text-slate-900">{app.interview.interviewType || 'Technical Round 1'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Expandable Application Status Timeline */}
                {isExpanded && (
                  <div className="pt-4 border-t border-slate-100 space-y-5 animate-fade-in">
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-4">
                        Application Progression Pipeline
                      </h4>

                      {/* 5-Stage Stepper Bar */}
                      <div className="grid grid-cols-5 gap-2 text-center text-[10px] font-bold">
                        {STAGE_ORDER.map((stage, sIdx) => {
                          const state = getStageStatus(app.status, stage);
                          return (
                            <div key={sIdx} className="space-y-1.5">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  state === 'completed'
                                    ? 'bg-emerald-500'
                                    : state === 'current'
                                    ? 'bg-indigo-600 animate-pulse'
                                    : 'bg-slate-200'
                                }`}
                              />
                              <span
                                className={`capitalize block ${
                                  state === 'current'
                                    ? 'text-indigo-600 font-extrabold'
                                    : state === 'completed'
                                    ? 'text-slate-800'
                                    : 'text-slate-400'
                                }`}
                              >
                                {stage.replace('_', ' ')}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Historical Audit Trail List */}
                    <div className="space-y-2.5 pt-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Detailed Event History
                      </span>
                      <div className="space-y-2">
                        {history.map((hist, hIdx) => (
                          <div
                            key={hIdx}
                            className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-3 text-xs"
                          >
                            <div className="flex items-start gap-2.5">
                              <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                                {hIdx + 1}
                              </div>
                              <div>
                                <span className="font-extrabold text-slate-900 capitalize">
                                  {hist.status?.replace('_', ' ')}
                                </span>
                                <p className="text-[11px] text-slate-600 mt-0.5">
                                  {hist.reason || `Status updated to ${hist.status}`}
                                </p>
                              </div>
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium shrink-0">
                              {new Date(hist.changedAt || Date.now()).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
