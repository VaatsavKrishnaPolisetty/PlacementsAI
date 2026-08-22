import React from 'react';
import { Student, PlacementDrive } from '../../types/placement';
import { analyzeCandidateMatch } from '../../services/matcherEngine';
import {
  X,
  Award,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Phone,
  Code2,
  Layers,
  Sparkles,
  BookOpen,
  Globe,
  ExternalLink
} from 'lucide-react';

interface StudentProfileModalProps {
  student: Student | null;
  selectedDrive: PlacementDrive;
  onClose: () => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  student,
  selectedDrive,
  onClose
}) => {
  if (!student) return null;

  const analysis = analyzeCandidateMatch(student, selectedDrive);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-indigo-500/40 rounded-2xl shadow-2xl overflow-y-auto p-6 flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-4">
              <img
                src={student.avatar}
                alt={student.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-500 shadow-lg"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-white font-['Outfit']">{student.name}</h3>
                  <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {student.usn}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">{student.resumeHeadline}</p>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
                  <span className="flex items-center gap-1 font-semibold text-slate-300">
                    {student.branch} • Semester {student.semester}
                  </span>
                  <span>•</span>
                  <span className="text-cyan-400 font-bold font-mono">CGPA: {student.cgpa.toFixed(2)}</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-bold">Readiness: {student.readinessScore}%</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* AI Match Overview Banner for Selected Drive */}
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-indigo-950/60 to-slate-900 border border-indigo-500/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-extrabold text-indigo-300 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Target Drive Match: {selectedDrive.companyName} ({selectedDrive.role})
              </div>
              <span className="text-lg font-black text-cyan-400 font-mono">
                {analysis.matchScore}% Match
              </span>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              {analysis.aiExplanation}
            </p>

            {/* Score Breakdown Bars */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-800/80 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] block">Academic Fit</span>
                <span className="font-bold text-white">{analysis.academicScore}%</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Core Mandatory Skills</span>
                <span className="font-bold text-cyan-400">{analysis.coreSkillScore}%</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Secondary Skills</span>
                <span className="font-bold text-indigo-300">{analysis.secondarySkillScore}%</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Projects & Certs</span>
                <span className="font-bold text-emerald-400">{analysis.projectScore}%</span>
              </div>
            </div>
          </div>

          {/* Skills Breakdown with Proficiency Bars */}
          <div className="mt-6">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Technical Skill Matrix & Verification
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {student.skills.map((skill, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-200 flex items-center gap-1.5">
                      {skill.name}
                      {skill.verified && (
                        <span title="Campus Verified">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        </span>
                      )}
                    </span>
                    <span className="font-mono text-cyan-400 font-semibold">{skill.level}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"
                      style={{ width: `${skill.level}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Projects & Certifications */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <h5 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-indigo-400" /> Featured Capstone
              </h5>
              <div className="font-semibold text-white">{student.topProject}</div>
              <p className="text-slate-400 text-[11px] mt-1">{student.projectsCount} total academic & open-source projects</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <h5 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" /> Industry Certifications
              </h5>
              <div className="flex flex-wrap gap-1">
                {student.certifications.map((cert, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 text-[11px]">
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Skill Gap & Recommendations */}
          <div className="mt-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
            <h5 className="font-bold text-amber-400 uppercase tracking-wider text-[11px] mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" /> AI Bridge Recommendations
            </h5>
            <ul className="space-y-1 text-slate-300 pl-4 list-disc">
              {analysis.skillGapRemediation.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
