import { Student, PlacementDrive, EligibilityEvaluation, EligibilityViolation } from '../types/placement';

export function evaluateStudentEligibility(
  student: Student,
  drive: PlacementDrive,
  existingOverrides: Record<string, 'APPROVED' | 'REJECTED' | 'REQUESTED'> = {}
): EligibilityEvaluation {
  const violations: EligibilityViolation[] = [];
  const overrideKey = `${student.id}_${drive.id}`;
  const currentOverride = existingOverrides[overrideKey] || 'NONE';

  // 1. Check CGPA
  if (student.cgpa < drive.minCgpa) {
    const diff = Number((drive.minCgpa - student.cgpa).toFixed(2));
    violations.push({
      rule: 'CGPA',
      criterion: `Minimum CGPA of ${drive.minCgpa.toFixed(2)} required`,
      studentValue: student.cgpa.toFixed(2),
      requiredValue: drive.minCgpa.toFixed(2),
      message: `CGPA is ${student.cgpa.toFixed(2)}, falling short by ${diff} points.`,
      canRequestOverride: diff <= 0.15 // Can request waiver if within 0.15
    });
  }

  // 2. Check Active Backlogs
  if (student.activeBacklogs > drive.maxActiveBacklogs) {
    violations.push({
      rule: 'ACTIVE_BACKLOGS',
      criterion: `Maximum allowed active backlogs is ${drive.maxActiveBacklogs}`,
      studentValue: student.activeBacklogs,
      requiredValue: drive.maxActiveBacklogs,
      message: `Student currently has ${student.activeBacklogs} active backlogs.`,
      canRequestOverride: student.activeBacklogs === 1
    });
  }

  // 3. Check Branch
  if (!drive.allowedBranches.includes(student.branch)) {
    violations.push({
      rule: 'BRANCH',
      criterion: `Eligible branches: ${drive.allowedBranches.join(', ')}`,
      studentValue: student.branch,
      requiredValue: drive.allowedBranches.join(', '),
      message: `Branch '${student.branch}' is not in the eligible branches list for this drive.`,
      canRequestOverride: false
    });
  }

  // 4. Check Placement Status
  if (student.placementStatus === 'Blacklisted' || student.placementStatus === 'Opted-Out') {
    violations.push({
      rule: 'STATUS',
      criterion: 'Active candidate in good standing',
      studentValue: student.placementStatus,
      requiredValue: 'Eligible / In-Process',
      message: `Candidate status is marked as '${student.placementStatus}'.`,
      canRequestOverride: false
    });
  }

  // Check if override approved
  if (currentOverride === 'APPROVED') {
    return {
      studentId: student.id,
      driveId: drive.id,
      isEligible: true,
      status: 'Conditional_Exception',
      violations,
      manualOverrideStatus: 'APPROVED',
      overrideReason: 'Special waiver approved by Placement Director based on outstanding project & skill portfolio.'
    };
  }

  if (violations.length === 0) {
    return {
      studentId: student.id,
      driveId: drive.id,
      isEligible: true,
      status: 'Eligible',
      violations: [],
      manualOverrideStatus: 'NONE'
    };
  }

  const hasConditionalException = violations.some(v => v.canRequestOverride) && violations.every(v => v.canRequestOverride);

  return {
    studentId: student.id,
    driveId: drive.id,
    isEligible: false,
    status: hasConditionalException ? 'Conditional_Exception' : 'Ineligible',
    violations,
    manualOverrideStatus: currentOverride
  };
}

export function evaluateBatchEligibility(
  students: Student[],
  drive: PlacementDrive,
  overrides: Record<string, 'APPROVED' | 'REJECTED' | 'REQUESTED'> = {}
): Record<string, EligibilityEvaluation> {
  const map: Record<string, EligibilityEvaluation> = {};
  students.forEach(student => {
    map[student.id] = evaluateStudentEligibility(student, drive, overrides);
  });
  return map;
}
