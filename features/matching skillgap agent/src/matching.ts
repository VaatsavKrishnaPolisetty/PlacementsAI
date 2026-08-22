export type EvidenceSource = 'skill' | 'project' | 'certification' | 'experience' | 'education';
export type SkillStatus = 'matched' | 'partial' | 'missing';
export type Recommendation = 'SHORTLIST' | 'REVIEW' | 'DO_NOT_RECOMMEND';

export interface Project {
  name: string;
  description?: string;
  technologies?: string[];
}

export interface Experience {
  title?: string;
  company?: string;
  description?: string;
  technologies?: string[];
}

export interface Student {
  studentId: string;
  name: string;
  branch?: string;
  cgpa?: number;
  backlogs?: number;
  skills?: string[];
  projects?: Project[];
  certifications?: string[];
  experience?: Experience[];
  courses?: string[];
  communicationScore?: number;
  mockInterviewScore?: number;
}

export interface Job {
  jobId: string;
  companyId?: string;
  role: string;
  minCGPA?: number;
  branches?: string[];
  skills?: string[];
  preferredSkills?: string[];
  experience?: string;
}

export interface MatchWeights {
  coreSkills: number;
  projectRelevance: number;
  preferredSkills: number;
  academics: number;
  experience: number;
}

export const DEFAULT_MATCH_WEIGHTS: MatchWeights = {
  coreSkills: 50,
  projectRelevance: 20,
  preferredSkills: 10,
  academics: 10,
  experience: 10,
};

export interface SkillAssessment {
  skill: string;
  status: SkillStatus;
  evidence: Evidence[];
}

export interface Evidence {
  skill: string;
  source: EvidenceSource;
  title: string;
  description: string;
}

export interface MatchResult {
  matchId: string;
  studentId: string;
  jobId: string;
  matchScore: number;
  breakdown: Record<keyof MatchWeights, number>;
  matchedSkills: string[];
  partialSkills: string[];
  skillGaps: string[];
  assessments: SkillAssessment[];
  evidence: Evidence[];
  explanation: string;
  recommendation: Recommendation;
}

export interface ReadinessResult {
  studentId: string;
  jobId: string;
  readinessScore: number;
  strengths: string[];
  risks: string[];
  dataAvailability: {
    communication: boolean;
    mockInterview: boolean;
  };
}

export interface ReadinessPlanItem {
  day: number;
  topic: string;
  tasks: string[];
}

export interface RematchResult {
  jobId: string;
  removedStudentId: string;
  newRecommendedCandidate?: string;
  previousRank?: number;
  newRank?: number;
  rankedCandidates: MatchResult[];
}

const SKILL_ALIASES: Record<string, string> = {
  js: 'javascript',
  'java script': 'javascript',
  'react.js': 'react',
  reactjs: 'react',
  nodejs: 'node.js',
  'node js': 'node.js',
  postgres: 'postgresql',
  postgresql: 'postgresql',
  'amazon web services': 'aws',
};

const RELATED_SKILLS: Record<string, string[]> = {
  javascript: ['typescript'],
  typescript: ['javascript'],
};

function canonicalSkill(skill: string): string {
  const cleaned = skill.trim().toLowerCase().replace(/\s+/g, ' ');
  return SKILL_ALIASES[cleaned] ?? cleaned;
}

function displaySkill(skill: string): string {
  return skill.trim();
}

function uniqueSkills(skills: string[] | undefined): string[] {
  return [...new Map((skills ?? []).filter(Boolean).map((skill) => [canonicalSkill(skill), displaySkill(skill)])).values()];
}

function allEvidence(student: Student): Evidence[] {
  const evidence: Evidence[] = [];
  for (const skill of uniqueSkills(student.skills)) {
    evidence.push({ skill, source: 'skill', title: 'Resume skills', description: `${skill} listed in the resume skill section` });
  }
  for (const project of student.projects ?? []) {
    for (const skill of uniqueSkills(project.technologies)) {
      evidence.push({ skill, source: 'project', title: project.name, description: `${skill} used in the ${project.name} project` });
    }
  }
  for (const certification of student.certifications ?? []) {
    for (const skill of uniqueSkills([certification])) {
      evidence.push({ skill, source: 'certification', title: certification, description: `${skill} covered by the ${certification} certification` });
    }
  }
  for (const item of student.experience ?? []) {
    for (const skill of uniqueSkills(item.technologies)) {
      evidence.push({ skill, source: 'experience', title: item.title || item.company || 'Experience', description: `${skill} used in professional experience` });
    }
  }
  return evidence;
}

