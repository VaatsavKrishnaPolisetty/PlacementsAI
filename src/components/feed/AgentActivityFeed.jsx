import React from 'react';
import Icon from '../common/Icons';

export default function AgentActivityFeed({ activities, onTriggerAgent, onViewAll }) {
  const getAgentIcon = (agentName = '') => {
    if (agentName.includes('Eligibility')) return 'check-circle';
    if (agentName.includes('Matching')) return 'target';
    if (agentName.includes('Scheduling')) return 'calendar';
    if (agentName.includes('Negotiation')) return 'award';
    if (agentName.includes('Notification')) return 'bell';
    return 'agent';
  };

  const getStatusBadge = (status) => {
    if (status === 'completed') {
      return (
        <span className="badge badge-success text-[10px]">
          <Icon name="check" className="w-3 h-3" /> Done
        </span>
      );
    }
    return (
      <span className="badge badge-warning text-[10px]">
        <Icon name="refresh" className="w-3 h-3 animate-spin" /> In Progress
      </span>
    );
  };

  return (
    <div className="card flex flex-col h-full justify-between">
      <div>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600">
              <Icon name="agent" className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Agent Activity Feed</h3>
              <p className="text-[11px] text-slate-500">Autonomous Operation Logs</p>
            </div>
          </div>
          <button
            onClick={onTriggerAgent}
            className="btn-primary text-xs py-1.5 px-3 shadow-none"
            title="Execute simulated AI task"
          >
            <Icon name="play" className="w-3 h-3" />
            Run Agent
          </button>
        </div>

        {/* Activity Stream */}
        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/70 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                  <Icon name={getAgentIcon(activity.agent)} className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-xs text-slate-900 truncate">{activity.agent}</h4>
                    {getStatusBadge(activity.status)}
                  </div>
                  <p className="text-xs font-medium text-slate-800 mt-1">{activity.action}</p>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{activity.details}</p>
                  <p className="text-[10px] font-semibold text-slate-400 mt-2 flex items-center gap-1">
                    <Icon name="clock" className="w-3 h-3" />
                    {activity.timestamp}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      {onViewAll && (
        <button
          onClick={onViewAll}
          className="mt-4 btn-secondary w-full text-xs font-bold py-2"
        >
          Inspect Full Agent Audit Trail →
        </button>
      )}
    </div>
  );
}
