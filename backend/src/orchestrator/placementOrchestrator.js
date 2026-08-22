const Student = require("../models/student");
const Job = require("../models/jobs");
const Application = require("../models/application");
const Offer = require("../models/offer");
const Interview = require("../models/interview");
const eventBus = require("../events/eventBus");
const EventTypes = require("../events/eventTypes");
const eligibilityAdapter = require("../services/adapters/eligibilityAdapter");
const matchingAdapter = require("../services/adapters/matchingAdapter");
const schedulingAdapter = require("../services/adapters/schedulingAdapter");
const negotiationAdapter = require("../services/adapters/negotiationAdapter");
const socketService = require("../services/socketService");

class PlacementOrchestrator {
  constructor() {
    this.name = "PlacementOrchestrator";
    this.isInitialized = false;
  }

  /**
   * Initialize event handlers for orchestrator
   */
  init() {
    if (this.isInitialized) return;

    // Listen to job creation to kick off pipeline
    eventBus.subscribe(EventTypes.JOB_CREATED, (event) =>
      this.handleJobCreated(event)
    );

    // Listen to offer acceptance for cascade & dynamic rematching
    eventBus.subscribe(EventTypes.OFFER_ACCEPTED, (event) =>
      this.handleOfferAcceptedCascade(event)
    );

    this.isInitialized = true;
    console.log("🎯 Placement Orchestrator initialized and listening for events");
  }

  /**
   * Complete End-to-End Orchestrated Pipeline for a Job:
   * JOB_CREATED -> Eligibility -> Matching -> Shortlisting -> Scheduling -> Notification
   */
  async runJobCampaignPipeline(jobId) {
    const job = await Job.findOne({ jobId });
    if (!job) throw new Error(`Job ${jobId} not found`);

    console.log(`🚀 [PlacementOrchestrator] Starting campaign pipeline for Job ${jobId} (${job.role})`);

    // Step 1: Run Eligibility Check
    const eligibilityResults = await eligibilityAdapter.checkBatchEligibility(jobId);
    const eligibleCount = eligibilityResults.filter((r) => r.eligible).length;
    console.log(`✅ [PlacementOrchestrator] Eligibility done: ${eligibleCount} eligible candidates.`);

    if (eligibleCount === 0) {
      return {
        success: true,
        jobId,
        stage: "ELIGIBILITY_COMPLETED",
        message: "No candidates met the minimum academic eligibility requirements.",
        eligibleCount: 0,
      };
    }

    // Step 2: Run Matching & Skill Gap Analysis
    const matches = await matchingAdapter.runMatching(jobId);
    const shortlistedMatches = matches.filter((m) => m.matchScore >= 65);
    const shortlistedStudentIds = shortlistedMatches.map((m) => m.studentId);
    console.log(`✅ [PlacementOrchestrator] Matching done: ${shortlistedMatches.length} candidates shortlisted.`);

    if (shortlistedStudentIds.length === 0) {
      return {
        success: true,
        jobId,
        stage: "MATCHING_COMPLETED",
        message: "Candidates evaluated, but none met the shortlist score threshold.",
        shortlistedCount: 0,
      };
    }

    // Step 3: Generate Interview Schedule
    const scheduleResult = await schedulingAdapter.generateSchedule(
      jobId,
      shortlistedStudentIds
    );
    console.log(`✅ [PlacementOrchestrator] Scheduling done: ${scheduleResult.totalScheduled} slots scheduled.`);

    // Step 4: Check for conflicts
    const conflictResult = await schedulingAdapter.detectConflicts(jobId);
    if (conflictResult.hasConflicts) {
      console.log(`⚠️ [PlacementOrchestrator] ${conflictResult.totalConflicts} conflicts detected, launching negotiation.`);
      for (const conf of conflictResult.conflicts) {
        await negotiationAdapter.startNegotiation(conf);
      }
    }

    return {
      success: true,
      jobId,
      stage: "PIPELINE_COMPLETED",
      eligibleCount,
      shortlistedCount: shortlistedMatches.length,
      scheduledInterviews: scheduleResult.interviews?.length || 0,
      conflictsDetected: conflictResult.totalConflicts,
    };
  }

  /**
   * Handle Job Created Event
   */
  async handleJobCreated(event) {
    const jobId = event.entity?.jobId || event.payload?.jobId;
    if (jobId) {
      try {
        await this.runJobCampaignPipeline(jobId);
      } catch (err) {
        console.error(`❌ [PlacementOrchestrator] Failed to execute pipeline for ${jobId}:`, err.message);
      }
    }
  }

