/**
 * Master Synthetic Seed Dataset for Demo & Testing
 * Creates a comprehensive, clean, and conflict-ready demo state.
 */

const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const {
  Student,
  Company,
  Job,
  Resume,
  Application,
  EligibilityResult,
  Match,
  Panel,
  Room,
  Interview,
  Notification,
  Offer,
  AgentLog,
  ReadinessPlan,
} = require("../models");

const matchingService = require("../services/matchingService");

const STUDENTS_DATA = [
  {
    studentId: "STU101",
    name: "Rahul Verma",
    email: "rahul.verma@campus.edu",
    phone: "+91 98765 43210",
    branch: "cse",
    cgpa: 8.8,
    graduationYear: 2026,
    backlogs: 0,
    skills: ["Python", "SQL", "Data Structures", "Django", "FastAPI", "PostgreSQL", "Docker"],
    placementStatus: "available",
    projects: [
      { name: "Distributed Task Queue", technologies: ["Python", "Redis", "Docker"], description: "Scalable asynchronous job processing worker engine" },
      { name: "High-Throughput Analytics Service", technologies: ["Python", "SQL", "FastAPI"], description: "REST microservice handling 10k req/sec" },
    ],
    certifications: ["AWS Certified Developer Associate", "Python Institute PCAP"],
    experience: [{ company: "TechCorp Labs", title: "Backend Engineering Intern", technologies: ["Python", "PostgreSQL", "Docker"] }],
  },
  {
    studentId: "STU102",
    name: "Anika Rao",
    email: "anika.rao@campus.edu",
    phone: "+91 98765 43211",
    branch: "it",
    cgpa: 9.1,
    graduationYear: 2026,
    backlogs: 0,
    skills: ["React", "TypeScript", "Node.js", "GraphQL", "TailwindCSS", "Next.js", "Docker"],
    placementStatus: "available",
    projects: [
      { name: "Real-time Collaboration Workspace", technologies: ["React", "TypeScript", "Node.js"], description: "Canvas collaboration with WebSockets" },
      { name: "Cloud Design System", technologies: ["React", "TailwindCSS", "Next.js"], description: "Accessible UI component library" },
    ],
    certifications: ["Meta Frontend Professional Certificate"],
    experience: [{ company: "FrontendWorks", title: "UI Engineering Intern", technologies: ["React", "TypeScript"] }],
  },
  {
    studentId: "STU103",
    name: "Meera Iyer",
    email: "meera.iyer@campus.edu",
    phone: "+91 98765 43212",
    branch: "cse",
    cgpa: 9.4,
    graduationYear: 2026,
    backlogs: 0,
    skills: ["Python", "Machine Learning", "PyTorch", "SQL", "AWS", "FastAPI", "Data Structures"],
    placementStatus: "available",
    projects: [
      { name: "Autonomous Resume Parser", technologies: ["Python", "Machine Learning", "PyTorch"], description: "NLP extraction engine with BERT embeddings" },
      { name: "Scalable Vector Search API", technologies: ["Python", "AWS", "FastAPI"], description: "Sub-millisecond similarity search backend" },
    ],
    certifications: ["AWS Certified Solutions Architect", "DeepLearning.AI ML Specialization"],
    experience: [{ company: "AI Horizons", title: "ML Research Intern", technologies: ["Python", "PyTorch", "AWS"] }],
  },
  {
    studentId: "STU104",
    name: "Vikram Mehta",
    email: "vikram.mehta@campus.edu",
    phone: "+91 98765 43213",
    branch: "ece",
    cgpa: 7.9,
    graduationYear: 2026,
    backlogs: 0,
    skills: ["Java", "Spring Boot", "SQL", "Kubernetes", "Microservices", "Docker"],
    placementStatus: "available",
    projects: [
      { name: "E-Commerce Microservices Platform", technologies: ["Java", "Spring Boot", "SQL"], description: "Event-driven checkout and order system" },
      { name: "Kubernetes Deployment Pipeline", technologies: ["Docker", "Kubernetes"], description: "Automated CI/CD with GitOps" },
    ],
    certifications: ["Oracle Certified Professional Java SE 17"],
    experience: [{ company: "Enterprise Systems", title: "Software Intern", technologies: ["Java", "SQL"] }],
  },
  {
    studentId: "STU105",
    name: "Sana Khan",
    email: "sana.khan@campus.edu",
    phone: "+91 98765 43214",
    branch: "cse",
    cgpa: 8.5,
    graduationYear: 2026,
    backlogs: 0,
    skills: ["Python", "JavaScript", "SQL", "React", "Node.js", "MongoDB", "AWS"],
    placementStatus: "available",
    projects: [
      { name: "Campus Event Coordination Agent", technologies: ["Node.js", "React", "MongoDB"], description: "Full-stack coordination scheduling tool" },
    ],
    certifications: ["AWS Certified Cloud Practitioner"],
    experience: [],
  },
  {
    studentId: "STU106",
    name: "Karan Joshi",
    email: "karan.joshi@campus.edu",
    phone: "+91 98765 43215",
    branch: "cse",
    cgpa: 8.2,
    graduationYear: 2026,
    backlogs: 0,
    skills: ["C++", "Python", "Data Structures", "Algorithms", "System Design", "SQL"],
    placementStatus: "available",
    projects: [
      { name: "In-Memory Key-Value Store", technologies: ["C++", "Data Structures"], description: "Custom multi-threaded cache with LRU eviction" },
    ],
    certifications: [],
    experience: [],
  },
  {
    studentId: "STU107",
    name: "Aarav Sharma",
    email: "aarav.sharma@campus.edu",
    phone: "+91 98765 43216",
    branch: "cse",
    cgpa: 9.6,
    graduationYear: 2026,
    backlogs: 0,
    skills: ["Python", "C++", "Distributed Systems", "SQL", "AWS", "Kubernetes", "Data Structures"],
    placementStatus: "available",
    projects: [
      { name: "Raft Consensus Cluster", technologies: ["C++", "Distributed Systems"], description: "Distributed consensus state machine" },
      { name: "Cloud Multi-Tenant Storage", technologies: ["Python", "AWS", "SQL"], description: "S3-compatible blob storage layer" },
    ],
    certifications: ["AWS Solutions Architect Professional", "Certified Kubernetes Administrator"],
    experience: [{ company: "CloudScale Inc", title: "Systems Intern", technologies: ["Python", "C++", "AWS"] }],
  },
  {
    studentId: "STU108",
    name: "Priya Patel",
    email: "priya.patel@campus.edu",
    phone: "+91 98765 43217",
    branch: "it",
    cgpa: 8.4,
    graduationYear: 2026,
    backlogs: 0,
    skills: ["Python", "SQL", "Tableau", "Pandas", "Machine Learning", "FastAPI"],
    placementStatus: "available",
    projects: [
      { name: "Hiring Trends Analytics Dashboard", technologies: ["Python", "Pandas", "FastAPI"], description: "Predictive dashboard for student placement trends" },
    ],
    certifications: ["Google Data Analytics Professional"],
    experience: [],
  },
  {
    studentId: "STU109",
    name: "Neha Singh",
    email: "neha.singh@campus.edu",
    phone: "+91 98765 43218",
    branch: "cse",
    cgpa: 8.9,
    graduationYear: 2026,
    backlogs: 0,
    skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "Docker", "AWS"],
    placementStatus: "available",
    projects: [
      { name: "Interview Scheduler Pro", technologies: ["React", "Node.js", "TypeScript"], description: "Calendar syncing & conflict detector web app" },
    ],
    certifications: ["AWS Certified Developer"],
    experience: [],
  },
  {
    studentId: "STU110",
    name: "Arjun Kumar",
    email: "arjun.kumar@campus.edu",
    phone: "+91 98765 43219",
    branch: "me",
    cgpa: 6.8,
    graduationYear: 2026,
    backlogs: 2,
    skills: ["Python", "Basic SQL", "AutoCAD"],
    placementStatus: "available",
    projects: [],
    certifications: [],
    experience: [],
  },
];

