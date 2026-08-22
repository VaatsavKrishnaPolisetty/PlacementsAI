const Student = require("../models/student");
const Job = require("../models/jobs");
const Company = require("../models/company");
const Application = require("../models/application");
const Interview = require("../models/interview");
const Offer = require("../models/offer");
const Match = require("../models/match");
const AgentLog = require("../models/agentLog");
const schedulingAdapter = require("../services/adapters/schedulingAdapter");

exports.getPlacementAnalytics = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    // Counts
    const totalStudents = await Student.countDocuments();
    const placedStudents = await Student.countDocuments({ placementStatus: "placed" });
    const availableStudents = await Student.countDocuments({ placementStatus: "available" });
    const totalCompanies = await Company.countDocuments();
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ status: "active" });

    // Application funnels
    const totalApplications = await Application.countDocuments();
    const eligibleApplications = await Application.countDocuments({
      status: { $in: ["eligible", "shortlisted", "interview_scheduled", "selected", "offer_received", "offer_accepted"] },
    });
    const shortlistedApplications = await Application.countDocuments({
      status: { $in: ["shortlisted", "interview_scheduled", "selected", "offer_received", "offer_accepted"] },
    });

    // Interviews
    const interviewsToday = await Interview.countDocuments({ date: today });
    const scheduledInterviews = await Interview.countDocuments({ status: "scheduled" });
    const completedInterviews = await Interview.countDocuments({ status: "completed" });
    const rescheduledInterviews = await Interview.countDocuments({ status: "rescheduled" });
    const cancelledInterviews = await Interview.countDocuments({ status: "cancelled" });

    // Offers
    const offersReceived = await Offer.countDocuments();
    const offersAccepted = await Offer.countDocuments({ status: "accepted" });
    const offersPending = await Offer.countDocuments({ status: "pending" });
    const offersRejected = await Offer.countDocuments({ status: "rejected" });

    // Conflicts
    const conflictCheck = await schedulingAdapter.detectConflicts();
    const activeConflicts = conflictCheck.totalConflicts || 0;
    const resolvedConflictsCount = await AgentLog.countDocuments({ eventType: "CONFLICT_RESOLVED" });

    // Skill gaps aggregation
    const matches = await Match.find({}, { skillGaps: 1 });
    const skillGapFrequency = {};
    matches.forEach((m) => {
      (m.skillGaps || []).forEach((skill) => {
        skillGapFrequency[skill] = (skillGapFrequency[skill] || 0) + 1;
      });
    });

    const sortedSkillGaps = Object.entries(skillGapFrequency)
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Pending TPO Actions
    const pendingTpoLogs = await AgentLog.find({ status: "pending_approval" }).sort({ timestamp: -1 });

    return res.status(200).json({
      success: true,
      data: {
        students: {
          total: totalStudents,
          placed: placedStudents,
          available: availableStudents,
          placementRatePercentage:
            totalStudents > 0 ? Math.round((placedStudents / totalStudents) * 100) : 0,
        },
        jobsAndCompanies: {
          companies: totalCompanies,
          jobsTotal: totalJobs,
          jobsActive: activeJobs,
        },
        applications: {
          total: totalApplications,
          eligible: eligibleApplications,
          shortlisted: shortlistedApplications,
        },
        interviews: {
          today: interviewsToday,
          scheduled: scheduledInterviews,
          completed: completedInterviews,
          rescheduled: rescheduledInterviews,
          cancelled: cancelledInterviews,
        },
        offers: {
          totalReceived: offersReceived,
          accepted: offersAccepted,
          pending: offersPending,
          rejected: offersRejected,
          acceptanceRatePercentage:
            offersReceived > 0 ? Math.round((offersAccepted / offersReceived) * 100) : 0,
        },
        conflicts: {
          active: activeConflicts,
          resolved: resolvedConflictsCount,
        },
        topSkillGaps: sortedSkillGaps,
        pendingTPOActions: {
          count: pendingTpoLogs.length,
          actions: pendingTpoLogs,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