  /**
   * Offer Acceptance Cascade & Dynamic Rematching Workflow:
   * 1. Student accepts offer for Job A
   * 2. Mark Student status as "placed"
   * 3. Withdraw/Cancel other ongoing interviews for this student in other jobs (Job B, C...)
   * 4. Trigger Dynamic Rematching for affected jobs to fill the vacant interview slots
   */
  async handleOfferAcceptedCascade(event) {
    const { entity, payload } = event;
    const studentId = entity?.studentId || payload?.studentId;
    const acceptedJobId = entity?.jobId || payload?.jobId;
    const offerId = entity?.offerId || payload?.offerId;

    if (!studentId) return;

    console.log(`🔄 [PlacementOrchestrator] Processing Offer Acceptance Cascade for Student ${studentId}`);

    // 1. Update Student status to 'placed'
    await Student.findOneAndUpdate({ studentId }, { placementStatus: "placed" });

    // 2. Mark current application as 'offer_accepted'
    if (acceptedJobId) {
      await Application.findOneAndUpdate(
        { studentId, jobId: acceptedJobId },
        {
          status: "offer_accepted",
          $push: {
            statusHistory: {
              status: "offer_accepted",
              changedAt: new Date(),
              changedBy: "PlacementOrchestrator",
              reason: `Accepted offer ${offerId || ""}`,
            },
          },
        }
      );
    }

    // 3. Find other applications of this student and withdraw them
    const otherApplications = await Application.find({
      studentId,
      jobId: { $ne: acceptedJobId },
      status: { $in: ["applied", "eligible", "shortlisted", "interview_scheduled", "selected", "offer_received"] },
    });

    const affectedJobIds = new Set();

    for (const otherApp of otherApplications) {
      affectedJobIds.add(otherApp.jobId);

      await Application.findOneAndUpdate(
        { applicationId: otherApp.applicationId },
        {
          status: "withdrawn",
          $push: {
            statusHistory: {
              status: "withdrawn",
              changedAt: new Date(),
              changedBy: "PlacementOrchestrator",
              reason: `Candidate accepted offer with another company (${acceptedJobId})`,
            },
          },
        }
      );
    }

    // 4. Cancel any future scheduled interviews for this student in other jobs
    const cancelledInterviews = await Interview.find({
      studentId,
      jobId: { $ne: acceptedJobId },
      status: "scheduled",
    });

    for (const intv of cancelledInterviews) {
      affectedJobIds.add(intv.jobId);
      intv.status = "cancelled";
      intv.cancellationReason = `Student ${studentId} placed with another company (${acceptedJobId})`;
      await intv.save();

      await eventBus.publish(EventTypes.INTERVIEW_CANCELLED, {
        source: this.name,
        message: `Interview slot freed for Job ${intv.jobId} (Student ${studentId} placed elsewhere)`,
        entity: {
          studentId,
          jobId: intv.jobId,
          interviewId: intv.interviewId,
          panelId: intv.panelId,
        },
        payload: { reason: intv.cancellationReason },
      });
    }

    // 5. Trigger Dynamic Rematching for all affected jobs to backfill vacant interview slots
    for (const affectedJobId of affectedJobIds) {
      await eventBus.publish(EventTypes.REMATCH_TRIGGERED, {
        source: this.name,
        message: `Dynamic rematching initiated for Job ${affectedJobId} to backfill slot vacated by ${studentId}`,
        entity: { jobId: affectedJobId, studentId },
        payload: {
          vacatedByStudent: studentId,
          acceptedJobId,
          reason: "Candidate placed elsewhere; backfilling next best candidate",
        },
      });

      // Find next best matched candidate who is available and not yet shortlisted
      try {
        const nextEligibleApps = await Application.find({
          jobId: affectedJobId,
          status: "eligible",
        });

        if (nextEligibleApps.length > 0) {
          await matchingAdapter.runMatching(affectedJobId);

          // Get newly shortlisted
          const newlyShortlisted = await Application.find({
            jobId: affectedJobId,
            status: "shortlisted",
          });

          // Schedule newly shortlisted candidate into freed slot
          if (newlyShortlisted.length > 0) {
            await schedulingAdapter.generateSchedule(
              affectedJobId,
              newlyShortlisted.map((s) => s.studentId)
            );
          }
        }
      } catch (err) {
        console.error(`⚠️ Error during rematching backfill for Job ${affectedJobId}:`, err.message);
      }
    }

    // 6. Broadcast cascade event
    socketService.broadcastOfferCascade({
      studentId,
      acceptedJobId,
      affectedJobIds: Array.from(affectedJobIds),
      cancelledInterviewsCount: cancelledInterviews.length,
      timestamp: new Date(),
    });

    return {
      success: true,
      studentId,
      acceptedJobId,
      withdrawnApplications: otherApplications.length,
      cancelledInterviews: cancelledInterviews.length,
      affectedJobsRematched: Array.from(affectedJobIds),
    };
  }
}

const placementOrchestrator = new PlacementOrchestrator();
module.exports = placementOrchestrator;
