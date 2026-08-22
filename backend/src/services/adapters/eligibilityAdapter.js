const Student = require("../../models/student");
const Job = require("../../models/jobs");
const EligibilityResult = require("../../models/eligibilityResult");
const Application = require("../../models/application");
const eventBus = require("../../events/eventBus");
const EventTypes = require("../../events/eventTypes");

class EligibilityAdapter {
  constructor() {
    this.externalProvider = null;
  }

  /**
   * Allows Member 2 to plug in their custom AI Eligibility Agent module.
   */
  registerEligibilityProvider(providerFn) {
    if (typeof providerFn === "function") {
      this.externalProvider = providerFn;
      console.log("🔌 External Eligibility Provider registered from Member 2");
    }
  }

  /**
   * Check eligibility for a single student against a job.
   */
  async checkEligibility(studentId, jobId) {
    if (this.externalProvider) {
      try {
        return await this.externalProvider(studentId, jobId);
      } catch (err) {
        console.warn("⚠️ External eligibility provider failed, using fallback:", err.message);
      }
    }

    const student = await Student.findOne({ studentId });
    const job = await Job.findOne({ jobId });

    if (!student) throw new Error(`Student ${studentId} not found`);
    if (!job) throw new Error(`Job ${jobId} not found`);

    // Try calling Python AI service if available
    const aiServiceUrl = process.env.AI_SERVICE_URL || "http://localhost:8000";
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);
      const aiRes = await fetch(`${aiServiceUrl}/api/eligibility/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student: {
            studentId: student.studentId,
            name: student.name,
            cgpa: student.cgpa,
            branch: student.branch,
            graduationYear: student.graduationYear,
            backlogs: student.backlogs,
            skills: student.skills,
          },
          jobRequirements: {
            role: job.role,
            minCGPA: job.requirements?.minCGPA,
            branches: job.requirements?.branches,
            graduationYear: job.requirements?.graduationYear,
            maxBacklogs: job.requirements?.maxBacklogs,
            requiredSkills: job.requirements?.requiredSkills,
            preferredSkills: job.requirements?.preferredSkills,
          },
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (aiRes.ok) {
        const json = await aiRes.json();
        if (json.success && json.data) {
          const aiData = json.data;
          const resultId = `ELIG_${studentId}_${jobId}_${Date.now()}`;
          const resultDoc = await EligibilityResult.findOneAndUpdate(
            { studentId, jobId },
            {
              eligibilityResultId: resultId,
              studentId,
              jobId,
              eligible: aiData.eligible,
              reasons: aiData.reasons || [],
              failedCriteria: aiData.checks ? Object.keys(aiData.checks).filter(k => !aiData.checks[k]) : [],
              cgpaSatisfied: aiData.checks?.cgpa ?? true,
              branchSatisfied: aiData.checks?.branch ?? true,
              backlogsSatisfied: aiData.checks?.backlogs ?? true,
              checkedAt: new Date(),
            },
            { upsert: true, new: true }
          );
          return resultDoc;
        }
      }
    } catch {
      // Python service offline or timed out, seamlessly proceed to native logic
    }

    const reqs = job.requirements || {};
    const minCGPA = reqs.minCGPA !== undefined ? reqs.minCGPA : 0;
    const maxBacklogs = reqs.maxBacklogs !== undefined ? reqs.maxBacklogs : 0;
    const allowedBranches = reqs.branches || [];

    const cgpaSatisfied = (student.cgpa || 0) >= minCGPA;
    const backlogsSatisfied = (student.backlogs || 0) <= maxBacklogs;
    const branchSatisfied =
      allowedBranches.length === 0 ||
      allowedBranches.some(
        (b) => b.toLowerCase().trim() === (student.branch || "").toLowerCase().trim()
      );

    const failedCriteria = [];
    const reasons = [];

    if (!cgpaSatisfied) {
      failedCriteria.push("CGPA");
      reasons.push(`Student CGPA (${student.cgpa}) is below required minimum (${minCGPA})`);
    }
    if (!backlogsSatisfied) {
      failedCriteria.push("Backlogs");
      reasons.push(
        `Student has ${student.backlogs} backlogs, maximum allowed is ${maxBacklogs}`
      );
    }
    if (!branchSatisfied) {
      failedCriteria.push("Branch");
      reasons.push(`Branch '${student.branch}' is not in eligible branches: ${allowedBranches.join(", ")}`);
    }

    const eligible = cgpaSatisfied && backlogsSatisfied && branchSatisfied;
    if (eligible) {
      reasons.push("All academic criteria (CGPA, Branch, Backlogs) are met.");
    }

    const resultId = `ELIG_${studentId}_${jobId}_${Date.now()}`;
    const resultDoc = await EligibilityResult.findOneAndUpdate(
      { studentId, jobId },
      {
        eligibilityResultId: resultId,
        studentId,
        jobId,
        eligible,
        reasons,
        failedCriteria,
        cgpaSatisfied,
        branchSatisfied,
        backlogsSatisfied,
        checkedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    return resultDoc;
  }

  /**
   * Batch evaluate all applications or students for a job.
   */
  async checkBatchEligibility(jobId) {
    const job = await Job.findOne({ jobId });
    if (!job) throw new Error(`Job ${jobId} not found`);

    // Find all applications for this job or all students if open
    let applications = await Application.find({ jobId });
    if (applications.length === 0) {
      // Auto-create applications for available students
      const students = await Student.find({ placementStatus: { $ne: "placed" } });
      for (const st of students) {
        const appId = `APP_${st.studentId}_${jobId}`;
        await Application.findOneAndUpdate(
          { studentId: st.studentId, jobId },
          {
            applicationId: appId,
            studentId: st.studentId,
            jobId,
            status: "applied",
            appliedAt: new Date(),
          },
          { upsert: true }
        );
      }
      applications = await Application.find({ jobId });
    }

    const results = [];
    for (const app of applications) {
      const evalResult = await this.checkEligibility(app.studentId, jobId);
      const newStatus = evalResult.eligible ? "eligible" : "not_eligible";

      await Application.findOneAndUpdate(
        { applicationId: app.applicationId },
        {
          status: newStatus,
          $push: {
            statusHistory: {
              status: newStatus,
              changedAt: new Date(),
              changedBy: "EligibilityAgent",
              reason: evalResult.reasons.join("; "),
            },
          },
        }
      );

      results.push(evalResult);
    }

    // Publish event
    await eventBus.publish(EventTypes.ELIGIBILITY_COMPLETED, {
      source: "EligibilityAgent",
      message: `Batch eligibility check completed for Job ${jobId}. Total evaluated: ${results.length}, Eligible: ${results.filter((r) => r.eligible).length}`,
      entity: { jobId },
      payload: {
        totalEvaluated: results.length,
        eligibleCount: results.filter((r) => r.eligible).length,
        ineligibleCount: results.filter((r) => !r.eligible).length,
      },
    });

    return results;
  }
}

const eligibilityAdapter = new EligibilityAdapter();
module.exports = eligibilityAdapter;
