import React from 'react';
import Icon from '../common/Icons';

export default function ConflictAlert({ conflict, onResolve, onDismiss }) {
  const severityConfig = {
    high: {
      bg: 'bg-rose-50/70 border-rose-200/90',
      iconBg: 'bg-rose-600 text-white shadow-rose-600/20',
      badge: 'badge-error',
      title: 'text-rose-950',
    },
    medium: {
      bg: 'bg-amber-50/70 border-amber-200/90',
      iconBg: 'bg-amber-600 text-white shadow-amber-600/20',
      badge: 'badge-warning',
      title: 'text-amber-950',
    },
    low: {
      bg: 'bg-indigo-50/70 border-indigo-200/90',
      iconBg: 'bg-indigo-600 text-white shadow-indigo-600/20',
      badge: 'badge-info',
      title: 'text-indigo-950',
    },
  };

  const config = severityConfig[conflict.severity] || severityConfig.medium;

  return (
    <div className={`rounded-2xl border p-5 transition-all mb-4 ${config.bg}`}>
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md ${config.iconBg}`}>
          <Icon name="alert-triangle" className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4 className={`font-bold text-sm leading-snug ${config.title}`}>{conflict.title}</h4>
            <span className={`badge ${config.badge} uppercase text-[10px]`}>
              {conflict.severity} Priority
            </span>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed mb-3">{conflict.description}</p>

          {/* AI Resolution Recommendation Box */}
          <div className="p-3.5 bg-white/90 rounded-xl border border-slate-200/80 mb-3 shadow-xs">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Icon name="sparkles" className="w-3 h-3 text-indigo-600" />
              Agent Suggested Resolution
            </p>
            <p className="text-xs font-semibold text-slate-800 leading-snug">
              {conflict.suggestedResolution}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button onClick={() => onResolve?.(conflict)} className="btn-primary text-xs py-1.5 px-3">
              <Icon name="check-circle" className="w-3.5 h-3.5" />
              Apply Autonomous Fix
            </button>
            <button onClick={() => onDismiss?.(conflict.id)} className="btn-secondary text-xs py-1.5 px-3">
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
