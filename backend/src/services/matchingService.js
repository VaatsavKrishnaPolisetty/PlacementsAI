/**
 * Candidate Matching, Explainability & Skill-Gap Readiness Service
 * Reconciled and adapted from Member 3's Multi-Pillar TypeScript Matching Logic.
 */

const DEFAULT_MATCH_WEIGHTS = {
  coreSkills: 50,
  projectRelevance: 20,
  preferredSkills: 10,
  academics: 10,
  experience: 10,
};

const SKILL_ALIASES = {
  js: 'javascript',
  'java script': 'javascript',
  'react.js': 'react',
  reactjs: 'react',
  nodejs: 'node.js',
  'node js': 'node.js',
  postgres: 'postgresql',
  postgresql: 'postgresql',
  'amazon web services': 'aws',
  ml: 'machine learning',
  ai: 'artificial intelligence',
  aiml: 'artificial intelligence and machine learning',
  py: 'python',
  ts: 'typescript',
};

const RELATED_SKILLS = {
  javascript: ['typescript', 'react', 'node.js'],
  typescript: ['javascript', 'react', 'node.js'],
  python: ['django', 'fastapi', 'flask', 'machine learning'],
  react: ['javascript', 'typescript', 'next.js', 'redux', 'frontend'],
  'node.js': ['express', 'javascript', 'backend', 'mongodb', 'sql'],
};

function canonicalSkill(skill) {
  if (!skill) return '';
  const cleaned = String(skill).trim().toLowerCase().replace(/\s+/g, ' ');
  return SKILL_ALIASES[cleaned] || cleaned;
}

function displaySkill(skill) {
  return String(skill || '').trim();
}

function uniqueSkills(skills) {
  if (!Array.isArray(skills)) return [];
  const map = new Map();
  skills.filter(Boolean).forEach((skill) => {
    map.set(canonicalSkill(skill), displaySkill(skill));
  });
  return Array.from(map.values());
}

function extractAllEvidence(student, resume) {
  const evidence = [];
  const skills = student.skills || resume?.structuredExtraction?.skills || [];
  
  uniqueSkills(skills).forEach((skill) => {
    evidence.push({
      skill,
      source: 'skill',
      title: 'Resume Skills',
      description: `${skill} listed in candidate verified skill section`,
    });
  });

  const projects = student.projects || resume?.structuredExtraction?.projects || [];
  projects.forEach((proj) => {
    const tech = proj.technologies || proj.techStack || [];
    uniqueSkills(tech).forEach((skill) => {
      evidence.push({
        skill,
        source: 'project',
        title: proj.name || proj.title || 'Project',
        description: `${skill} applied in project: ${proj.name || 'Software Project'} (${proj.description || 'Production implementation'})`,
      });
    });
  });

  const certifications = student.certifications || resume?.structuredExtraction?.certifications || [];
  certifications.forEach((cert) => {
    const certName = typeof cert === 'string' ? cert : (cert.name || cert.title || '');
    evidence.push({
      skill: certName,
      source: 'certification',
      title: certName,
      description: `Certified competency: ${certName}`,
    });
  });

  const experience = student.experience || resume?.structuredExtraction?.experience || [];
  experience.forEach((exp) => {
    const tech = exp.technologies || [];
    uniqueSkills(tech).forEach((skill) => {
      evidence.push({
        skill,
        source: 'experience',
        title: exp.title || exp.company || 'Experience',
        description: `${skill} utilized in role at ${exp.company || 'Organization'}`,
      });
    });
  });

  return evidence;
}

function assessSkill(student, requestedSkill, evidence) {
  const requested = canonicalSkill(requestedSkill);
  const relevant = evidence.filter((item) => canonicalSkill(item.skill) === requested);
  
  if (relevant.length > 0) {
    return { skill: displaySkill(requestedSkill), status: 'matched', evidence: relevant };
  }

  const related = RELATED_SKILLS[requested] || [];
  const partial = evidence.filter((item) => {
    const itemCanonical = canonicalSkill(item.skill);
    return related.includes(itemCanonical) || itemCanonical.includes(requested) || requested.includes(itemCanonical);
  });

  return {
    skill: displaySkill(requestedSkill),
    status: partial.length > 0 ? 'partial' : 'missing',
    evidence: partial,
  };
}