const COMPANIES_DATA = [
  {
    companyId: "MICROSOFT",
    companyName: "Microsoft",
    industry: "Technology & Cloud Computing",
    website: "https://careers.microsoft.com",
    contactPerson: { name: "Aditi Rao", email: "aditi@microsoft.com", designation: "Campus Talent Lead" },
    tier: "Super Dream",
  },
  {
    companyId: "TCS",
    companyName: "Tata Consultancy Services",
    industry: "IT Services & Consulting",
    website: "https://www.tcs.com",
    contactPerson: { name: "Sanjay Kulkarni", email: "sanjay.k@tcs.com", designation: "Regional University Relations" },
    tier: "Tier 1",
  },
  {
    companyId: "DELOITTE",
    companyName: "Deloitte USI",
    industry: "Consulting & Advisory",
    website: "https://www2.deloitte.com",
    contactPerson: { name: "Pooja Deshmukh", email: "pooja.d@deloitte.com", designation: "University Talent Acquisition" },
    tier: "Tier 1",
  },
];

const JOBS_DATA = [
  {
    jobId: "JOB_TCS_SWE",
    companyId: "TCS",
    role: "Software Development Engineer",
    description: "Looking for top engineering graduates with strong foundations in Python, SQL, and Data Structures. Docker and AWS experience is a plus.",
    requirements: {
      minCGPA: 7.5,
      branches: ["cse", "it", "ece"],
      graduationYear: 2026,
      maxBacklogs: 0,
      requiredSkills: ["Python", "SQL", "Data Structures"],
      preferredSkills: ["Docker", "AWS", "FastAPI"],
    },
    openings: 5,
    ctcRange: { min: 9.0, max: 16.0, formatted: "₹9.0 - ₹16.0 LPA" },
    status: "active",
  },
  {
    jobId: "JOB_MS_CLOUD",
    companyId: "MICROSOFT",
    role: "Cloud Systems Engineer",
    description: "Build hyperscale distributed infrastructure services. Required skills: Python/C++, Distributed Systems, AWS/Azure, SQL.",
    requirements: {
      minCGPA: 8.5,
      branches: ["cse", "it"],
      graduationYear: 2026,
      maxBacklogs: 0,
      requiredSkills: ["Python", "Distributed Systems", "AWS", "SQL"],
      preferredSkills: ["Kubernetes", "Docker", "Machine Learning"],
    },
    openings: 2,
    ctcRange: { min: 28.0, max: 44.0, formatted: "₹28.0 - ₹44.0 LPA" },
    status: "active",
  },
  {
    jobId: "JOB_DELOITTE_ANALYST",
    companyId: "DELOITTE",
    role: "Technology Consultant & Analyst",
    description: "Consult enterprise clients on digital transformation and backend modernizations. Required: SQL, Python, Problem Solving.",
    requirements: {
      minCGPA: 7.0,
      branches: ["cse", "it", "ece", "eee"],
      graduationYear: 2026,
      maxBacklogs: 1,
      requiredSkills: ["SQL", "Python"],
      preferredSkills: ["React", "FastAPI", "Data Analytics"],
    },
    openings: 4,
    ctcRange: { min: 8.5, max: 14.0, formatted: "₹8.5 - ₹14.0 LPA" },
    status: "active",
  },
];

