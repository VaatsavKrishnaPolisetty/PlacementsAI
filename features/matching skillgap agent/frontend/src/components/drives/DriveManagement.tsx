import React, { useState } from 'react';
import { PlacementDrive, Student, EligibilityEvaluation } from '../../types/placement';
import { evaluateBatchEligibility } from '../../services/eligibilityEngine';
import {
  Building2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Sparkles,
  Users,
  Award,
  Filter,
  Search,
  Check,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface DriveManagementProps {
  drives: PlacementDrive[];
  students: Student[];
  selectedDrive: PlacementDrive;
  onSelectDrive: (drive: PlacementDrive) => void;
  overrides: Record<string, 'APPROVED' | 'REJECTED' | 'REQUESTED'>;
  onToggleOverride: (studentId: string, driveId: string, status: 'APPROVED' | 'REJECTED') => void;
  onOpenJDExtractor: () => void;
}

export const DriveManagement: React.FC<DriveManagementProps> = ({
  drives,
  students,
  selectedDrive,
  onSelectDrive,
  overrides,
  onToggleOverride,
  onOpenJDExtractor
}) => {
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'Eligible' | 'Ineligible' | 'Conditional_Exception'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Evaluate batch eligibility for selected drive
  const eligibilityMap = evaluateBatchEligibility(students, selectedDrive, overrides);

  const filteredStudents = students.filter(student => {
    const result = eligibilityMap[student.id];
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.usn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.branch.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (filterStatus === 'ALL') return true;
    return result?.status === filterStatus;
  });

  const eligibleCount = Object.values(eligibilityMap).filter(e => e.isEligible).length;
  const exceptionCount = Object.values(eligibilityMap).filter(e => e.status === 'Conditional_Exception').length;
  const ineligibleCount = students.length - eligibleCount;

  return (
    <div className="space-y-6">
      {/* Drives Carousel / Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-white font-['Outfit']">Active Placement Drives</h2>
            <p className="text-xs text-slate-400">Select a drive to evaluate candidate eligibility rules and waivers</p>
          </div>

          <button
            onClick={onOpenJDExtractor}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>AI Parse New JD</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {drives.map((drive) => {
            const isSelected = selectedDrive.id === drive.id;
            return (
              <div
                key={drive.id}
                onClick={() => onSelectDrive(drive)}
                className={`p-4 rounded-2xl cursor-pointer transition-all duration-200 border relative overflow-hidden ${
                  isSelected
                    ? 'glass-panel-glow border-indigo-500/80 bg-slate-900/90 shadow-2xl scale-[1.02]'
                    : 'glass-card border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500" />
                )}

                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-md">
                    <img src={drive.logo} alt={drive.companyName} className="max-h-full max-w-full object-contain" />
                  </div>

                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${
                      drive.status === 'Active'
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {drive.status}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white truncate">{drive.companyName}</h3>
                <p className="text-xs text-indigo-300 font-medium truncate mb-2">{drive.role}</p>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800 text-slate-400">
                  <div>
                    <span className="text-[10px] text-slate-500 block">CTC</span>
                    <span className="font-bold text-emerald-400">{drive.ctc}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Cutoff</span>
                    <span className="font-bold text-cyan-400">{drive.minCgpa.toFixed(2)} CGPA</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Drive Eligibility Breakdown */}
      <div className="glass-panel rounded-2xl border border-slate-800/80 p-6 shadow-2xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-black text-white font-['Outfit']">
                {selectedDrive.companyName} — Eligibility & Verification Matrix
              </h3>
              <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {selectedDrive.role}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Cutoff: ≥ {selectedDrive.minCgpa.toFixed(2)} CGPA • Max Backlogs: {selectedDrive.maxActiveBacklogs} • Branches: {selectedDrive.allowedBranches.join(', ')}
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-3">
            <div className="px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block">Eligible Pool</span>
              <span className="text-base font-black text-emerald-300">{eligibleCount}</span>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
              <span className="text-[10px] uppercase font-bold text-amber-400 block">Conditional Exceptions</span>
              <span className="text-base font-black text-amber-300">{exceptionCount}</span>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
              <span className="text-[10px] uppercase font-bold text-rose-400 block">Ineligible</span>
              <span className="text-base font-black text-rose-300">{ineligibleCount}</span>
            </div>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search candidate by name, USN, or branch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
            {(['ALL', 'Eligible', 'Conditional_Exception', 'Ineligible'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  filterStatus === st
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st === 'Conditional_Exception' ? 'Exceptions' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Candidates Eligibility Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Candidate & USN</th>
                <th className="py-3 px-4">Branch</th>
                <th className="py-3 px-4">CGPA</th>
                <th className="py-3 px-4">Backlogs</th>
                <th className="py-3 px-4">Status & Rule Diagnostics</th>
                <th className="py-3 px-4 text-right">Human Override</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/40 font-medium">
              {filteredStudents.map((student) => {
                const evalRes = eligibilityMap[student.id];
                const isApproved = evalRes.manualOverrideStatus === 'APPROVED';

                return (
                  <tr key={student.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-700"
                        />
                        <div>
                          <div className="font-bold text-white">{student.name}</div>
                          <div className="text-[11px] font-mono text-slate-400">{student.usn}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300 font-semibold">{student.branch}</td>

                    <td className="py-3.5 px-4">
                      <span className={`font-mono font-extrabold ${student.cgpa >= selectedDrive.minCgpa ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {student.cgpa.toFixed(2)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`font-mono font-bold ${student.activeBacklogs === 0 ? 'text-slate-300' : 'text-rose-400'}`}>
                        {student.activeBacklogs} Active
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      {evalRes.isEligible ? (
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span className="font-bold">{isApproved ? 'Waiver Approved' : 'Verified Eligible'}</span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                            <XCircle className="w-4 h-4 shrink-0" />
                            <span>Ineligible</span>
                          </div>
                          <div className="text-[11px] text-slate-400 leading-tight">
                            {evalRes.violations.map((v, i) => (
                              <div key={i}>• {v.message}</div>
                            ))}
                          </div>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {evalRes.isEligible && !isApproved ? (
                        <span className="text-[11px] text-slate-500">Criteria Met</span>
                      ) : isApproved ? (
                        <button
                          onClick={() => onToggleOverride(student.id, selectedDrive.id, 'REJECTED')}
                          className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30"
                        >
                          Revoke Waiver
                        </button>
                      ) : (
                        <button
                          onClick={() => onToggleOverride(student.id, selectedDrive.id, 'APPROVED')}
                          className="px-3 py-1 text-[11px] font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all flex items-center gap-1 ml-auto"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" /> Grant Waiver
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