function clamp(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function normalizedWeights(weights = DEFAULT_MATCH_WEIGHTS) {
  const w = { ...DEFAULT_MATCH_WEIGHTS, ...weights };
  const total = Object.values(w).reduce((sum, val) => sum + val, 0);
  if (total <= 0) return DEFAULT_MATCH_WEIGHTS;
  return {
    coreSkills: (w.coreSkills / total) * 100,
    projectRelevance: (w.projectRelevance / total) * 100,
    preferredSkills: (w.preferredSkills / total) * 100,
    academics: (w.academics / total) * 100,
    experience: (w.experience / total) * 100,
  };
}

function computeAcademicScore(student, job) {
  const cgpa = student.cgpa !== undefined ? student.cgpa : 7.0;
  const minCGPA = job.requirements?.minCGPA || job.minCGPA || 0;
  if (cgpa < minCGPA) return 0;
  return clamp(cgpa * 10);
}

function computeExperienceScore(student, resume) {
  const certs = (student.certifications || resume?.structuredExtraction?.certifications || []).length;
  const exp = (student.experience || resume?.structuredExtraction?.experience || []).length;
  return clamp((Math.min(certs, 2) / 2) * 40 + (Math.min(exp, 2) / 2) * 60);
}

/**
 * 5-Pillar Explainable Candidate Match Evaluator
 */
function evaluateCandidateMatch(student, job, resume = null, weights = DEFAULT_MATCH_WEIGHTS) {
  const effectiveWeights = normalizedWeights(weights);
  const evidence = extractAllEvidence(student, resume);

  const required = uniqueSkills(job.requirements?.requiredSkills || job.skills || []);
  const preferred = uniqueSkills(job.requirements?.preferredSkills || job.preferredSkills || []);

  const assessments = required.map((skill) => assessSkill(student, skill, evidence));
  const preferredAssessments = preferred.map((skill) => assessSkill(student, skill, evidence));

  const matched = assessments.filter((item) => item.status === 'matched');
  const partial = assessments.filter((item) => item.status === 'partial');
  const gaps = assessments.filter((item) => item.status === 'missing');

  const coreScore = required.length === 0 ? 100 : ((matched.length + partial.length * 0.5) / required.length) * 100;
  
  const projectEvidence = evidence.filter(
    (item) => item.source === 'project' && required.some((req) => canonicalSkill(req) === canonicalSkill(item.skill))
  );
  const projectScore = required.length === 0 ? 100 : clamp((projectEvidence.length / required.length) * 100);
  const preferredScore = preferred.length === 0 ? 100 : (preferredAssessments.filter((item) => item.status === 'matched').length / preferred.length) * 100;

  const breakdown = {
    coreSkills: clamp(coreScore),
    projectRelevance: projectScore,
    preferredSkills: clamp(preferredScore),
    academics: computeAcademicScore(student, job),
    experience: computeExperienceScore(student, resume),
  };

  const matchScore = clamp(
    (breakdown.coreSkills * effectiveWeights.coreSkills) / 100 +
    (breakdown.projectRelevance * effectiveWeights.projectRelevance) / 100 +
    (breakdown.preferredSkills * effectiveWeights.preferredSkills) / 100 +
    (breakdown.academics * effectiveWeights.academics) / 100 +
    (breakdown.experience * effectiveWeights.experience) / 100
  );

  const recommendation =
    matchScore >= 70 && gaps.length === 0
      ? 'SHORTLIST'
      : matchScore >= 60
      ? 'REVIEW'
      : 'DO_NOT_RECOMMEND';

  const gapSummary = gaps.length ? ` Key identified skill gaps: ${gaps.map((g) => g.skill).join(', ')}.` : ' Zero required skill gaps identified.';
  const explanation = `${student.name || 'Candidate'} matches ${matched.length}/${required.length} core technical requirements with ${
    projectEvidence.length ? `${projectEvidence.length} verified project artifacts` : 'foundational profile evidence'
  }.${gapSummary}`;

  return {
    matchId: `MATCH_${student.studentId}_${job.jobId}`,
    studentId: student.studentId,
    jobId: job.jobId,
    matchScore,
    breakdown,
    matchedSkills: matched.map((item) => item.skill),
    partialSkills: partial.map((item) => item.skill),
    skillGaps: gaps.map((item) => item.skill),
    assessments,
    evidence: evidence.filter((item) => required.some((req) => canonicalSkill(req) === canonicalSkill(item.skill))),
    explanation,
    recommendation,
    readinessScore: clamp(breakdown.coreSkills * 0.4 + breakdown.projectRelevance * 0.2 + breakdown.academics * 0.2 + breakdown.experience * 0.2),
  };
}

const GAP_PLANS = {
  aws: { topic: 'AWS Cloud Architecture', tasks: ['Deploy EC2 with VPC & Security Groups', 'Configure S3 Bucket with IAM policies', 'Review CloudWatch monitoring basics'] },
  docker: { topic: 'Docker Containerization', tasks: ['Create multi-stage Dockerfile for Node/Python', 'Set up Docker Compose with Redis & Postgres', 'Practice container debugging & volume mounts'] },
  javascript: { topic: 'Modern JavaScript & Async Patterns', tasks: ['Review Event Loop, Microtasks & Promises', 'Implement Custom Async Queue / Debounce', 'Practice Deep Clone & Immutable updates'] },
  'node.js': { topic: 'Node.js Enterprise Architecture', tasks: ['Build Express API with Middleware & Rate Limiting', 'Implement Structured Error Handling & Logging', 'Cluster mode & Stream processing practice'] },
  react: { topic: 'Advanced React 19 & State', tasks: ['Master useTransition, useActionState & Suspense', 'Build custom hooks for cached data fetching', 'Profile rendering bottlenecks using DevTools'] },
  python: { topic: 'Python Backend & Concurrency', tasks: ['AsyncIO patterns & coroutines', 'FastAPI Pydantic data validation', 'Optimize database connection pools & ORM queries'] },
  sql: { topic: 'Database Indexing & Query Optimization', tasks: ['Write complex JOINs & Window functions', 'Analyze EXPLAIN QUERY plans and B-Tree indexes', 'Transaction isolation levels & ACID guarantees'] },
};

function createPersonalizedReadinessPlan(studentId, jobId, gaps = [], days = 3) {
  const uniqueGaps = uniqueSkills(gaps);
  const items = [];

  for (let i = 0; i < Math.min(days, Math.max(1, uniqueGaps.length)); i++) {
    const gap = uniqueGaps[i] || 'System Design & Problem Solving';
    const canonical = canonicalSkill(gap);
    const template = GAP_PLANS[canonical] || {
      topic: `${gap} Mastery & Applied Interview Preparation`,
      tasks: [
        `Master fundamental architecture and best practices in ${gap}`,
        `Complete a hands-on mock technical coding task in ${gap}`,
        `Review 10 top enterprise interview questions for ${gap}`,
      ],
    };

    items.push({
      day: i + 1,
      topic: template.topic,
      tasks: template.tasks,
      completed: false,
    });
  }

  return {
    studentId,
    jobId,
    totalDays: items.length,
    plan: items,
  };
}

function rematchCandidatesList(students, job, unavailableStudentId, weights = DEFAULT_MATCH_WEIGHTS) {
  const before = students.map((s) => evaluateCandidateMatch(s, job, null, weights)).sort((a, b) => b.matchScore - a.matchScore);
  const previousRank = before.findIndex((item) => item.studentId === unavailableStudentId) + 1 || undefined;

  const availableStudents = students.filter((s) => s.studentId !== unavailableStudentId);
  const rankedCandidates = availableStudents
    .map((s) => evaluateCandidateMatch(s, job, null, weights))
    .sort((a, b) => b.matchScore - a.matchScore);

  const top = rankedCandidates[0];
  return {
    jobId: job.jobId,
    removedStudentId: unavailableStudentId,
    newRecommendedCandidate: top?.studentId,
    previousRank,
    newRank: top ? 1 : undefined,
    rankedCandidates,
  };
}

module.exports = {
  DEFAULT_MATCH_WEIGHTS,
  evaluateCandidateMatch,
  createPersonalizedReadinessPlan,
  rematchCandidatesList,
  canonicalSkill,
  uniqueSkills,
  extractAllEvidence,
};