const PANELS_DATA = [
  {
    panelId: "PAN_A",
    companyId: "TCS",
    panelName: "Technical Interview Panel A",
    panelMembers: [
      { memberId: "MEM_1", name: "A. Mehta", email: "a.mehta@tcs.com", role: "Principal Architect" },
      { memberId: "MEM_2", name: "S. Rao", email: "s.rao@tcs.com", role: "Senior SDE" },
    ],
    relevantSkills: ["Python", "SQL", "Data Structures"],
    status: "active",
  },
  {
    panelId: "PAN_B",
    companyId: "MICROSOFT",
    panelName: "Technical Interview Panel B",
    panelMembers: [
      { memberId: "MEM_3", name: "N. Shah", email: "n.shah@microsoft.com", role: "Cloud Lead" },
      { memberId: "MEM_4", name: "K. Iyer", email: "k.iyer@microsoft.com", role: "Staff Engineer" },
    ],
    relevantSkills: ["Distributed Systems", "AWS", "Python", "C++"],
    status: "active",
  },
];

const ROOMS_DATA = [
  {
    roomId: "ROOM_204",
    roomName: "Block A - Room 204",
    building: "Academic Block A",
    floor: "2nd Floor",
    capacity: 4,
    type: "physical",
    status: "available",
  },
  {
    roomId: "ROOM_201",
    roomName: "Block A - Room 201",
    building: "Academic Block A",
    floor: "2nd Floor",
    capacity: 4,
    type: "physical",
    status: "available",
  },
  {
    roomId: "ROOM_VIRTUAL_1",
    roomName: "Virtual Interview Room 1",
    capacity: 10,
    type: "virtual",
    meetingLink: "https://meet.placement.internal/ms-panel-b",
    status: "available",
  },
];