function validate(student: Student, job: Job): void {
  if (!student?.studentId) throw new Error('studentId is required');
  if (!job?.jobId) throw new Error('jobId is required');
  if (!job.role) throw new Error('job role is required');
  if (student.cgpa !== undefined && (student.cgpa < 0 || student.cgpa > 10)) throw new Error('cgpa must be between 0 and 10');
  if ((student.backlogs ?? 0) < 0) throw new Error('backlogs cannot be negative');
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function normalizedWeights(weights: MatchWeights): MatchWeights {
  const total = Object.values(weights).reduce((sum, value) => sum + value, 0);
  if (total <= 0 || Object.values(weights).some((value) => value < 0)) throw new Error('matching weights must be non-negative and non-zero');
  return {
    coreSkills: (weights.coreSkills / total) * 100,
    projectRelevance: (weights.projectRelevance / total) * 100,
    preferredSkills: (weights.preferredSkills / total) * 100,
    academics: (weights.academics / total) * 100,
    experience: (weights.experience / total) * 100,
  };
}

function skillAssessment(student: Student, requestedSkill: string, evidence: Evidence[]): SkillAssessment {
  const requested = canonicalSkill(requestedSkill);
  const relevant = evidence.filter((item) => canonicalSkill(item.skill) === requested);
  if (relevant.length > 0) return { skill: displaySkill(requestedSkill), status: 'matched', evidence: relevant };
  const tokens = new Set(requested.split(/[^a-z0-9]+/).filter((token) => token.length > 2));
  const partial = evidence.filter((item) => RELATED_SKILLS[requested]?.includes(canonicalSkill(item.skill)) || [...tokens].some((token) => canonicalSkill(item.skill).includes(token)));
  return { skill: displaySkill(requestedSkill), status: partial.length > 0 ? 'partial' : 'missing', evidence: partial };
}

function academicScore(student: Student, job: Job): number {
  if (student.cgpa === undefined) return 50;
  if (job.minCGPA !== undefined && student.cgpa < job.minCGPA) return 0;
  return clamp(student.cgpa * 10);
}

function experienceScore(student: Student): number {
  const certifications = student.certifications?.length ?? 0;
  const experience = student.experience?.length ?? 0;
  return clamp((Math.min(certifications, 2) / 2) * 40 + (Math.min(experience, 2) / 2) * 60);
}

export function matchCandidate(student: Student, job: Job, weights: MatchWeights = DEFAULT_MATCH_WEIGHTS): MatchResult {
  validate(student, job);
  const effectiveWeights = normalizedWeights(weights);
  const evidence = allEvidence(student);
  const required = uniqueSkills(job.skills);
  const preferred = uniqueSkills(job.preferredSkills);
  const assessments = required.map((skill) => skillAssessment(student, skill, evidence));
  const preferredAssessments = preferred.map((skill) => skillAssessment(student, skill, evidence));
  const matched = assessments.filter((item) => item.status === 'matched');
  const partial = assessments.filter((item) => item.status === 'partial');
  const gaps = assessments.filter((item) => item.status === 'missing');
  const coreScore = required.length === 0 ? 100 : ((matched.length + partial.length * 0.5) / required.length) * 100;
  const projectEvidence = evidence.filter((item) => item.source === 'project' && required.some((skill) => canonicalSkill(skill) === canonicalSkill(item.skill)));
  const projectScore = required.length === 0 ? 100 : clamp((projectEvidence.length / required.length) * 100);
  const preferredScore = preferred.length === 0 ? 100 : (preferredAssessments.filter((item) => item.status === 'matched').length / preferred.length) * 100;
  const breakdown = {
    coreSkills: clamp(coreScore),
    projectRelevance: projectScore,
    preferredSkills: clamp(preferredScore),
    academics: academicScore(student, job),
    experience: experienceScore(student),
  };
  const matchScore = clamp(Object.entries(breakdown).reduce((sum, [key, score]) => sum + score * effectiveWeights[key as keyof MatchWeights] / 100, 0));
  const recommendation: Recommendation = matchScore >= 70 && gaps.length === 0 ? 'SHORTLIST' : matchScore >= 55 ? 'REVIEW' : 'DO_NOT_RECOMMEND';
  const gapText = gaps.length ? ` Main gaps: ${gaps.map((item) => item.skill).join(', ')}.` : ' No required skill gaps identified.';
  return {
    matchId: `MATCH-${student.studentId}-${job.jobId}`,
    studentId: student.studentId,
    jobId: job.jobId,
    matchScore,
    breakdown,
    matchedSkills: matched.map((item) => item.skill),
    partialSkills: partial.map((item) => item.skill),
    skillGaps: gaps.map((item) => item.skill),
    assessments,
    evidence: evidence.filter((item) => required.some((skill) => canonicalSkill(skill) === canonicalSkill(item.skill))),
    explanation: `${student.name} matches ${matched.length}/${required.length} required skills with ${projectEvidence.length ? 'project evidence' : 'limited project evidence'}.${gapText}`,
    recommendation,
  };
}

export function rankCandidates(students: Student[], job: Job, weights?: MatchWeights): MatchResult[] {
  return students.map((student) => matchCandidate(student, job, weights)).sort((a, b) => b.matchScore - a.matchScore || a.studentId.localeCompare(b.studentId));
}

export function calculateReadiness(student: Student, job: Job, match = matchCandidate(student, job)): ReadinessResult {
  const hasCommunication = student.communicationScore !== undefined;
  const hasMock = student.mockInterviewScore !== undefined;
  const communication = student.communicationScore ?? 50;
  const mock = student.mockInterviewScore ?? 50;
  const projectStrength = Math.min(100, (student.projects?.length ?? 0) * 50);
  const academic = academicScore(student, job);
  const certification = Math.min(100, (student.certifications?.length ?? 0) * 50);
  const score = clamp(match.breakdown.coreSkills * 0.4 + projectStrength * 0.2 + academic * 0.15 + ((communication + mock) / 2) * 0.15 + certification * 0.1);
  return {
    studentId: student.studentId,
    jobId: job.jobId,
    readinessScore: score,
    strengths: [match.matchedSkills.length ? `Strong ${match.matchedSkills.slice(0, 2).join(' and ')} skills` : 'Candidate profile recorded', ...(student.projects?.length ? ['Relevant project experience'] : [])],
    risks: match.skillGaps.map((skill) => `${skill} skill gap`),
    dataAvailability: { communication: hasCommunication, mockInterview: hasMock },
  };
}

const GAP_PLANS: Record<string, { topic: string; tasks: string[] }> = {
  aws: { topic: 'AWS fundamentals', tasks: ['Learn EC2 basics', 'Learn S3 and IAM basics'] },
  docker: { topic: 'Docker fundamentals', tasks: ['Learn images and containers', 'Build a Dockerfile and run Compose'] },
  javascript: { topic: 'JavaScript foundations', tasks: ['Review modern syntax', 'Build a small async API client'] },
  'node.js': { topic: 'Node.js fundamentals', tasks: ['Build an HTTP API', 'Practice modules and error handling'] },
};

export function createReadinessPlan(studentId: string, jobId: string, gaps: string[], days = 3): { studentId: string; jobId: string; plan: ReadinessPlanItem[] } {
  if (days < 1) throw new Error('days must be at least 1');
  const topics = uniqueSkills(gaps).slice(0, days).map((gap) => GAP_PLANS[canonicalSkill(gap)] ?? { topic: `${gap} fundamentals`, tasks: [`Study ${gap} core concepts`, `Complete a small ${gap} practice task`] });
  return { studentId, jobId, plan: topics.map((item, index) => ({ day: index + 1, ...item })) };
}

export function rematchCandidates(students: Student[], job: Job, unavailableStudentId: string, weights?: MatchWeights): RematchResult {
  const before = rankCandidates(students, job, weights);
  const previousRank = before.findIndex((item) => item.studentId === unavailableStudentId) + 1 || undefined;
  const rankedCandidates = rankCandidates(students.filter((student) => student.studentId !== unavailableStudentId), job, weights);
  const top = rankedCandidates[0];
  return { jobId: job.jobId, removedStudentId: unavailableStudentId, newRecommendedCandidate: top?.studentId, previousRank, newRank: top ? 1 : undefined, rankedCandidates };
}
