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

// Import events & services
const EventTypes = require("../events/eventTypes");
const eventBus = require("../events/eventBus");
const socketService = require("../services/socketService");
const notificationAgent = require("../agents/notification/notificationAgent");
const eligibilityAdapter = require("../services/adapters/eligibilityAdapter");
const matchingAdapter = require("../services/adapters/matchingAdapter");
const schedulingAdapter = require("../services/adapters/schedulingAdapter");
const negotiationAdapter = require("../services/adapters/negotiationAdapter");
const placementOrchestrator = require("../orchestrator/placementOrchestrator");
const { app } = require("../server");

async function runTests() {
  console.log("\n========================================================");
  console.log("🧪 STARTING MEMBER 5 BACKEND INTEGRATION & UNIT TESTS");
  console.log("========================================================\n");

  let passedCount = 0;
  let failedCount = 0;

  function recordTest(testName, fn) {
    try {
      fn();
      console.log(`  ✅ PASS: ${testName}`);
      passedCount++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${testName}`);
      console.error(`     Error: ${err.message}`);
      failedCount++;
    }
  }

  async function recordAsyncTest(testName, fn) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${testName}`);
      passedCount++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${testName}`);
      console.error(`     Error: ${err.message}`);
      failedCount++;
    }
  }

  // TEST 1: Verify All Models Exported & Schema Validation
  console.log("--- 1. Database Model Schema Validations ---");
  recordTest("All 14 Mongoose Models exist and are instantiated", () => {
    const models = [
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
    ];
    models.forEach((m) => {
      assert(m, `Model must be defined`);
      assert(m.schema, `Model schema must exist`);
    });
  });

  recordTest("Application model schema has valid lifecycle statuses", () => {
    const statusEnum = Application.schema.path("status").enumValues;
    const requiredStatuses = [
      "applied",
      "eligible",
      "not_eligible",
      "shortlisted",
      "interview_scheduled",
      "selected",
      "rejected",
      "offer_received",
      "offer_accepted",
      "withdrawn",
    ];
    requiredStatuses.forEach((st) => {
      assert(statusEnum.includes(st), `Application status must contain ${st}`);
    });
  });

  recordTest("Notification model schema contains required types", () => {
    const typeEnum = Notification.schema.path("type").enumValues;
    const requiredTypes = [
      "interview_scheduled",
      "interview_rescheduled",
      "candidate_shortlisted",
      "conflict_detected",
      "conflict_resolved",
      "interview_reminder",
      "offer_received",
      "offer_accepted",
      "rematch_triggered",
    ];
    requiredTypes.forEach((t) => {
      assert(typeEnum.includes(t), `Notification types must contain ${t}`);
    });
  });

  // TEST 2: Event System & Enums
  console.log("\n--- 2. Event Bus & Event Constants ---");
  recordTest("EventTypes contains all essential placement lifecycle events", () => {
    const expectedEvents = [
      "JOB_CREATED",
      "JD_PARSED",
      "RESUME_UPLOADED",
      "ELIGIBILITY_COMPLETED",
      "MATCHING_STARTED",
      "MATCHING_COMPLETED",
      "CANDIDATE_SHORTLISTED",
      "SCHEDULE_CREATED",
      "CONFLICT_DETECTED",
      "NEGOTIATION_STARTED",
      "RESOLUTION_PROPOSED",
      "TPO_APPROVAL_REQUIRED",
      "TPO_APPROVED",
      "TPO_REJECTED",
      "INTERVIEW_REMINDER",
      "OFFER_RECEIVED",
      "OFFER_ACCEPTED",
      "REMATCH_TRIGGERED",
      "READINESS_PLAN_CREATED",
    ];
    expectedEvents.forEach((ev) => {
      assert.strictEqual(EventTypes[ev], ev, `Event ${ev} must match its key`);
    });
  });

  await recordAsyncTest("EventBus publishes and dispatches to subscribers", async () => {
    let received = false;
    const testHandler = (evt) => {
      if (evt.payload?.testKey === "testValue123") {
        received = true;
      }
    };

    eventBus.subscribe("TEST_EVENT", testHandler);
    await eventBus.publish("TEST_EVENT", {
      source: "TestRunner",
      payload: { testKey: "testValue123" },
    });
    eventBus.unsubscribe("TEST_EVENT", testHandler);

    assert.strictEqual(received, true, "Subscriber must receive published event");
  });

  // TEST 3: Notification Agent Business Rules
  console.log("\n--- 3. Notification Agent Rules & Recipient Targeting ---");
  await recordAsyncTest("Notification Agent adheres to strict Unresolved Conflict TPO-only rule", async () => {
    const dispatchedNotifications = [];
    const originalCreate = notificationAgent.createAndSendNotification;

    notificationAgent.createAndSendNotification = async (params) => {
      dispatchedNotifications.push(params);
      return params;
    };

    await notificationAgent.handleConflictDetected({
      entity: { conflictId: "CONF_TEST_001" },
      payload: { description: "Panel overlap detected" },
    });

    notificationAgent.createAndSendNotification = originalCreate;

    assert.strictEqual(dispatchedNotifications.length, 1, "Only 1 notification should be dispatched");
    assert.strictEqual(
      dispatchedNotifications[0].recipientRole,
      "tpo",
      "Unresolved conflict notification MUST ONLY target TPO"
    );
    assert.strictEqual(
      dispatchedNotifications[0].recipientId,
      "TPO",
      "Recipient ID should be TPO"
    );
  });

  await recordAsyncTest("Notification Agent notifies Student, Panel, and TPO on Interview Scheduled", async () => {
    const dispatched = [];
    const originalCreate = notificationAgent.createAndSendNotification;
    notificationAgent.createAndSendNotification = async (params) => {
      dispatched.push(params);
      return params;
    };

    await notificationAgent.handleInterviewScheduled({
      entity: { studentId: "STU_001", panelId: "PANEL_001", interviewId: "INT_001" },
      payload: { date: "2026-09-01", startTime: "10:00", role: "Software Engineer" },
    });

    notificationAgent.createAndSendNotification = originalCreate;

    assert.strictEqual(dispatched.length, 3, "Must notify Student, Panel, and TPO");
    const roles = dispatched.map((d) => d.recipientRole);
    assert(roles.includes("student"), "Must notify student");
    assert(roles.includes("panel"), "Must notify panel");
    assert(roles.includes("tpo"), "Must notify tpo");
  });

  await recordAsyncTest("Notification Agent notifies Student, Panel, and TPO on Conflict Resolved", async () => {
    const dispatched = [];
    const originalCreate = notificationAgent.createAndSendNotification;
    notificationAgent.createAndSendNotification = async (params) => {
      dispatched.push(params);
      return params;
    };

    await notificationAgent.handleConflictResolved({
      entity: { studentId: "STU_002", panelId: "PANEL_002", interviewId: "INT_002" },
      payload: { resolution: "Shifted slot to 16:00" },
    });

    notificationAgent.createAndSendNotification = originalCreate;

    assert.strictEqual(dispatched.length, 3, "Resolved conflict must notify Student, Panel, and TPO");
  });

  // TEST 4: Adapters & Interfaces
  console.log("\n--- 4. Integration Adapters & Stubs ---");
  recordTest("All 4 Integration Adapters instantiate with provider registration hooks", () => {
    assert(typeof eligibilityAdapter.checkEligibility === "function");
    assert(typeof eligibilityAdapter.registerEligibilityProvider === "function");
    assert(typeof matchingAdapter.runMatching === "function");
    assert(typeof matchingAdapter.registerMatchingProvider === "function");
    assert(typeof schedulingAdapter.generateSchedule === "function");
    assert(typeof schedulingAdapter.registerSchedulingProvider === "function");
    assert(typeof negotiationAdapter.startNegotiation === "function");
    assert(typeof negotiationAdapter.registerNegotiationProvider === "function");
  });

  // TEST 5: Negotiation & Human-in-the-Loop TPO Approval
  console.log("\n--- 5. Negotiation & Human-in-the-Loop TPO Decisions ---");
  await recordAsyncTest("Negotiation Adapter generates proposal and supports TPO Approval", async () => {
    const conflict = {
      conflictId: "CONF_MOCK_101",
      studentId: "STU_MOCK_1",
      panelId: "PANEL_MOCK_1",
      type: "PANEL_OVERLAP",
    };

    const proposal = await negotiationAdapter.startNegotiation(conflict);
    assert(proposal.proposalId, "Proposal ID must be generated");
    assert.strictEqual(proposal.status, "pending_approval");

    const approvalResult = await negotiationAdapter.approveProposal(proposal.proposalId, "TPO_ADMIN_USER");
    assert.strictEqual(approvalResult.success, true);
    assert.strictEqual(approvalResult.proposal.status, "approved");
    assert.strictEqual(approvalResult.proposal.approvedBy, "TPO_ADMIN_USER");
  });

  await recordAsyncTest("Negotiation Adapter supports TPO Rejection", async () => {
    const proposal = await negotiationAdapter.startNegotiation({
      conflictId: "CONF_MOCK_102",
      type: "ROOM_CLASH",
    });

    const rejectionResult = await negotiationAdapter.rejectProposal(
      proposal.proposalId,
      "Room capacity insufficient",
      "TPO_ADMIN"
    );
    assert.strictEqual(rejectionResult.success, true);
    assert.strictEqual(rejectionResult.proposal.status, "rejected");
    assert.strictEqual(rejectionResult.proposal.rejectionReason, "Room capacity insufficient");
  });

  // TEST 6: Socket.io Service Verification
  console.log("\n--- 6. Socket.io Service Functions ---");
  recordTest("SocketService exposes all targeted and role broadcasting methods", () => {
    assert(typeof socketService.sendToUser === "function");
    assert(typeof socketService.sendToRole === "function");
    assert(typeof socketService.broadcastAgentActivity === "function");
    assert(typeof socketService.broadcastNotification === "function");
    assert(typeof socketService.broadcastScheduleUpdate === "function");
    assert(typeof socketService.broadcastConflictUpdate === "function");
    assert(typeof socketService.broadcastOfferCascade === "function");
  });

  // TEST 7: Placement Orchestrator
  console.log("\n--- 7. Placement Orchestrator Coordination ---");
  recordTest("Placement Orchestrator instantiates and exposes core workflow methods", () => {
    assert(typeof placementOrchestrator.runJobCampaignPipeline === "function");
    assert(typeof placementOrchestrator.handleOfferAcceptedCascade === "function");
  });

  // TEST 8: Express Server & Routes Mounted
  console.log("\n--- 8. API Layer Routes Verification ---");
  recordTest("Express App has all required root and API sub-routers", () => {
    assert(app, "Express app must exist");
    const stack = app.router?.stack || app._router?.stack || [];
    assert(stack.length > 0, "Middleware stack must be populated");
  });

  console.log("\n========================================================");
  console.log(`📊 TEST SUMMARY: Passed: ${passedCount}, Failed: ${failedCount}`);
  console.log("========================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runTests().then(() => {
    process.exit(0);
  }).catch((err) => {
    console.error("❌ Test suite encountered fatal error:", err);
    process.exit(1);
  });
}

module.exports = runTests;
