import React from 'react';
import { Student, PlacementDrive, ScheduledInterview } from '../../types/placement';
import {
  BarChart3,
  TrendingUp,
  Download,
  Award,
  Users,
  Building2,
  FileCheck,
  Brain,
  Layers,
  Sparkles,
  PieChart
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PlacementAnalyticsProps {
  students: Student[];
  drives: PlacementDrive[];
  schedules: ScheduledInterview[];
}

export const PlacementAnalytics: React.FC<PlacementAnalyticsProps> = ({
  students,
  drives,
  schedules
}) => {
  const avgCgpa = (students.reduce((acc, s) => acc + s.cgpa, 0) / students.length).toFixed(2);
  const avgReadiness = Math.round(students.reduce((acc, s) => acc + s.readinessScore, 0) / students.length);
  const placedCount = students.filter(s => s.placementStatus === 'Placed').length;
  const inProcessCount = students.filter(s => s.placementStatus === 'In-Process').length;

  const branchBreakdown = [
    { branch: 'CSE', total: 42, placed: 18, avgCgpa: 8.85, readiness: 92 },
    { branch: 'AI & DS', total: 30, placed: 12, avgCgpa: 8.92, readiness: 94 },
    { branch: 'IT', total: 28, placed: 10, avgCgpa: 8.45, readiness: 88 },
    { branch: 'ECE', total: 35, placed: 8, avgCgpa: 8.20, readiness: 84 },
    { branch: 'EEE', total: 20, placed: 4, avgCgpa: 8.05, readiness: 79 },
    { branch: 'MECH', total: 25, placed: 5, avgCgpa: 7.75, readiness: 72 }
  ];

  const highDemandSkills = [
    { skill: 'Distributed Systems & Microservices', demand: 94, readiness: 78, gap: 16 },
    { skill: 'PyTorch & LLM Fine-Tuning', demand: 90, readiness: 82, gap: 8 },
    { skill: 'System Design & High Concurrency', demand: 96, readiness: 72, gap: 24 },
    { skill: 'Docker & Kubernetes (DevOps)', demand: 85, readiness: 70, gap: 15 },
    { skill: 'C++ & Low Latency Performance', demand: 88, readiness: 80, gap: 8 }
  ];

  const handleExportAuditReport = () => {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 }
    });

    const reportContent = `CAMPUS PLACEMENT OPERATIONS AUDIT REPORT
Generated: ${new Date().toLocaleString()}
==============================================
Active Drives: ${drives.length}
Total Evaluated Candidates: ${students.length}
Scheduled Interviews: ${schedules.length}
Average Batch CGPA: ${avgCgpa}
Average Placement Readiness Score: ${avgReadiness}%

Department Summary:
${branchBreakdown.map(b => `- ${b.branch}: ${b.placed}/${b.total} Placed (${b.readiness}% Readiness)`).join('\n')}

High Demand Skill Gaps:
${highDemandSkills.map(s => `- ${s.skill}: Gap of ${s.gap}%`).join('\n')}
==============================================
Autonomous AI Placement Operations Agent v2.6`;

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Placement_Audit_Report_${Date.now()}.txt`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header & Export Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-white font-['Outfit']">
              Skill-Gap & Placement Readiness Analytics
            </h2>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Batch Intelligence
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Real-time employability telemetry, department performance, and high-demand skill gap diagnostics
          </p>
        </div>

        <button
          onClick={handleExportAuditReport}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span>Export Official Audit Report</span>
        </button>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl border border-slate-800 p-4 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Average CGPA</span>
          <div className="text-2xl font-black text-white font-mono">{avgCgpa}</div>
          <span className="text-[11px] text-emerald-400 font-semibold">Top 15% in University</span>
        </div>

        <div className="glass-panel rounded-2xl border border-slate-800 p-4 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Placement Readiness</span>
          <div className="text-2xl font-black text-cyan-400 font-mono">{avgReadiness}%</div>
          <span className="text-[11px] text-cyan-300 font-semibold">+12% vs previous cohort</span>
        </div>

        <div className="glass-panel rounded-2xl border border-slate-800 p-4 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">In-Process Shortlists</span>
          <div className="text-2xl font-black text-indigo-400 font-mono">{students.length} Candidates</div>
          <span className="text-[11px] text-indigo-300 font-semibold">100% Verified profiles</span>
        </div>

        <div className="glass-panel rounded-2xl border border-slate-800 p-4 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Company Drives</span>
          <div className="text-2xl font-black text-amber-400 font-mono">{drives.length} Drives</div>
          <span className="text-[11px] text-amber-300 font-semibold">Google, Microsoft, GS, TCS</span>
        </div>
      </div>

      {/* Department Readiness & Skill-Gap Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Department Breakdown */}
        <div className="lg:col-span-6 glass-panel rounded-2xl border border-slate-800 p-5 space-y-4">
          <h3 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400" />
            Department Readiness & Eligibility Index
          </h3>

          <div className="space-y-3">
            {branchBreakdown.map((dept) => (
              <div key={dept.branch} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white text-sm">{dept.branch}</span>
                  <span className="font-mono text-cyan-400 font-bold">{dept.readiness}% Readiness</span>
                </div>

                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"
                    style={{ width: `${dept.readiness}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Batch: {dept.total} Students</span>
                  <span>Avg CGPA: {dept.avgCgpa}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* High-Demand Skills vs Campus Gap */}
        <div className="lg:col-span-6 glass-panel rounded-2xl border border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
              <Brain className="w-4 h-4 text-cyan-400" />
              Industry Demand vs Campus Skill Gaps
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Curated from 12+ JDs</span>
          </div>

          <div className="space-y-3">
            {highDemandSkills.map((sk) => (
              <div key={sk.skill} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">{sk.skill}</span>
                  <span className="text-[11px] font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                    Gap: {sk.gap}%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Company Requirement</span>
                    <span className="font-mono text-cyan-400 font-bold">{sk.demand}%</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Cohort Proficiency</span>
                    <span className="font-mono text-emerald-400 font-bold">{sk.readiness}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
