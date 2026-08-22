export type Branch = 'CSE' | 'AI & DS' | 'ECE' | 'IT' | 'EEE' | 'MECH';

export type PlacementStatus = 'Eligible' | 'Placed' | 'In-Process' | 'Opted-Out' | 'Blacklisted';

export interface StudentSkill {
  name: string;
  level: number; // 1 to 100
  verified: boolean;
}

export interface Student {
  id: string;
  usn: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  branch: Branch;
  semester: number;
  cgpa: number;
  activeBacklogs: number;
  historyOfBacklogs: number;
  skills: StudentSkill[];
  resumeHeadline: string;
  projectsCount: number;
  topProject: string;
  certifications: string[];
  placementStatus: PlacementStatus;
  offersReceived: number;
  preferredRoles: string[];
  readinessScore: number; // 0 to 100
  github?: string;
  linkedin?: string;
  attendancePercentage: number;
}

export interface InterviewRoundConfig {
  roundNumber: number;
  name: string;
  type: 'Coding' | 'Technical' | 'HR' | 'System Design' | 'GD';
  durationMinutes: number;
  mode: 'Physical' | 'Virtual';
}

export interface PlacementDrive {
  id: string;
  companyName: string;
  logo: string;
  role: string;
  jobType: 'Full-Time' | 'Internship + PPO' | 'Summer Internship';
  ctc: string; // e.g. "24.5 LPA"
  stipend?: string; // e.g. "80k / month"
  location: string;
  driveDate: string;
  deadlineDate: string;
  minCgpa: number;
  maxActiveBacklogs: number;
  allowedBranches: Branch[];
  mandatorySkills: string[];
  preferredSkills: string[];
  description: string;
  rounds: InterviewRoundConfig[];
  status: 'Active' | 'Upcoming' | 'Completed' | 'Draft';
  registeredCandidateIds: string[];
  shortlistedCandidateIds: string[];
  selectedCandidateIds: string[];
  tags: string[];
}

export interface EligibilityViolation {
  rule: 'CGPA' | 'ACTIVE_BACKLOGS' | 'HISTORY_BACKLOGS' | 'BRANCH' | 'STATUS';
  criterion: string;
  studentValue: string | number;
  requiredValue: string | number;
  message: string;
  canRequestOverride: boolean;
}

export interface EligibilityEvaluation {
  studentId: string;
  driveId: string;
  isEligible: boolean;
  status: 'Eligible' | 'Ineligible' | 'Conditional_Exception';
  violations: EligibilityViolation[];
  manualOverrideStatus?: 'NONE' | 'REQUESTED' | 'APPROVED' | 'REJECTED';
  overrideReason?: string;
  overrideApprovedBy?: string;
}

export interface CandidateMatchAnalysis {
  studentId: string;
  driveId: string;
  matchScore: number; // 0 - 100
  academicScore: number;
  coreSkillScore: number;
  secondarySkillScore: number;
  projectScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  aiExplanation: string;
  keyStrengths: string[];
  skillGapRemediation: string[];
}

export interface Room3D {
  id: string;
  roomNumber: string;
  building: string;
  floor: string;
  name: string;
  type: 'Technical Interview' | 'Coding Lab' | 'HR Suite' | 'Boardroom' | 'GD Hall' | 'Waiting Lounge';
  capacity: number;
  status: 'Available' | 'In-Session' | 'Reserved' | 'Maintenance';
  activeInterviewId?: string;
  currentPanelName?: string;
  currentCandidateName?: string;
  currentCandidateAvatar?: string;
  currentRound?: string;
  coordinates: { x: number; y: number; z: number };
  color: string;
  equipment: string[];
}

export interface PanelMember {
  id: string;
  name: string;
  company: string;
  designation: string;
  avatar: string;
  email: string;
  domains: string[];
  experienceYears: number;
  maxDailySlots: number;
  assignedSlotsCount: number;
  currentStatus: 'Available' | 'Busy' | 'On-Break' | 'Offline';
}

export interface ScheduledInterview {
  id: string;
  driveId: string;
  companyName: string;
  roundNumber: number;
  roundName: string;
  candidateId: string;
  candidateName: string;
  candidateUSN: string;
  candidateAvatar: string;
  candidateBranch: string;
  panelId: string;
  panelName: string;
  panelDesignation: string;
  roomId: string;
  roomNumber: string;
  date: string;
  startTime: string;
  endTime: string;
  mode: 'Physical' | 'Virtual';
  meetLink?: string;
  status: 'Scheduled' | 'In-Progress' | 'Completed' | 'No-Show' | 'Passed' | 'Rejected';
  score?: number;
  feedback?: string;
}

export interface AgentActionItem {
  id: string;
  timestamp: string;
  category: 'ELIGIBILITY' | 'SCHEDULING' | 'ROOM_ALLOCATION' | 'COMMUNICATION' | 'ANOMALY';
  title: string;
  summary: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  requiresHumanApproval: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'AUTO_EXECUTED';
  metadata: Record<string, any>;
  aiConfidence: number; // e.g. 0.94
  aiRationale: string;
}

export interface NotificationLog {
  id: string;
  recipientName: string;
  recipientUSN: string;
  recipientContact: string;
  channel: 'WhatsApp' | 'Email' | 'SMS';
  subject: string;
  messageContent: string;
  status: 'Sent' | 'Delivered' | 'Read' | 'Failed';
  timestamp: string;
  driveName: string;
  roundName: string;
}

export interface PlacementStats {
  totalStudents: number;
  totalPlaced: number;
  activeDrives: number;
  scheduledInterviewsToday: number;
  roomsOccupied: number;
  totalRooms: number;
  pendingApprovals: number;
  avgPackageLPA: number;
  highestPackageLPA: number;
  skillGapsIdentified: number;
  notificationsDispatched: number;
}