async function seedDatabase() {
  console.log("\n🌱 Starting Database Seeding with Synthetic Placement Dataset...");

  // 1. Clear existing collections
  await Promise.all([
    Student.deleteMany({}),
    Company.deleteMany({}),
    Job.deleteMany({}),
    Resume.deleteMany({}),
    Application.deleteMany({}),
    EligibilityResult.deleteMany({}),
    Match.deleteMany({}),
    Panel.deleteMany({}),
    Room.deleteMany({}),
    Interview.deleteMany({}),
    Notification.deleteMany({}),
    Offer.deleteMany({}),
    AgentLog.deleteMany({}),
    ReadinessPlan.deleteMany({}),
  ]);
  console.log("  🧹 Cleared old records.");

  // 2. Insert Core Entities
  await Student.insertMany(STUDENTS_DATA);
  await Company.insertMany(COMPANIES_DATA);
  await Job.insertMany(JOBS_DATA);
  await Panel.insertMany(PANELS_DATA);
  await Room.insertMany(ROOMS_DATA);
  console.log("  ✅ Seeded Students (10), Companies (3), Jobs (3), Panels (2), Rooms (3).");

  // 3. Create Synthetic Resumes for Students
  for (const st of STUDENTS_DATA) {
    await Resume.create({
      resumeId: `RES_${st.studentId}`,
      studentId: st.studentId,
      version: 1,
      fileName: `${st.name.replace(/\s+/g, "_")}_Resume_2026.pdf`,
      fileUrl: `/uploads/${st.studentId}_resume.pdf`,
      structuredExtraction: {
        skills: st.skills,
        projects: st.projects,
        certifications: st.certifications,
        experience: st.experience,
        cgpa: st.cgpa,
        branch: st.branch,
      },
      parsedAt: new Date(),
    });
  }
  console.log("  ✅ Seeded Resume Documents.");

  // 4. Generate Applications & Eligibility for JOB_TCS_SWE and JOB_MS_CLOUD
  const tcsJob = JOBS_DATA[0];
  const msJob = JOBS_DATA[1];

  for (const st of STUDENTS_DATA) {
    // Check eligibility for TCS
    const cgpaOkTcs = st.cgpa >= tcsJob.requirements.minCGPA;
    const backlogsOkTcs = st.backlogs <= tcsJob.requirements.maxBacklogs;
    const branchOkTcs = tcsJob.requirements.branches.includes(st.branch.toLowerCase());
    const isEligibleTcs = cgpaOkTcs && backlogsOkTcs && branchOkTcs;

    await Application.create({
      applicationId: `APP_${st.studentId}_${tcsJob.jobId}`,
      studentId: st.studentId,
      jobId: tcsJob.jobId,
      status: isEligibleTcs ? "shortlisted" : "not_eligible",
      statusHistory: [
        { status: "applied", changedAt: new Date(Date.now() - 86400000), changedBy: "System" },
        { status: isEligibleTcs ? "eligible" : "not_eligible", changedAt: new Date(Date.now() - 43200000), changedBy: "EligibilityAgent" },
        ...(isEligibleTcs ? [{ status: "shortlisted", changedAt: new Date(), changedBy: "MatchingAgent" }] : []),
      ],
    });

    await EligibilityResult.create({
      eligibilityResultId: `ELIG_${st.studentId}_${tcsJob.jobId}`,
      studentId: st.studentId,
      jobId: tcsJob.jobId,
      eligible: isEligibleTcs,
      reasons: isEligibleTcs
        ? ["Meets academic minimum CGPA 7.5, zero active backlogs, eligible branch."]
        : [!cgpaOkTcs ? `CGPA (${st.cgpa}) below cutoff` : !backlogsOkTcs ? `Has ${st.backlogs} backlogs` : `Branch '${st.branch}' not eligible`],
      failedCriteria: isEligibleTcs ? [] : [!cgpaOkTcs ? "CGPA" : !backlogsOkTcs ? "Backlogs" : "Branch"],
      cgpaSatisfied: cgpaOkTcs,
      branchSatisfied: branchOkTcs,
      backlogsSatisfied: backlogsOkTcs,
      checkedAt: new Date(),
    });

    // Run 5-Pillar Matching
    if (isEligibleTcs) {
      const matchEval = matchingService.evaluateCandidateMatch(st, tcsJob, { structuredExtraction: st });
      await Match.create({
        matchId: `MATCH_${st.studentId}_${tcsJob.jobId}`,
        studentId: st.studentId,
        jobId: tcsJob.jobId,
        matchScore: matchEval.matchScore,
        breakdown: matchEval.breakdown,
        matchedSkills: matchEval.matchedSkills,
        partialSkills: matchEval.partialSkills,
        skillGaps: matchEval.skillGaps,
        assessments: matchEval.assessments,
        recommendation: matchEval.recommendation,
        evidence: {
          resumeId: `RES_${st.studentId}`,
          cgpa: st.cgpa,
          projectsCount: st.projects.length,
          details: matchEval.evidence,
        },
        explanation: matchEval.explanation,
        readinessScore: matchEval.readinessScore,
        generatedAt: new Date(),
      });

      const readinessPlan = matchingService.createPersonalizedReadinessPlan(st.studentId, tcsJob.jobId, matchEval.skillGaps, 3);
      await ReadinessPlan.create({
        planId: `PLAN_${st.studentId}_${tcsJob.jobId}`,
        studentId: st.studentId,
        jobId: tcsJob.jobId,
        targetRole: tcsJob.role,
        skillGaps: matchEval.skillGaps,
        plan: readinessPlan.plan,
        readinessScore: matchEval.readinessScore,
        status: "active",
      });
    }
  }
  console.log("  ✅ Seeded Applications, Eligibility Results, 5-Pillar Matches & Readiness Plans.");

  // 5. Seed Interview Schedules (With an intentional deliberate conflict on STU101 & Technical Panel A for demo)
  const todayStr = new Date(Date.now() + 86400000).toISOString().split("T")[0]; // Tomorrow

  const INTERVIEWS_DATA = [
    {
      interviewId: "INT_1001",
      studentId: "STU101",
      jobId: "JOB_TCS_SWE",
      panelId: "PAN_A",
      roomId: "ROOM_204",
      date: todayStr,
      startTime: "10:00",
      endTime: "10:45",
      roundNumber: 1,
      interviewType: "technical",
      status: "scheduled",
      meetingLink: "https://meet.placement.internal/tcs-slot-1",
    },
    {
      // INTENTIONAL OVERLAP: Panel A double-booked at 10:00 AM with STU102 (Anika Rao)
      interviewId: "INT_1002",
      studentId: "STU102",
      jobId: "JOB_TCS_SWE",
      panelId: "PAN_A",
      roomId: "ROOM_204",
      date: todayStr,
      startTime: "10:00",
      endTime: "10:45",
      roundNumber: 1,
      interviewType: "technical",
      status: "scheduled",
      meetingLink: "https://meet.placement.internal/tcs-slot-2",
    },
    {
      interviewId: "INT_1003",
      studentId: "STU103",
      jobId: "JOB_MS_CLOUD",
      panelId: "PAN_B",
      roomId: "ROOM_201",
      date: todayStr,
      startTime: "13:00",
      endTime: "14:00",
      roundNumber: 1,
      interviewType: "technical",
      status: "scheduled",
      meetingLink: "https://meet.placement.internal/ms-meera",
    },
    {
      interviewId: "INT_1004",
      studentId: "STU105",
      jobId: "JOB_TCS_SWE",
      panelId: "PAN_A",
      roomId: "ROOM_204",
      date: todayStr,
      startTime: "11:30",
      endTime: "12:15",
      roundNumber: 1,
      interviewType: "technical",
      status: "scheduled",
      meetingLink: "https://meet.placement.internal/tcs-sana",
    },
    {
      interviewId: "INT_1005",
      studentId: "STU106",
      jobId: "JOB_TCS_SWE",
      panelId: "PAN_A",
      roomId: "ROOM_204",
      date: todayStr,
      startTime: "14:00",
      endTime: "14:45",
      roundNumber: 1,
      interviewType: "technical",
      status: "scheduled",
      meetingLink: "https://meet.placement.internal/tcs-karan",
    },
  ];

  await Interview.insertMany(INTERVIEWS_DATA);
  console.log("  ✅ Seeded Interview Schedules (5 slots with 1 deliberate panel conflict).");

  // 6. Seed Demo Offer (Aarav Sharma STU107 receives Offer for Microsoft)
  await Offer.create({
    offerId: "OFFER_MS_107",
    studentId: "STU107",
    jobId: "JOB_MS_CLOUD",
    companyId: "MICROSOFT",
    packageDetails: {
      ctc: 4400000,
      baseSalary: 2400000,
      joiningBonus: 500000,
      stocks: 1500000,
      currency: "INR",
      formatted: "₹44.0 LPA",
    },
    status: "extended",
    offeredAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 86400000),
  });

  // 7. Seed Initial Notifications
  await Notification.create([
    {
      notificationId: "NOTIF_001",
      recipientId: "STU101",
      recipientRole: "student",
      title: "Interview Scheduled",
      message: `Your TCS Technical Interview is scheduled for ${todayStr} at 10:00 AM in Block A - Room 204.`,
      type: "interview_scheduled",
      read: false,
    },
    {
      notificationId: "NOTIF_002",
      recipientId: "TPO",
      recipientRole: "tpo",
      title: "Panel Double-Booking Detected",
      message: `Conflict CONF_PAN_A_${todayStr}: Technical Panel A is simultaneously booked for Rahul Verma and Anika Rao at 10:00 AM.`,
      type: "conflict_detected",
      read: false,
    },
  ]);
  console.log("  ✅ Seeded Initial Notifications.");

  console.log("\n🎉 Database Seeding Complete! System ready for end-to-end demo.");
}

if (require.main === module) {
  const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/campus_placement";
  mongoose
    .connect(mongoUri)
    .then(() => seedDatabase())
    .then(() => {
      console.log("✅ Seed script finished successfully.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ Seeding failed:", err.message);
      process.exit(1);
    });
}

module.exports = seedDatabase;
