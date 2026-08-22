import React, { useRef } from 'react';
import Icon from '../common/Icons';
import { useCardHoverPhysics } from '../../animations/useGsapAnimations';

export default function PipelineStage({ stage, count, icon, isActive, onClick }) {
  const btnRef = useRef(null);
  useCardHoverPhysics(btnRef);

  return (
    <button
      ref={btnRef}
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl transition-all duration-200 cursor-pointer text-left border group animate-card ${
        isActive
          ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/25 ring-2 ring-indigo-600/30'
          : 'bg-white text-slate-700 border-slate-200/90 hover:border-indigo-300 hover:bg-slate-50/80 shadow-sm'
      }`}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${
          isActive ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600'
        }`}
      >
        <Icon name={icon} className="w-5 h-5" />
      </div>

      <div className="text-center">
        <p className={`text-xs font-bold tracking-tight ${isActive ? 'text-white' : 'text-slate-900'}`}>
          {stage}
        </p>
        <p className={`text-xl font-extrabold mt-0.5 ${isActive ? 'text-white' : 'text-indigo-600'}`}>
          {count}
        </p>
      </div>
    </button>
  );
}
