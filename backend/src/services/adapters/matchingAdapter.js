const Student = require("../../models/student");
const Job = require("../../models/jobs");
const Resume = require("../../models/resume");
const Match = require("../../models/match");
const Application = require("../../models/application");
const ReadinessPlan = require("../../models/readinessPlan");
const eventBus = require("../../events/eventBus");
const EventTypes = require("../../events/eventTypes");

const matchingService = require("../matchingService");

class MatchingAdapter {
  constructor() {
    this.externalMatchingProvider = null;
    this.externalReadinessProvider = null;
  }

  /**
   * Allows Member 3 to plug in their Candidate Matching & Explainability Engine
   */
  registerMatchingProvider(providerFn) {
    if (typeof providerFn === "function") {
      this.externalMatchingProvider = providerFn;
      console.log("🔌 External Matching Provider registered from Member 3");
    }
  }

  /**
   * Allows Member 3 to plug in their Skill Gap & Readiness Coach Engine
   */
  registerReadinessProvider(providerFn) {
    if (typeof providerFn === "function") {
      this.externalReadinessProvider = providerFn;
      console.log("🔌 External Readiness Provider registered from Member 3");
    }
  }

  /**
   * Run candidate matching for all eligible candidates for a job.
   */
  async runMatching(jobId, customWeights = null) {
    const job = await Job.findOne({ jobId });
    if (!job) throw new Error(`Job ${jobId} not found`);

    await eventBus.publish(EventTypes.MATCHING_STARTED, {
      source: "MatchingAgent",
      message: `Candidate matching initiated for Job ${jobId} (${job.role})`,
      entity: { jobId },
    });

    if (this.externalMatchingProvider) {
      try {
        const externalResults = await this.externalMatchingProvider(jobId);
        return externalResults;
      } catch (err) {
        console.warn("⚠️ External matching provider failed, using fallback:", err.message);
      }
    }

    // Find eligible applications for this job
    let eligibleApps = await Application.find({ jobId, status: { $in: ["eligible", "shortlisted", "applied"] } });
    let studentIds = eligibleApps.map((a) => a.studentId);

    if (studentIds.length === 0) {
      const allStudents = await Student.find({ placementStatus: { $ne: "placed" } });
      studentIds = allStudents.map((s) => s.studentId);
    }

    const matches = [];

    for (const studentId of studentIds) {
      const student = await Student.findOne({ studentId });
      if (!student) continue;

      const resume = await Resume.findOne({ studentId }).sort({ version: -1 });

      const evaluation = matchingService.evaluateCandidateMatch(
        student,
        job,
        resume,
        customWeights || matchingService.DEFAULT_MATCH_WEIGHTS
      );

      const matchId = `MATCH_${studentId}_${jobId}`;
      const matchDoc = await Match.findOneAndUpdate(
        { studentId, jobId },
        {
          matchId,
          studentId,
          jobId,
          matchScore: evaluation.matchScore,
          breakdown: evaluation.breakdown,
          matchedSkills: evaluation.matchedSkills,
          skillGaps: evaluation.skillGaps,
          partialSkills: evaluation.partialSkills,
          assessments: evaluation.assessments,
          evidence: {
            resumeId: resume?.resumeId || "N/A",
            cgpa: student?.cgpa,
            projectsCount: (student?.projects || resume?.structuredExtraction?.projects || []).length,
            details: evaluation.evidence,
          },
          explanation: evaluation.explanation,
          recommendation: evaluation.recommendation,
          readinessScore: evaluation.readinessScore,
          generatedAt: new Date(),
        },
        { upsert: true, new: true }
      );

      // Automatically generate 3-day Readiness Plan
      await this.generateReadinessPlan(studentId, jobId, evaluation.skillGaps, job.role);

      // If score is >= 65, mark application as shortlisted
      if (evaluation.matchScore >= 65) {
        await Application.findOneAndUpdate(
          { studentId, jobId },
          {
            status: "shortlisted",
            $push: {
              statusHistory: {
                status: "shortlisted",
                changedAt: new Date(),
                changedBy: "MatchingAgent",
                reason: `Match score ${evaluation.matchScore}% exceeded threshold. ${evaluation.explanation}`,
              },
            },
          }
        );

        await eventBus.publish(EventTypes.CANDIDATE_SHORTLISTED, {
          source: "MatchingAgent",
          message: `Candidate ${studentId} shortlisted for Job ${jobId} with score ${evaluation.matchScore}%`,
          entity: { studentId, jobId },
          payload: { matchScore: evaluation.matchScore, role: job.role },
        });
      }

      matches.push(matchDoc);
    }

    // Sort descending by matchScore
    matches.sort((a, b) => b.matchScore - a.matchScore);

    await eventBus.publish(EventTypes.MATCHING_COMPLETED, {
      source: "MatchingAgent",
      message: `Candidate matching completed for Job ${jobId}. Evaluated: ${matches.length} candidates.`,
      entity: { jobId },
      payload: {
        totalMatched: matches.length,
        shortlistedCount: matches.filter((m) => m.matchScore >= 65).length,
        topScore: matches[0]?.matchScore || 0,
      },
    });

    return matches;
  }


  /**
   * Retrieve match for a single candidate & job
   */
  async getMatch(jobId, studentId) {
    let match = await Match.findOne({ jobId, studentId });
    if (!match) {
      // Generate on-demand if missing
      await this.runMatching(jobId);
      match = await Match.findOne({ jobId, studentId });
    }
    return match;
  }

  /**
   * Generate Skill Gap & Readiness Plan
   */
  async generateReadinessPlan(studentId, jobId, skillGaps = [], targetRole = "") {
    if (this.externalReadinessProvider) {
      try {
        return await this.externalReadinessProvider(studentId, jobId);
      } catch (err) {
        console.warn("⚠️ External readiness provider failed, using fallback:", err.message);
      }
    }

    const recommendations = skillGaps.map((skill) => ({
      topic: `Mastering ${skill} for ${targetRole || "technical interviews"}`,
      resourceUrl: `https://learn.placement.internal/topics/${encodeURIComponent(skill.toLowerCase())}`,
      estimatedHours: 6,
      priority: "high",
    }));

    const planId = `PLAN_${studentId}_${jobId}`;
    const plan = await ReadinessPlan.findOneAndUpdate(
      { studentId, jobId },
      {
        planId,
        studentId,
        jobId,
        targetRole,
        skillGaps,
        recommendations,
        readinessScore: Math.max(30, 100 - skillGaps.length * 15),
        status: "active",
        generatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    await eventBus.publish(EventTypes.READINESS_PLAN_CREATED, {
      source: "ReadinessAgent",
      message: `Readiness plan created for student ${studentId} targeting ${targetRole}`,
      entity: { studentId, jobId },
      payload: { targetRole, skillGapsCount: skillGaps.length },
    });

    return plan;
  }
}

const matchingAdapter = new MatchingAdapter();
module.exports = matchingAdapter;
