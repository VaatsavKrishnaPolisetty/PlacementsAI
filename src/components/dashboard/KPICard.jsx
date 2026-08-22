import React, { useRef } from 'react';
import Icon from '../common/Icons';
import { useCountUp, useCardHoverPhysics } from '../../animations/useGsapAnimations';

export default function KPICard({ icon, label, value, subtext, trend, color = 'blue', onClick }) {
  const valueRef = useRef(null);
  const cardRef = useRef(null);

  // Animated numerical count-up on load/change
  useCountUp(valueRef, value);
  // Hover physics
  useCardHoverPhysics(cardRef);

  const colorMap = {
    blue: {
      bg: 'bg-indigo-50/50 hover:bg-indigo-50/80',
      border: 'border-indigo-100',
      iconBg: 'bg-indigo-600 text-white shadow-indigo-500/20',
      text: 'text-indigo-900',
    },
    green: {
      bg: 'bg-emerald-50/50 hover:bg-emerald-50/80',
      border: 'border-emerald-100',
      iconBg: 'bg-emerald-600 text-white shadow-emerald-500/20',
      text: 'text-emerald-900',
    },
    amber: {
      bg: 'bg-amber-50/50 hover:bg-amber-50/80',
      border: 'border-amber-100',
      iconBg: 'bg-amber-600 text-white shadow-amber-500/20',
      text: 'text-amber-900',
    },
    rose: {
      bg: 'bg-rose-50/50 hover:bg-rose-50/80',
      border: 'border-rose-100',
      iconBg: 'bg-rose-600 text-white shadow-rose-500/20',
      text: 'text-rose-900',
    },
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      className={`card ${scheme.border} p-5 transition-all duration-200 cursor-pointer animate-card group`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">{label}</p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <h3 ref={valueRef} className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {value}
            </h3>
            {trend !== undefined && (
              <span
                className={`inline-flex items-center text-xs font-bold px-1.5 py-0.5 rounded-full ${
                  trend >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}
              >
                {trend >= 0 ? '+' : ''}{trend}%
              </span>
            )}
          </div>
          {subtext && <p className="text-xs font-medium text-slate-500 mt-2">{subtext}</p>}
        </div>

        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-md transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110 ${scheme.iconBg}`}>
          <Icon name={icon} className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
