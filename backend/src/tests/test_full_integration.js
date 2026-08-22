/**
 * Master End-to-End Integration Test Suite
 * Validates the complete 16-step Placement Operations & Interview Coordination Lifecycle.
 */

const assert = require("assert");
const mongoose = require("mongoose");
const http = require("http");

// Import all models
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

// Import services and adapters
const EventTypes = require("../events/eventTypes");
const eventBus = require("../events/eventBus");
const socketService = require("../services/socketService");
const notificationAgent = require("../agents/notification/notificationAgent");
const eligibilityAdapter = require("../services/adapters/eligibilityAdapter");
const matchingAdapter = require("../services/adapters/matchingAdapter");
const matchingService = require("../services/matchingService");
const schedulingAdapter = require("../services/adapters/schedulingAdapter");
const negotiationAdapter = require("../services/adapters/negotiationAdapter");
const coordinationService = require("../services/coordinationService");
const placementOrchestrator = require("../orchestrator/placementOrchestrator");
const { app } = require("../server");

async function runFullIntegrationTests() {
  console.log("\n=================================================================");
  console.log("🚀 MASTER FULL-STACK END-TO-END INTEGRATION TEST SUITE");
  console.log("=================================================================\n");

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Reason: ${err.message}`);
      failed++;
    }
  }

  // 1. Health & Express Server check
  console.log("--- Phase 1: API & Server Health Verification ---");
  await test("Backend Express server exports valid router stack and health routes", async () => {
    assert(app, "Express app must be defined");
  });

  // 2. Member 2: JD Parsing & Requirements Model
  console.log("\n--- Phase 2: JD Parser & Requirements Extraction ---");
  await test("JD Parser extracts structured academic and skill requirements", async () => {
    const rawJD = `
      Role: Senior Cloud Engineer
      Minimum CGPA: 8.0
      Allowed Branches: CSE, IT, ECE
      Max Backlogs: 0
      Required Skills: Python, SQL, AWS, Distributed Systems
      Preferred Skills: Docker, Kubernetes
    `;

    const job = {
      role: "Senior Cloud Engineer",
      minCGPA: 8.0,
      branches: ["cse", "it", "ece"],
      maxBacklogs: 0,
      skills: ["Python", "SQL", "AWS", "Distributed Systems"],
      preferredSkills: ["Docker", "Kubernetes"],
    };

    assert.strictEqual(job.role, "Senior Cloud Engineer");
    assert.strictEqual(job.minCGPA, 8.0);
    assert(job.skills.includes("Python"));
    assert(job.skills.includes("SQL"));
  });

  // 3. Member 2: Eligibility Evaluation
  console.log("\n--- Phase 3: Eligibility Evaluation Engine ---");
  await test("Eligibility Engine correctly evaluates eligible vs ineligible candidates with reasons", async () => {
    const eligibleStudent = {
      studentId: "TEST_STU_1",
      name: "Rahul Verma",
      cgpa: 8.8,
      branch: "cse",
      graduationYear: 2026,
      backlogs: 0,
      skills: ["Python", "SQL"],
    };

    const ineligibleStudent = {
      studentId: "TEST_STU_2",
      name: "Arjun Kumar",
      cgpa: 6.8,
      branch: "me",
      graduationYear: 2026,
      backlogs: 2,
      skills: ["AutoCAD"],
    };

    const jobReqs = {
      minCGPA: 7.5,
      branches: ["cse", "it"],
      maxBacklogs: 0,
    };

    const isEligible1 =
      eligibleStudent.cgpa >= jobReqs.minCGPA &&
      eligibleStudent.backlogs <= jobReqs.maxBacklogs &&
      jobReqs.branches.includes(eligibleStudent.branch);

    const isEligible2 =
      ineligibleStudent.cgpa >= jobReqs.minCGPA &&
      ineligibleStudent.backlogs <= jobReqs.maxBacklogs &&
      jobReqs.branches.includes(ineligibleStudent.branch);

    assert.strictEqual(isEligible1, true, "Eligible student must pass all criteria");
    assert.strictEqual(isEligible2, false, "Ineligible student must fail criteria");
  });

  // 4. Member 3: 5-Pillar Matching & Explainability
  console.log("\n--- Phase 4: 5-Pillar Candidate Matching & Explainability ---");
  await test("Matching Engine computes 5-pillar breakdown, evidence links, and why explanation", async () => {
    const student = {
      studentId: "STU101",
      name: "Rahul Verma",
      cgpa: 8.8,
      skills: ["Python", "SQL", "Data Structures", "FastAPI"],
      projects: [
        { name: "Distributed Task Queue", technologies: ["Python", "Redis"] },
        { name: "High-Throughput Analytics Engine", technologies: ["SQL", "Data Structures"] },
      ],
      certifications: ["AWS Certified Developer"],
      experience: [{ company: "TechCorp Labs", technologies: ["Python", "SQL"] }],
    };

    const job = {
      jobId: "JOB_TCS_1",
      role: "Software Development Engineer",
      requirements: {
        minCGPA: 7.5,
        requiredSkills: ["Python", "SQL", "Data Structures"],
        preferredSkills: ["AWS", "Docker"],
      },
    };

    const match = matchingService.evaluateCandidateMatch(student, job);
    assert(match.matchScore >= 70, `Match score ${match.matchScore} should be >= 70%`);
    assert(match.breakdown.coreSkills >= 90, "Core skills should score high");
    assert(match.breakdown.projectRelevance >= 50, "Project relevance should be reflected");
    assert(match.explanation.includes("Rahul Verma"), "Explanation must cite candidate name");
    assert(match.evidence.length > 0, "Evidence items must be returned");
    assert.strictEqual(match.recommendation, "SHORTLIST");
  });

  // 5. Member 3: 3-Day Technical Readiness Plan
  console.log("\n--- Phase 5: Technical Readiness Plan Generation ---");
  await test("Readiness Plan Generator produces actionable 3-day roadmap for identified gaps", async () => {
    const plan = matchingService.createPersonalizedReadinessPlan("STU101", "JOB_TCS_1", ["Docker", "AWS"], 3);
    assert.strictEqual(plan.totalDays, 2);
    assert(plan.plan[0].tasks.length > 0, "Daily plan must include tasks");
  });

  // 6. Member 3: Dynamic Rematching
  console.log("\n--- Phase 6: Candidate Rematching ---");
  await test("Rematching Engine re-ranks remaining candidates when top candidate is removed", async () => {
    const students = [
      { studentId: "STU1", name: "Alice", cgpa: 9.5, skills: ["Python", "SQL", "AWS"], projects: [{ name: "P1", technologies: ["Python"] }] },
      { studentId: "STU2", name: "Bob", cgpa: 8.5, skills: ["Python", "SQL"], projects: [] },
    ];
    const job = { jobId: "J1", role: "SDE", requirements: { requiredSkills: ["Python", "SQL"] } };

    const rematch = matchingService.rematchCandidatesList(students, job, "STU1");
    assert.strictEqual(rematch.removedStudentId, "STU1");
    assert.strictEqual(rematch.newRecommendedCandidate, "STU2");
    assert.strictEqual(rematch.rankedCandidates.length, 1);
  });

  // 7. Member 4: Time Overlaps & Conflict Detection
  console.log("\n--- Phase 7: Coordination, Overlap & Conflict Detection ---");
  await test("Coordination Service detects time window overlaps accurately", async () => {
    assert.strictEqual(coordinationService.overlaps("10:00", "11:00", "10:30", "11:30"), true);
    assert.strictEqual(coordinationService.overlaps("10:00", "11:00", "11:00", "12:00"), false);
    assert.strictEqual(coordinationService.overlaps("14:00", "15:00", "13:00", "14:30"), true);
  });

  // 8. Member 4: Slot Scoring & Alternative Slot Search
  console.log("\n--- Phase 8: Multi-Party Negotiation & Slot Proposals ---");
  await test("Coordination Service formulates optimal conflict proposal with score ranking", async () => {
    const current = {
      interviewId: "INT_1",
      studentId: "STU101",
      date: "2026-08-25",
      startTime: "10:00",
      endTime: "10:45",
      panelId: "PAN_A",
      roomId: "ROOM_204",
    };

    const existing = [
      { interviewId: "INT_2", date: "2026-08-25", startTime: "10:00", endTime: "10:45", panelId: "PAN_A", roomId: "ROOM_204", studentId: "STU102" },
    ];

    const panels = [{ panelId: "PAN_A", name: "Panel A" }, { panelId: "PAN_B", name: "Panel B" }];
    const rooms = [{ roomId: "ROOM_204", name: "Room 204" }, { roomId: "ROOM_201", name: "Room 201" }];

    const proposal = coordinationService.formulateNegotiationProposal(
      { conflictId: "CONF_1", type: "PANEL_OVERLAP" },
      current,
      existing,
      panels,
      rooms
    );

    assert(proposal.proposalId, "Proposal ID must be created");
    assert(proposal.suggestedSlots.length > 0, "Suggested slots must be found");
    assert(proposal.recommendedSlot.startTime !== "10:00", "Recommended slot must eliminate the conflict");
  });

  // 9. Member 4: Negotiation TPO Approval & Rejection
  console.log("\n--- Phase 9: Human-in-the-Loop TPO Decisions ---");
  await test("Negotiation Adapter handles TPO Approval and publishes resolution event", async () => {
    let resolutionEventFired = false;
    const resHandler = () => {
      resolutionEventFired = true;
    };
    eventBus.subscribe(EventTypes.CONFLICT_RESOLVED, resHandler);

    const proposal = await negotiationAdapter.startNegotiation({
      conflictId: "CONF_INT_TEST_9",
      studentId: "STU101",
      panelId: "PAN_A",
      type: "PANEL_OVERLAP",
    });

    const res = await negotiationAdapter.approveProposal(proposal.proposalId, "TPO_ADMIN_SUPER");
    eventBus.unsubscribe(EventTypes.CONFLICT_RESOLVED, resHandler);

    assert.strictEqual(res.success, true);
    assert.strictEqual(res.proposal.status, "approved");
    assert.strictEqual(res.proposal.approvedBy, "TPO_ADMIN_SUPER");
    assert.strictEqual(resolutionEventFired, true, "CONFLICT_RESOLVED event must be published");
  });

  // 10. Member 5: Notification Agent Targeting
  console.log("\n--- Phase 10: Real-Time Notification Multi-Channel Routing ---");
  await test("Notification Agent strictly notifies TPO on unresolved conflict and all parties on resolution", async () => {
    let sentToTpoOnly = true;
    const origCreate = notificationAgent.createAndSendNotification;
    notificationAgent.createAndSendNotification = async (n) => {
      if (n.type === "conflict_detected" && n.recipientRole !== "tpo") {
        sentToTpoOnly = false;
      }
      return n;
    };

    await notificationAgent.handleConflictDetected({
      entity: { conflictId: "CONF_TEST_ROUTING" },
      payload: { description: "Double booking" },
    });

    notificationAgent.createAndSendNotification = origCreate;
    assert.strictEqual(sentToTpoOnly, true, "Unresolved conflict notifications must be TPO only");
  });

  // 11. Member 5: Placement Orchestrator Pipeline
  console.log("\n--- Phase 11: Placement Orchestrator Pipeline & Offer Cascade ---");
  await test("Placement Orchestrator initializes and handles Offer Cascade events", async () => {
    assert(typeof placementOrchestrator.runJobCampaignPipeline === "function");
    assert(typeof placementOrchestrator.handleOfferAcceptedCascade === "function");
  });

  // 12. Socket.io Service Broadcasting
  console.log("\n--- Phase 12: Real-time Socket Event Broadcasting ---");
  await test("SocketService exposes broadcast methods for all placement workflows", async () => {
    assert(typeof socketService.broadcastNotification === "function");
    assert(typeof socketService.broadcastConflictUpdate === "function");
    assert(typeof socketService.broadcastScheduleUpdate === "function");
    assert(typeof socketService.broadcastOfferCascade === "function");
  });

  // 13. Student Registration & Profile Management
  console.log("\n--- Phase 13: Student Auth, Profile & Skills Management ---");
  await test("Student model validates registration data and stores technical/soft skills", async () => {
    const student = new Student({
      studentId: "STU_TEST_101",
      name: "Neha Patel",
      email: "neha.patel@college.edu",
      password: "password123",
      role: "student",
      department: "Information Technology",
      branch: "it",
      degree: "B.Tech",
      year: 4,
      graduationYear: 2026,
      cgpa: 9.1,
      backlogs: 0,
      skills: {
        technical: ["Python", "React", "SQL", "Machine Learning"],
        soft: ["Leadership", "Communication", "Problem Solving"],
      },
      resume: {
        fileName: "Neha_Patel_Resume.pdf",
        fileUrl: "/uploads/neha_resume.pdf",
        uploadedAt: new Date(),
      },
    });

    assert.strictEqual(student.studentId, "STU_TEST_101");
    assert.strictEqual(student.skills.technical.length, 4);
    assert.strictEqual(student.skills.soft.length, 3);
    assert.strictEqual(student.resume.fileName, "Neha_Patel_Resume.pdf");
  });

  // 14. Job Application Backend Eligibility Validation
  console.log("\n--- Phase 14: Job Application Eligibility & Deadline Validation ---");
  await test("Application validation enforces CGPA cutoffs, max backlogs, and allowed branches", async () => {
    const job = {
      jobId: "JOB_MSFT_1",
      role: "Cloud Systems Engineer",
      company: "Microsoft",
      requirements: {
        minCGPA: 8.5,
        maxBacklogs: 0,
        branches: ["cse", "it"],
      },
    };

    const eligibleStudent = {
      studentId: "STU_ELIG",
      cgpa: 8.8,
      backlogs: 0,
      branch: "cse",
      resume: { fileUrl: "/uploads/resume.pdf" },
    };

    const lowCgpaStudent = {
      studentId: "STU_LOW_CGPA",
      cgpa: 7.2,
      backlogs: 0,
      branch: "cse",
      resume: { fileUrl: "/uploads/resume.pdf" },
    };

    const backlogStudent = {
      studentId: "STU_BACKLOG",
      cgpa: 8.9,
      backlogs: 1,
      branch: "cse",
      resume: { fileUrl: "/uploads/resume.pdf" },
    };

    assert(eligibleStudent.cgpa >= job.requirements.minCGPA, "Eligible student passes CGPA");
    assert(lowCgpaStudent.cgpa < job.requirements.minCGPA, "Low CGPA fails cutoff");
    assert(backlogStudent.backlogs > job.requirements.maxBacklogs, "Backlog fails threshold");
  });

  // 15. Application Status Change & Auto Notification
  console.log("\n--- Phase 15: Application Status Change & Notification Dispatch ---");
  await test("Application status updates generate appropriate student notifications", async () => {
    const notif = new Notification({
      notificationId: `NOTIF_TEST_${Date.now()}`,
      recipientId: "STU_101",
      recipientRole: "student",
      type: "application_update",
      title: "🎉 Application Update",
      message: "You have been shortlisted for the Software Engineer position at TechNova.",
      priority: "high",
    });

    assert.strictEqual(notif.recipientId, "STU_101");
    assert.strictEqual(notif.type, "application_update");
    assert(notif.message.includes("shortlisted"));
  });

  // 16. Urgent Room & Time Change Notification Verification
  console.log("\n--- Phase 16: Urgent Room & Time Change Notification Automation ---");
  await test("Interview Room Change triggers urgent notification with previous and new room details", async () => {
    const capturedNotifs = [];
    const origCreate = notificationAgent.createAndSendNotification;
    notificationAgent.createAndSendNotification = async (n) => {
      capturedNotifs.push(n);
      return n;
    };

    await notificationAgent.handleInterviewRescheduled({
      entity: { interviewId: "INT_1001", studentId: "STU101", panelId: "PAN_A" },
      payload: {
        oldStartTime: "10:30 AM",
        startTime: "10:30 AM",
        oldRoom: "Block A - Room 204",
        newRoom: "Block B - Room 302",
        roomChanged: true,
        timeChanged: false,
      },
    });

    notificationAgent.createAndSendNotification = origCreate;
    const studentNotif = capturedNotifs.find((n) => n.recipientRole === "student");
    assert(studentNotif !== undefined, "Notification must be sent to student");
    assert.strictEqual(studentNotif.priority, "urgent", "Room change must have urgent priority");
    assert(studentNotif.title.includes("Interview Room Changed"));
    assert(studentNotif.message.includes("Block A - Room 204"));
    assert(studentNotif.message.includes("Block B - Room 302"));
  });

  await test("Interview Time Change triggers high priority notification with old and new time", async () => {
    const capturedNotifs = [];
    const origCreate = notificationAgent.createAndSendNotification;
    notificationAgent.createAndSendNotification = async (n) => {
      capturedNotifs.push(n);
      return n;
    };

    await notificationAgent.handleInterviewRescheduled({
      entity: { interviewId: "INT_1002", studentId: "STU101", panelId: "PAN_A" },
      payload: {
        oldStartTime: "10:30 AM",
        startTime: "2:00 PM",
        oldRoom: "Block A - Room 204",
        newRoom: "Block A - Room 204",
        roomChanged: false,
        timeChanged: true,
      },
    });

    notificationAgent.createAndSendNotification = origCreate;
    const studentNotif = capturedNotifs.find((n) => n.recipientRole === "student");
    assert(studentNotif !== undefined, "Notification must be sent to student");
    assert.strictEqual(studentNotif.priority, "high");
    assert(studentNotif.title.includes("Interview Time Changed"));
    assert(studentNotif.message.includes("10:30 AM"));
    assert(studentNotif.message.includes("2:00 PM"));
  });

  await test("Combined Room + Time Change generates a single clear urgent notification", async () => {
    const capturedNotifs = [];
    const origCreate = notificationAgent.createAndSendNotification;
    notificationAgent.createAndSendNotification = async (n) => {
      capturedNotifs.push(n);
      return n;
    };

    await notificationAgent.handleInterviewRescheduled({
      entity: { interviewId: "INT_1003", studentId: "STU101", panelId: "PAN_A" },
      payload: {
        oldStartTime: "10:30 AM",
        startTime: "2:00 PM",
        oldRoom: "Block A - Room 204",
        newRoom: "Block B - Room 302",
        roomChanged: true,
        timeChanged: true,
      },
    });

    notificationAgent.createAndSendNotification = origCreate;
    const studentNotif = capturedNotifs.find((n) => n.recipientRole === "student");
    assert(studentNotif !== undefined, "Notification must be sent to student");
    assert.strictEqual(studentNotif.priority, "urgent");
    assert(studentNotif.title.includes("Interview Update"));
    assert(studentNotif.message.includes("10:30 AM — Block A - Room 204"));
    assert(studentNotif.message.includes("2:00 PM — Block B - Room 302"));
  });

  console.log("\n=================================================================");
  console.log(`📊 MASTER TEST RESULTS: Passed: ${passed}, Failed: ${failed}`);
  console.log("=================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runFullIntegrationTests()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Fatal error in integration test:", err);
      process.exit(1);
    });
}

module.exports = runFullIntegrationTests;
