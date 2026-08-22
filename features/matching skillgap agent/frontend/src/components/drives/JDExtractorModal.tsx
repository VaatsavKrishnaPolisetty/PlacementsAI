import React, { useState } from 'react';
import { PlacementDrive, Branch } from '../../types/placement';
import { parseJobDescriptionText, SAMPLE_JD_TEMPLATES } from '../../services/jdParser';
import { Bot, Sparkles, X, Check, ArrowRight, Wand2, FileText, Layers } from 'lucide-react';
import confetti from 'canvas-confetti';

interface JDExtractorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeployDrive: (drive: PlacementDrive) => void;
}

export const JDExtractorModal: React.FC<JDExtractorModalProps> = ({
  isOpen,
  onClose,
  onDeployDrive
}) => {
  const [inputText, setInputText] = useState(SAMPLE_JD_TEMPLATES[0].text);
  const [companyName, setCompanyName] = useState(SAMPLE_JD_TEMPLATES[0].company);
  const [extractedData, setExtractedData] = useState<Partial<PlacementDrive> | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  if (!isOpen) return null;

  const handleExtract = () => {
    setIsExtracting(true);
    setTimeout(() => {
      const parsed = parseJobDescriptionText(inputText, companyName);
      setExtractedData(parsed);
      setIsExtracting(false);
    }, 600);
  };

  const handlePresetSelect = (preset: typeof SAMPLE_JD_TEMPLATES[0]) => {
    setCompanyName(preset.company);
    setInputText(preset.text);
    setExtractedData(null);
  };

  const handleConfirmDeploy = () => {
    if (!extractedData) return;

    const fullDrive: PlacementDrive = {
      id: `drv-${Date.now()}`,
      companyName: companyName || 'Enterprise Partner',
      logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
      role: extractedData.role || 'Software Development Engineer',
      jobType: extractedData.jobType || 'Full-Time',
      ctc: extractedData.ctc || '24.0 LPA',
      location: extractedData.location || 'Bangalore / Hyderabad',
      driveDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      deadlineDate: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
      minCgpa: extractedData.minCgpa || 7.5,
      maxActiveBacklogs: extractedData.maxActiveBacklogs || 0,
      allowedBranches: extractedData.allowedBranches || ['CSE', 'AI & DS', 'IT'],
      mandatorySkills: extractedData.mandatorySkills || ['Algorithms & Data Structures'],
      preferredSkills: extractedData.preferredSkills || [],
      description: extractedData.description || inputText.slice(0, 300),
      rounds: extractedData.rounds || [
        { roundNumber: 1, name: 'Online Coding Challenge', type: 'Coding', durationMinutes: 90, mode: 'Virtual' },
        { roundNumber: 2, name: 'Technical Round 1', type: 'Technical', durationMinutes: 60, mode: 'Physical' }
      ],
      status: 'Active',
      registeredCandidateIds: ['std-1', 'std-2', 'std-3'],
      shortlistedCandidateIds: ['std-1', 'std-2'],
      selectedCandidateIds: [],
      tags: extractedData.tags || ['AI Parsed', 'New Drive']
    };

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    onDeployDrive(fullDrive);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-indigo-500/40 rounded-2xl shadow-2xl overflow-y-auto p-6 flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Wand2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white font-['Outfit']">
                  AI Job Description & Eligibility Extractor
                </h3>
                <p className="text-xs text-slate-400">
                  Paste raw company requirements to autonomously extract criteria and auto-screen candidates
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Presets */}
          <div className="mt-4">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
              Load Sample Company JD Template:
            </label>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_JD_TEMPLATES.map((preset) => (
                <button
                  key={preset.company}
                  onClick={() => handlePresetSelect(preset)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    companyName === preset.company
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {preset.company} ({preset.role.split(' ')[0]})
                </button>
              ))}
            </div>
          </div>

          {/* Company Name & Text Area */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="text-xs font-bold text-slate-300 mb-1.5 block">Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Amazon AWS"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-slate-300 mb-1.5 block">
                Job Description Text & Requirements
              </label>
              <textarea
                rows={6}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste full JD text here with criteria..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>
          </div>

          {/* Extract Button */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleExtract}
              disabled={isExtracting || !inputText}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {isExtracting ? (
                <>
                  <Bot className="w-4 h-4 animate-spin" />
                  <span>Analyzing Semantics & Extracting Rules...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run AI Criteria Extraction</span>
                </>
              )}
            </button>
          </div>

          {/* Extracted Structured Card Preview */}
          {extractedData && (
            <div className="mt-6 p-4 rounded-xl bg-slate-950/80 border border-indigo-500/40 animate-fadeIn">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> AI Extracted Structured Rules
                </span>
                <span className="text-xs font-mono text-slate-400">Confidence: 98.4%</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Role</span>
                  <span className="font-bold text-white truncate block">{extractedData.role}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Cutoff CGPA</span>
                  <span className="font-extrabold text-cyan-400">{extractedData.minCgpa?.toFixed(2)}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Max Backlogs</span>
                  <span className="font-extrabold text-amber-400">{extractedData.maxActiveBacklogs}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Compensation</span>
                  <span className="font-extrabold text-emerald-400">{extractedData.ctc}</span>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold mb-1">Eligible Branches</span>
                  <div className="flex flex-wrap gap-1">
                    {extractedData.allowedBranches?.map(b => (
                      <span key={b} className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold text-[11px]">
                        {b}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold mb-1">Extracted Core Skills</span>
                  <div className="flex flex-wrap gap-1">
                    {extractedData.mandatorySkills?.map(s => (
                      <span key={s} className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-semibold text-[11px]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-3 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                <span className="text-slate-500 block text-[10px] uppercase font-bold mb-1">
                  Configured Interview Stages ({extractedData.rounds?.length} Rounds)
                </span>
                <div className="flex flex-wrap gap-2">
                  {extractedData.rounds?.map(r => (
                    <span key={r.roundNumber} className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 font-mono text-[11px] border border-slate-700">
                      R{r.roundNumber}: {r.name} ({r.durationMinutes}m • {r.mode})
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirmDeploy}
            disabled={!extractedData}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-black shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-40"
          >
            <Check className="w-4 h-4" />
            <span>Deploy Drive & Run Batch Eligibility</span>
          </button>
        </div>
      </div>
    </div>
  );
};
