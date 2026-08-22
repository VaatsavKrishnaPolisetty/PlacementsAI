import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateReadiness, createReadinessPlan, matchCandidate, rankCandidates, rematchCandidates, type Job, type Student } from '../src/matching.js';

const student: Student = {
  studentId: 'STU001', name: 'Student 001', branch: 'CSE', cgpa: 8.6, backlogs: 0,
  skills: ['Python', 'Java', 'SQL', 'React.js'],
  projects: [{ name: 'Smart Campus AI', description: 'AI campus project', technologies: ['Python', 'React'] }],
  certifications: ['Python Programming'], experience: [],
};
const job: Job = { jobId: 'JOB001', role: 'Software Engineer', minCGPA: 7.5, branches: ['CSE'], skills: ['Python', 'Java', 'SQL', 'React'], preferredSkills: ['AWS', 'Docker'] };

test('matches normalized core skills and preserves evidence', () => {
  const result = matchCandidate(student, job);
  assert.deepEqual(result.matchedSkills, ['Python', 'Java', 'SQL', 'React']);
  assert.deepEqual(result.skillGaps, []);
  assert.ok(result.evidence.some((item) => item.source === 'project' && item.skill === 'Python'));
  assert.equal(result.recommendation, 'SHORTLIST');
});

test('reports partial and missing skills', () => {
  const result = matchCandidate({ ...student, skills: ['TypeScript'] }, { ...job, skills: ['JavaScript', 'AWS'] });
  assert.deepEqual(result.partialSkills, ['JavaScript']);
  assert.deepEqual(result.skillGaps, ['AWS']);
});

test('ranks candidates deterministically and rematches unavailable candidates', () => {
  const second = { ...student, studentId: 'STU002', name: 'Student 002', skills: ['Python'] };
  const ranked = rankCandidates([second, student], job);
  assert.equal(ranked[0].studentId, 'STU001');
  const rematch = rematchCandidates([student, second], job, 'STU001');
  assert.equal(rematch.newRecommendedCandidate, 'STU002');
  assert.equal(rematch.previousRank, 1);
});

test('handles absent interview data without inventing availability', () => {
  const result = calculateReadiness(student, job);
  assert.deepEqual(result.dataAvailability, { communication: false, mockInterview: false });
  assert.ok(result.readinessScore >= 0 && result.readinessScore <= 100);
});

test('creates a short actionable gap plan', () => {
  const result = createReadinessPlan('STU001', 'JOB001', ['AWS', 'Docker']);
  assert.equal(result.plan.length, 2);
  assert.deepEqual(result.plan[0].tasks, ['Learn EC2 basics', 'Learn S3 and IAM basics']);
});
