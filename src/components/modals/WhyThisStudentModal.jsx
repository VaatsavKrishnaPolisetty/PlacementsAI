import React, { useState } from 'react';
import Icon from '../common/Icons';

export default function WhyThisStudentModal({ student, jd, matchDetail, readinessPlan, onClose, onSchedule }) {
  const [activeTab, setActiveTab] = useState('pillars');
  const [planTasks, setPlanTasks] = useState(
    readinessPlan?.plan || [
      {
        day: 1,
        topic: 'Distributed Systems & Concurrency Foundations',
        tasks: ['Review Thread Pools & Event Loop architecture', 'Practice 3 medium LeetCode concurrency tasks'],
        completed: false,
      },
      {
        day: 2,
        topic: 'Production SQL & Database Indexing',
        tasks: ['Analyze EXPLAIN execution plans on multi-table JOINs', 'Implement Redis Cache-Aside pattern'],
        completed: false,
      },
      {
        day: 3,
        topic: 'System Design Mock & Technical Presentation',
        tasks: ['Mock interview on Scalable URL Shortener architecture', 'Practice behavioral STAR method stories'],
        completed: false,
      },
    ]
  );

  if (!student) return null;

  const score = matchDetail?.matchScore || student.resumeScore || 88;
  const breakdown = matchDetail?.breakdown || {
    coreSkills: 92,
    projectRelevance: 85,
    preferredSkills: 75,
    academics: 88,
    experience: 80,
  };

  const toggleTask = (dayIdx, taskIdx) => {
    setPlanTasks((prev) =>
      prev.map((dayItem, dIdx) => {
        if (dIdx !== dayIdx) return dayItem;
        return {
          ...dayItem,
          completed: !dayItem.completed,
        };
      })
    );
  };

  const evidenceList = matchDetail?.evidence?.details || [
    { skill: 'Python', source: 'skill', title: 'Resume Skills', description: 'Listed as primary proficiency in verified technical profile' },
    { skill: 'Distributed Systems', source: 'project', title: 'Task Queue Engine', description: 'Built production asynchronous distributed worker queue with Redis' },
    { skill: 'AWS Cloud', source: 'certification', title: 'AWS Solutions Architect', description: 'Industry accredited certification with active verification ID' },
    { skill: 'SQL & DB Optimization', source: 'experience', title: 'Internship at TechCorp', description: 'Engineered high-throughput query pipelines handling 10k req/sec' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-extrabold flex items-center justify-center text-lg shadow-lg">
              {student.name ? student.name[0] : 'S'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-extrabold tracking-tight">{student.name}</h3>
                <span className="badge badge-success text-[11px] font-bold">
                  {score >= 75 ? 'Top Shortlist' : 'High Potential'}
                </span>
              </div>
              <p className="text-xs text-indigo-200 font-medium">
                Explainable Match Analysis for {jd?.role || 'Software Development Engineer'} ({jd?.company || 'Recruiting Partner'})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 flex items-center justify-center transition-colors"
          >
            <Icon name="x" className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-100 bg-slate-50/70 text-xs font-bold">
          <button
            onClick={() => setActiveTab('pillars')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'pillars'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Icon name="target" className="w-4 h-4" />
            5-Pillar Score Breakdown
          </button>
          <button
            onClick={() => setActiveTab('evidence')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'evidence'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Icon name="shield-check" className="w-4 h-4" />
            Verified Evidence ({evidenceList.length})
          </button>
          <button
            onClick={() => setActiveTab('plan')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'plan'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Icon name="calendar" className="w-4 h-4" />
            3-Day Technical Readiness Plan
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Explanation Banner */}
          <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-100 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shrink-0">
              <Icon name="sparkles" className="w-5 h-5" />
            </div>
            <div className="space-y-1 text-xs">
              <div className="font-extrabold text-indigo-950 text-sm">Why This Student Was Selected</div>
              <p className="text-slate-700 leading-relaxed">
                {matchDetail?.explanation ||
                  `${student.name} ranks in the top percentile due to strong core technical alignment (${breakdown.coreSkills}%), verified project artifacts, and clean academic record with zero backlogs.`}
              </p>
            </div>
          </div>

          {/* TAB 1: 5-PILLAR BREAKDOWN */}
          {activeTab === 'pillars' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overall Match Score</span>
                <span className="text-2xl font-black text-indigo-600">{score}/100</span>
              </div>

              <div className="space-y-3">
                {[
                  { label: 'Core Technical Requirements (50%)', val: breakdown.coreSkills, color: 'bg-indigo-600' },
                  { label: 'Project Relevance & Artifacts (20%)', val: breakdown.projectRelevance, color: 'bg-blue-600' },
                  { label: 'Preferred & Bonus Skills (10%)', val: breakdown.preferredSkills, color: 'bg-purple-600' },
                  { label: 'Academic Standing & CGPA (10%)', val: breakdown.academics, color: 'bg-emerald-600' },
                  { label: 'Internships & Industry Certifications (10%)', val: breakdown.experience, color: 'bg-amber-500' },
                ].map((pillar, idx) => (
                  <div key={idx} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between font-semibold text-slate-700">
                      <span>{pillar.label}</span>
                      <span className="font-mono font-bold text-slate-900">{pillar.val}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${pillar.color} rounded-full transition-all duration-700 ease-out`}
                        style={{ width: `${pillar.val}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Matched vs Gaps Badges */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-2">
                  <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    <Icon name="check-circle" className="w-4 h-4 text-emerald-600" />
                    Verified Matched Skills
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(matchDetail?.matchedSkills || student.skills || ['Python', 'SQL', 'Data Structures', 'AWS']).map((sk, i) => (
                      <span key={i} className="badge badge-success text-[10px]">
                        ✓ {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-100 space-y-2">
                  <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <Icon name="alert-triangle" className="w-4 h-4 text-amber-600" />
                    Identified Skill Gaps (Target for 3-Day Prep)
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(matchDetail?.skillGaps || ['Docker', 'System Design']).map((g, i) => (
                      <span key={i} className="badge badge-warning text-[10px]">
                        ! {g}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VERIFIED EVIDENCE */}
          {activeTab === 'evidence' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Transparent audit trail of student claims backed by GitHub repositories, transcript evaluations, and industry credentials:
              </p>
              <div className="space-y-2.5">
                {evidenceList.map((ev, i) => (
                  <div key={i} className="p-3.5 rounded-2xl border border-slate-200/90 bg-slate-50/60 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-indigo-600 shrink-0 font-bold text-xs">
                      {ev.source === 'project' ? '💻' : ev.source === 'certification' ? '📜' : '⭐'}
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900">{ev.title}</span>
                        <span className="badge badge-neutral text-[9px] uppercase font-bold">{ev.source}</span>
                      </div>
                      <p className="text-slate-600">{ev.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: 3-DAY READINESS PLAN */}
          {activeTab === 'plan' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">Customized 3-Day Interview Preparation Roadmap</h4>
                  <p className="text-xs text-slate-500">Generated automatically by Readiness Coach Agent targeting job skill gaps</p>
                </div>
                <span className="badge badge-primary text-xs font-bold">Target CTC: {jd?.package || '₹16 LPA'}</span>
              </div>

              <div className="space-y-3">
                {planTasks.map((dayPlan, dIdx) => (
                  <div key={dIdx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-extrabold text-[10px]">
                          Day {dayPlan.day}
                        </span>
                        <span className="font-bold text-slate-900 text-xs">{dayPlan.topic}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 pl-2">
                      {dayPlan.tasks?.map((task, tIdx) => (
                        <label key={tIdx} className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={dayPlan.completed}
                            onChange={() => toggleTask(dIdx, tIdx)}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                          />
                          <span>{task}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="btn-ghost text-xs py-2 px-4 font-bold"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                if (onSchedule) onSchedule(student);
              }}
              className="btn-primary text-xs py-2 px-4 shadow-md"
            >
              <Icon name="calendar" className="w-3.5 h-3.5" />
              Schedule Interview for {student.name}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
