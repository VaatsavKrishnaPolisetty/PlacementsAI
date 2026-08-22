import React from 'react';
import { AgentActionItem } from '../../types/placement';
import { ShieldAlert, CheckCircle2, XCircle, Sparkles, ArrowRight, Bot, Clock, AlertTriangle } from 'lucide-react';

interface AgentActionQueueProps {
  actions: AgentActionItem[];
  onApproveAction: (actionId: string) => void;
  onRejectAction: (actionId: string) => void;
}

export const AgentActionQueue: React.FC<AgentActionQueueProps> = ({
  actions,
  onApproveAction,
  onRejectAction
}) => {
  const pendingActions = actions.filter(a => a.status === 'PENDING');
  const pastActions = actions.filter(a => a.status !== 'PENDING');

  return (
    <div className="glass-panel rounded-2xl border border-slate-800/80 p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-['Outfit']">
              Human-in-the-Loop Decision Queue
            </h3>
            <p className="text-xs text-slate-400">
              AI agent detected exceptions & actions requiring placement officer authorization
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 text-xs font-extrabold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
          {pendingActions.length} Pending Actions
        </span>
      </div>

      {/* Action Items List */}
      <div className="space-y-3">
        {pendingActions.length === 0 ? (
          <div className="p-8 rounded-xl bg-slate-900/40 border border-slate-800/60 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
            <h4 className="text-sm font-bold text-slate-200">All Decisions Cleared</h4>
            <p className="text-xs text-slate-400 mt-1">Autonomous agent is operating within verified parameters.</p>
          </div>
        ) : (
          pendingActions.map((action) => (
            <div
              key={action.id}
              className="p-4 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:border-indigo-500/50 transition-all shadow-lg group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full border ${
                        action.priority === 'urgent'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : action.priority === 'high'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                      }`}
                    >
                      {action.category} • {action.priority}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {action.timestamp.split(' ')[1]}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {action.title}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{action.summary}</p>
                </div>
              </div>

              {/* AI Rationale Box */}
              <div className="mt-3 p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-500/20 flex items-start gap-2 text-xs text-indigo-200">
                <Bot className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-cyan-300">AI Recommendation (Confidence: {(action.aiConfidence * 100).toFixed(0)}%): </span>
                  {action.aiRationale}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  onClick={() => onRejectAction(action.id)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5 text-rose-400" /> Reject / Override
                </button>

                <button
                  onClick={() => onApproveAction(action.id)}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Execute
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* History Log Snippet */}
      {pastActions.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            Recently Executed Approvals
          </div>
          <div className="space-y-1.5">
            {pastActions.slice(0, 2).map((a) => (
              <div key={a.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-900/40 text-slate-400">
                <span className="truncate max-w-[280px]">{a.title}</span>
                <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                  a.status === 'APPROVED' ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-300 bg-slate-800'
                }`}>
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
