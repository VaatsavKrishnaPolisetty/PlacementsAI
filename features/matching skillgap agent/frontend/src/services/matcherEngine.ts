import { Student, PlacementDrive, CandidateMatchAnalysis } from '../types/placement';

export function analyzeCandidateMatch(student: Student, drive: PlacementDrive): CandidateMatchAnalysis {
  // 1. Academic Fit (0-100)
  const cgpaRatio = Math.min(student.cgpa / 10, 1.0);
  const backlogPenalty = student.activeBacklogs * 15 + student.historyOfBacklogs * 5;
  const academicScore = Math.max(0, Math.round(cgpaRatio * 100 - backlogPenalty));

  // 2. Mandatory Core Skills Match (0-100)
  const studentSkillMap = new Map(student.skills.map(s => [s.name.toLowerCase(), s]));
  
  let coreSkillPoints = 0;
  const matchingSkills: string[] = [];
  const missingSkills: string[] = [];

  drive.mandatorySkills.forEach(reqSkill => {
    const studentSkill = studentSkillMap.get(reqSkill.toLowerCase());
    if (studentSkill) {
      coreSkillPoints += (studentSkill.level / 100);
      matchingSkills.push(reqSkill);
    } else {
      missingSkills.push(reqSkill);
    }
  });

  const coreSkillScore = drive.mandatorySkills.length > 0
    ? Math.round((coreSkillPoints / drive.mandatorySkills.length) * 100)
    : 80;

  // 3. Secondary / Preferred Skills Match (0-100)
  let secondarySkillPoints = 0;
  if (drive.preferredSkills.length > 0) {
    drive.preferredSkills.forEach(prefSkill => {
      const studentSkill = studentSkillMap.get(prefSkill.toLowerCase());
      if (studentSkill) {
        secondarySkillPoints += (studentSkill.level / 100);
        matchingSkills.push(prefSkill);
      }
    });
  }
  const secondarySkillScore = drive.preferredSkills.length > 0
    ? Math.round((secondarySkillPoints / drive.preferredSkills.length) * 100)
    : 75;

  // 4. Project & Certification Fit (0-100)
  let projectScore = Math.min(100, student.projectsCount * 18 + student.certifications.length * 15);

  // Overall Weighted Score
  // Academic: 20%, Core Skills: 45%, Secondary Skills: 20%, Projects: 15%
  const matchScore = Math.min(
    100,
    Math.round(academicScore * 0.20 + coreSkillScore * 0.45 + secondarySkillScore * 0.20 + projectScore * 0.15)
  );

  // Key Strengths extraction
  const keyStrengths: string[] = [];
  student.skills
    .filter(s => s.level >= 88)
    .slice(0, 3)
    .forEach(s => keyStrengths.push(`High proficiency in ${s.name} (${s.level}%)`));

  if (student.cgpa >= 9.0) {
    keyStrengths.push(`Top-tier Academic Standing (${student.cgpa.toFixed(2)} CGPA)`);
  }
  if (student.topProject) {
    keyStrengths.push(`Demonstrated Capstone: "${student.topProject}"`);
  }

  // Skill Gap Remediation Tips
  const skillGapRemediation: string[] = [];
  missingSkills.forEach(skill => {
    skillGapRemediation.push(`Brush up on fundamental & architectural concepts for ${skill}.`);
  });
  if (student.skills.some(s => !s.verified && s.level > 80)) {
    skillGapRemediation.push('Complete campus skill verification lab to earn verified badge for top skills.');
  }
  if (skillGapRemediation.length === 0) {
    skillGapRemediation.push('Candidate satisfies all core requirements. Focus on mock interview problem-solving speed.');
  }

  // AI Rationale Generator
  let aiExplanation = '';
  if (matchScore >= 88) {
    aiExplanation = `🌟 Exceptional match (${matchScore}%). ${student.name} shows stellar alignment with ${drive.companyName}'s ${drive.role} criteria, demonstrating high mastery in ${matchingSkills.slice(0, 3).join(', ')} and a solid academic record of ${student.cgpa} CGPA. Recommended for Fast-Track Round 1.`;
  } else if (matchScore >= 75) {
    aiExplanation = `✅ Strong contender (${matchScore}%). Demonstrates competent fundamentals in ${matchingSkills.slice(0, 2).join(', ')}. Has minor gaps in [${missingSkills.slice(0, 2).join(', ') || 'specialized tools'}], but project experience indicates rapid learnability.`;
  } else {
    aiExplanation = `⚠️ Moderate fit (${matchScore}%). While academic credentials are sound, candidate currently lacks verified exposure to essential criteria like ${missingSkills.slice(0, 3).join(', ')}. Recommend bridging these skills before high-stakes rounds.`;
  }

  return {
    studentId: student.id,
    driveId: drive.id,
    matchScore,
    academicScore,
    coreSkillScore,
    secondarySkillScore,
    projectScore,
    matchingSkills: Array.from(new Set(matchingSkills)),
    missingSkills,
    aiExplanation,
    keyStrengths,
    skillGapRemediation
  };
}

export function rankCandidatesForDrive(
  students: Student[],
  drive: PlacementDrive
): { student: Student; analysis: CandidateMatchAnalysis }[] {
  return students
    .map(student => ({
      student,
      analysis: analyzeCandidateMatch(student, drive)
    }))
    .sort((a, b) => b.analysis.matchScore - a.analysis.matchScore);
}
