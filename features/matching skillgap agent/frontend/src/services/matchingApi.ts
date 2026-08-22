import { Student, PlacementDrive, CandidateMatchAnalysis } from '../types/placement';

interface ApiMatchResult {
  studentId: string;
  matchScore: number;
  breakdown: { coreSkills: number; projectRelevance: number; preferredSkills: number; academics: number; experience: number };
  matchedSkills: string[];
  partialSkills: string[];
  skillGaps: string[];
  explanation: string;
}

function toApiStudent(student: Student) {
  return {
    studentId: student.id,
    name: student.name,
    branch: student.branch,
    cgpa: student.cgpa,
    backlogs: student.activeBacklogs,
    skills: student.skills.map((skill) => skill.name),
    projects: student.projectsCount > 0 ? [{ name: student.topProject || 'Academic project', description: student.resumeHeadline, technologies: student.skills.map((skill) => skill.name) }] : [],
    certifications: student.certifications,
    experience: [],
  };
}

function toApiJob(drive: PlacementDrive) {
  return {
    jobId: drive.id,
    companyId: drive.companyName,
    role: drive.role,
    minCGPA: drive.minCgpa,
    branches: drive.allowedBranches,
    skills: drive.mandatorySkills,
    preferredSkills: drive.preferredSkills,
  };
}

function toAnalysis(result: ApiMatchResult, drive: PlacementDrive): CandidateMatchAnalysis {
  return {
    studentId: result.studentId,
    driveId: drive.id,
    matchScore: result.matchScore,
    academicScore: result.breakdown.academics,
    coreSkillScore: result.breakdown.coreSkills,
    secondarySkillScore: result.breakdown.preferredSkills,
    projectScore: result.breakdown.projectRelevance,
    matchingSkills: result.matchedSkills,
    missingSkills: [...result.partialSkills, ...result.skillGaps],
    aiExplanation: result.explanation,
    keyStrengths: result.matchedSkills.slice(0, 3).map((skill) => `Evidence-backed match for ${skill}`),
    skillGapRemediation: result.skillGaps.map((skill) => `Build practical readiness in ${skill}.`),
  };
}

export async function rankCandidatesFromApi(students: Student[], drive: PlacementDrive): Promise<{ student: Student; analysis: CandidateMatchAnalysis }[]> {
  const response = await fetch('/api/matching/run', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ students: students.map(toApiStudent), job: toApiJob(drive) }) });
  if (!response.ok) throw new Error('Matching API unavailable');
  const payload = await response.json() as { candidates: ApiMatchResult[] };
  const byId = new Map(students.map((student) => [student.id, student]));
  return payload.candidates.flatMap((result) => { const student = byId.get(result.studentId); return student ? [{ student, analysis: toAnalysis(result, drive) }] : []; });
}
