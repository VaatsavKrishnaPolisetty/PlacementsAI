import React, { useRef } from 'react';
import Icon from '../common/Icons';
import { useCardHoverPhysics } from '../../animations/useGsapAnimations';

export default function CompanyCard({ company, onSelect }) {
  const cardRef = useRef(null);
  useCardHoverPhysics(cardRef);

  const isActive = company.status === 'active';

  return (
    <div
      ref={cardRef}
      className="card-interactive p-5 flex flex-col justify-between animate-card"
      onClick={() => onSelect?.(company)}
    >
      <div>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-slate-900 text-white font-black flex items-center justify-center text-sm shadow-md shadow-slate-900/10">
              {company.logoText || company.name.substring(0, 3).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm leading-snug">{company.name}</h3>
              <p className="text-xs text-slate-500 font-medium">{company.tier || 'Enterprise Partner'}</p>
            </div>
          </div>

          <span className={`badge ${isActive ? 'badge-success' : 'badge-neutral'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            {isActive ? 'Active' : 'Paused'}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 mb-4 text-xs">
          <div>
            <span className="text-slate-500 font-medium">Active JDs:</span>
            <p className="font-bold text-slate-900 mt-0.5">{company.activeJDs} of {company.jdCount} roles</p>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Candidate Fit:</span>
            <p className="font-bold text-indigo-600 mt-0.5">{company.totalMatches} matched</p>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Offers Issued:</span>
            <p className="font-bold text-emerald-600 mt-0.5">{company.offersGenerated} confirmed</p>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Avg CTC:</span>
            <p className="font-bold text-slate-900 mt-0.5">{company.avgCTC}</p>
          </div>
        </div>
      </div>

      {/* Footer Action */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
          <Icon name="map-pin" className="w-3.5 h-3.5 text-slate-400" />
          {company.location?.split(',')[0] || 'Multi-city'}
        </span>
        <button className="btn-ghost text-xs py-1 px-2.5 font-bold">
          View JDs <Icon name="chevron-right" className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
