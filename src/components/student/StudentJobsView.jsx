import React, { useState } from 'react';
import Icon from '../common/Icons';
import { useToast } from '../common/ToastContext';
import api from '../../services/api';

export default function StudentJobsView({
  jobs = [],
  student,
  applications = [],
  onApplicationCreated,
  onNavigate,
}) {
  const { showToast } = useToast();
  const [applyingJobId, setApplyingJobId] = useState(null);

  const appliedJobIds = new Set(applications.map((a) => a.jobId));

  const checkEligibility = (job) => {
    const minCGPA = job.requirements?.minCGPA || job.minCGPA || 0;
    const maxBacklogs = job.requirements?.maxBacklogs !== undefined ? job.requirements.maxBacklogs : 0;
    const allowedBranches = (job.requirements?.branches || job.branches || []).map((b) => b.toLowerCase());
    
    const studentCgpa = student?.cgpa !== undefined ? student.cgpa : 8.0;
    const studentBacklogs = student?.backlogs || 0;
    const studentBranch = (student?.branch || student?.department || '').toLowerCase();

    if (studentCgpa < minCGPA) {
      return {
        eligible: false,
        reason: `Minimum CGPA requirement is ${minCGPA} (Your CGPA: ${studentCgpa})`,
      };
    }

    if (studentBacklogs > maxBacklogs) {
      return {
        eligible: false,
        reason: `Maximum ${maxBacklogs} active backlogs allowed (Your backlogs: ${studentBacklogs})`,
      };
    }

    if (allowedBranches.length > 0 && !allowedBranches.some((b) => studentBranch.includes(b))) {
      return {
        eligible: false,
        reason: `Your department (${student?.department || student?.branch}) is not eligible for this drive.`,
      };
    }

    return {
      eligible: true,
      reason: 'All academic criteria, CGPA cutoffs, and branch rules verified.',
    };
  };

  const handleApply = async (job) => {
    // 1. Check resume presence
    if (!student?.resume || !student?.resume?.fileName) {
      showToast("Please upload your resume in the 'My Profile & Resume' section first!", 'warning');
      onNavigate('profile');
      return;
    }

    const elig = checkEligibility(job);
    if (!elig.eligible) {
      showToast(`Cannot apply: ${elig.reason}`, 'error');
      return;
    }

    setApplyingJobId(job.jobId || job.id);
    try {
      const res = await api.applications.apply(student?.studentId || 'STU101', job.jobId || job.id);
      showToast(`🎉 Application submitted successfully for ${job.role || job.title} at ${job.company}!`, 'success');
      if (onApplicationCreated) {
        onApplicationCreated(res.data);
      }
    } catch (err) {
      showToast(err.message || 'Application submission failed', 'error');
    } finally {
      setApplyingJobId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Active Campus Placement Drives</h2>
          <p className="text-xs text-slate-500">
            Browse verified job opportunities with real-time academic eligibility checks and 1-click application submission.
          </p>
        </div>
        <span className="badge badge-info text-xs font-bold self-start sm:self-auto">
          {jobs.length} Active Hiring Drives
        </span>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {jobs.map((job) => {
          const jobId = job.jobId || job.id;
          const isApplied = appliedJobIds.has(jobId);
          const elig = checkEligibility(job);
          const requiredSkills = job.requirements?.requiredSkills || job.skills || ['Python', 'SQL', 'Data Structures'];

          return (
            <div
              key={jobId}
              className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white font-extrabold flex items-center justify-center text-lg shadow-md shrink-0">
                      {job.company ? job.company[0] : 'C'}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm leading-tight">{job.role || job.title}</h3>
                      <p className="text-xs text-indigo-600 font-bold">{job.company}</p>
                    </div>
                  </div>

                  <span className="badge badge-primary text-xs font-extrabold shrink-0">
                    {job.package || '₹16.0 LPA'}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                  {job.description || 'Full-time campus engineering role with high-growth technical trajectory and mentorship.'}
                </p>

                {/* Skills */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Required Skills</span>
                  <div className="flex flex-wrap gap-1.5">
                    {requiredSkills.map((sk, idx) => (
                      <span key={idx} className="badge badge-neutral text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Eligibility Check Banner */}
                <div
                  className={`p-3 rounded-2xl border text-xs space-y-1 ${
                    elig.eligible
                      ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                      : 'bg-rose-50/80 border-rose-200 text-rose-950'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-[11px]">
                    <Icon
                      name={elig.eligible ? 'check-circle' : 'alert-triangle'}
                      className={`w-3.5 h-3.5 ${elig.eligible ? 'text-emerald-600' : 'text-rose-600'}`}
                    />
                    <span>{elig.eligible ? 'Verified Eligible to Apply' : 'Not Eligible for this Drive'}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-700">{elig.reason}</p>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium">
                  Deadline: <strong className="text-slate-800">{job.deadline || 'August 30, 2026'}</strong>
                </span>

                {isApplied ? (
                  <button
                    onClick={() => onNavigate('applications')}
                    className="btn-secondary text-xs py-1.5 px-3 font-bold bg-indigo-50 border-indigo-200 text-indigo-700"
                  >
                    ✓ Applied (Track Status)
                  </button>
                ) : (
                  <button
                    onClick={() => handleApply(job)}
                    disabled={!elig.eligible || applyingJobId === jobId}
                    className={`btn-primary text-xs py-1.5 px-4 font-bold shadow-md flex items-center gap-1.5 ${
                      !elig.eligible ? 'opacity-50 cursor-not-allowed bg-slate-400' : ''
                    }`}
                  >
                    {applyingJobId === jobId ? (
                      <span className="animate-spin">⏳</span>
                    ) : (
                      <Icon name="check-circle" className="w-3.5 h-3.5" />
                    )}
                    Apply Now
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
