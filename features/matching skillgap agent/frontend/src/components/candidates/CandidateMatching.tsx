import React, { useEffect, useState } from 'react';
import { Student, PlacementDrive } from '../../types/placement';
import { rankCandidatesForDrive } from '../../services/matcherEngine';
import { rankCandidatesFromApi } from '../../services/matchingApi';
import { TalentCosmos3D } from '../3d/TalentCosmos3D';
import { StudentProfileModal } from './StudentProfileModal';
import {
  Orbit,
  ListFilter,
  Sparkles,
  Award,
  Search,
  CheckCircle2,
  TrendingUp,
  BrainCircuit,
  Eye,
  CalendarCheck,
  UserCheck
} from 'lucide-react';

interface CandidateMatchingProps {
  students: Student[];
  drives: PlacementDrive[];
  selectedDrive: PlacementDrive;
  onSelectDrive: (drive: PlacementDrive) => void;
  onShortlistCandidate: (driveId: string, studentId: string) => void;
}

export const CandidateMatching: React.FC<CandidateMatchingProps> = ({
  students,
  drives,
  selectedDrive,
  onSelectDrive,
  onShortlistCandidate
}) => {
  const [viewMode, setViewMode] = useState<'3D_COSMOS' | 'GRID_VIEW'>('3D_COSMOS');
  const [selectedStudentForModal, setSelectedStudentForModal] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMinScore, setFilterMinScore] = useState<number>(0);
  const [ranked, setRanked] = useState(() => rankCandidatesForDrive(students, selectedDrive));
  const [matchingSource, setMatchingSource] = useState<'API' | 'LOCAL'>('LOCAL');

  useEffect(() => {
    let active = true;
    rankCandidatesFromApi(students, selectedDrive)
      .then((results) => {
        if (active) {
          setRanked(results);
          setMatchingSource('API');
        }
      })
      .catch(() => {
        if (active) {
          setRanked(rankCandidatesForDrive(students, selectedDrive));
          setMatchingSource('LOCAL');
        }
      });
    return () => { active = false; };
  }, [students, selectedDrive]);

  const filteredRanked = ranked.filter(({ student, analysis }) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.usn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.branch.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesScore = analysis.matchScore >= filterMinScore;
    return matchesSearch && matchesScore;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Drive Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-white font-['Outfit']">
              AI Candidate Matching & Skill Gap Engine
            </h2>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {matchingSource === 'API' ? 'Live Matching API' : 'Local Fallback'}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Semantic match scoring across Academic Fit, Core Mandatory Skills, Secondary Skills, and Capstone Projects
          </p>
        </div>

        {/* View Mode & Drive Selector */}
        <div className="flex items-center gap-3">
          <select
            value={selectedDrive.id}
            onChange={(e) => {
              const d = drives.find(x => x.id === e.target.value);
              if (d) onSelectDrive(d);
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-indigo-500 shadow-md"
          >
            {drives.map(d => (
              <option key={d.id} value={d.id}>
                Target: {d.companyName} ({d.role})
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setViewMode('3D_COSMOS')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === '3D_COSMOS'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Orbit className="w-3.5 h-3.5" /> 3D Talent Cosmos
            </button>
            <button
              onClick={() => setViewMode('GRID_VIEW')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'GRID_VIEW'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" /> AI Rankings Table
            </button>
          </div>
        </div>
      </div>

      {/* 3D Talent Cosmos View */}
      {viewMode === '3D_COSMOS' && (
        <TalentCosmos3D
          students={students}
          selectedDrive={selectedDrive}
          onSelectStudent={(std) => setSelectedStudentForModal(std)}
        />
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search ranked candidate..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-semibold">Min Score:</span>
          {[0, 75, 85, 90].map((score) => (
            <button
              key={score}
              onClick={() => setFilterMinScore(score)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                filterMinScore === score
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {score === 0 ? 'All' : `≥ ${score}%`}
            </button>
          ))}
        </div>
      </div>

      {/* Candidate Ranking & Match Explanation Cards */}
      <div className="grid grid-cols-1 gap-4">
        {filteredRanked.map(({ student, analysis }, index) => {
          const isShortlisted = selectedDrive.shortlistedCandidateIds.includes(student.id);

          return (
            <div
              key={student.id}
              className="glass-panel rounded-2xl border border-slate-800/80 p-5 hover:border-indigo-500/50 transition-all duration-200 shadow-xl group relative overflow-hidden"
            >
              {/* Top Accent Gradient based on match */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 ${
                  analysis.matchScore >= 90
                    ? 'bg-gradient-to-r from-emerald-400 to-cyan-400'
                    : analysis.matchScore >= 80
                    ? 'bg-gradient-to-r from-cyan-400 to-indigo-500'
                    : 'bg-gradient-to-r from-amber-400 to-rose-400'
                }`}
              />

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Candidate Info */}
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <img
                      src={student.avatar}
                      alt={student.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-500/60 shadow-md"
                    />
                    <span className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-slate-900 border border-slate-700 text-[11px] font-mono font-black text-indigo-300 flex items-center justify-center">
                      #{index + 1}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {student.name}
                      </h3>
                      <span className="px-2 py-0.5 text-[11px] font-mono font-semibold rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {student.usn}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">{student.branch}</span>
                    </div>

                    <p className="text-xs text-slate-300 mt-1 line-clamp-1">{student.resumeHeadline}</p>

                    {/* Skill Tags */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {student.skills.slice(0, 4).map((sk, idx) => {
                        const isMandatory = selectedDrive.mandatorySkills.some(
                          ms => ms.toLowerCase() === sk.name.toLowerCase()
                        );
                        return (
                          <span
                            key={idx}
                            className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                              isMandatory
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {sk.name} ({sk.level}%)
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Match Score & Actions */}
                <div className="flex items-center justify-between lg:justify-end gap-6 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      Semantic Fit Score
                    </div>
                    <div
                      className={`text-2xl font-black font-mono ${
                        analysis.matchScore >= 90
                          ? 'text-emerald-400'
                          : analysis.matchScore >= 80
                          ? 'text-cyan-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {analysis.matchScore}%
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedStudentForModal(student)}
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
                      title="Inspect full resume & AI explanation"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onShortlistCandidate(selectedDrive.id, student.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isShortlisted
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 active:scale-95'
                      }`}
                    >
                      {isShortlisted ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Shortlisted</span>
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-4 h-4" />
                          <span>Shortlist for Drive</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Natural Language AI Explanation Box */}
              <div className="mt-4 p-3 rounded-xl bg-slate-950/80 border border-indigo-500/20 flex items-start gap-2.5 text-xs text-slate-300">
                <BrainCircuit className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold text-cyan-300">AI Match Rationale: </span>
                  {analysis.aiExplanation}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Student Profile Modal */}
      <StudentProfileModal
        student={selectedStudentForModal}
        selectedDrive={selectedDrive}
        onClose={() => setSelectedStudentForModal(null)}
      />
    </div>
  );
};
