const Job = require("../models/jobs");
const eventBus = require("../events/eventBus");
const EventTypes = require("../events/eventTypes");

exports.getAllJobs = async (req, res, next) => {
  try {
    const { companyId, status, role } = req.query;
    const filter = {};
    if (companyId) filter.companyId = companyId;
    if (status) filter.status = status;
    if (role) filter.role = new RegExp(role, "i");

    const jobs = await Job.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: jobs.length, data: jobs });
  } catch (error) {
    next(error);
  }
};

exports.getJobById = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findOne({ jobId });
    if (!job) {
      return res.status(404).json({ success: false, message: `Job ${jobId} not found` });
    }
    return res.status(200).json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
};

exports.createJob = async (req, res, next) => {
  try {
    const job = await Job.create(req.body);

    // Publish JOB_CREATED event to trigger multi-agent pipeline
    await eventBus.publish(EventTypes.JOB_CREATED, {
      source: "JobService",
      message: `New Job created: ${job.role} (Job ID: ${job.jobId})`,
      entity: { jobId: job.jobId, companyId: job.companyId },
      payload: { role: job.role, requirements: job.requirements, openings: job.openings },
    });

    return res.status(201).json({ success: true, message: "Job created and workflow initiated", data: job });
  } catch (error) {
    next(error);
  }
};

exports.updateJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findOneAndUpdate({ jobId }, req.body, { new: true, runValidators: true });
    if (!job) {
      return res.status(404).json({ success: false, message: `Job ${jobId} not found` });
    }
    return res.status(200).json({ success: true, message: "Job updated successfully", data: job });
  } catch (error) {
    next(error);
  }
};

exports.parseJobDescription = async (req, res, next) => {
  try {
    const { text, rawText, companyId = "COMP_GENERIC", role: fallbackRole } = req.body;
    const jdText = text || rawText || "";

    if (!jdText || typeof jdText !== "string") {
      return res.status(400).json({ success: false, message: "Job description text is required" });
    }

    let parsedData = null;
    const aiServiceUrl = process.env.AI_SERVICE_URL || "http://localhost:8000";

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const aiRes = await fetch(`${aiServiceUrl}/api/jd/parse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: jdText }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (aiRes.ok) {
        const json = await aiRes.json();
        if (json.success && json.data) {
          parsedData = json.data;
        }
      }
    } catch {
      // Fallback native deterministic parser
    }

    if (!parsedData) {
      // Deterministic regex parser fallback
      const roleMatch = jdText.match(/role[:\s]+([^\n\r,]+)/i);
      const cgpaMatch = jdText.match(/(?:cgpa|gpa|cutoff)[:\s>=]+([0-9.]+)/i);
      const backlogsMatch = jdText.match(/(?:backlogs?|arrears?)[:\s<=]+([0-9]+)|no\s+backlogs?/i);
      const branchMatch = jdText.match(/(?:branches?|eligible\s+branches?)[:\s]+([^\n\r]+)/i);

      parsedData = {
        role: roleMatch ? roleMatch[1].trim() : (fallbackRole || "Software Development Engineer"),
        minimum_cgpa: cgpaMatch ? parseFloat(cgpaMatch[1]) : 7.0,
        allowed_branches: branchMatch ? branchMatch[1].split(/[/,\s]+/).filter(Boolean).map(b => b.toLowerCase()) : ["cse", "it", "ece"],
        maximum_backlogs: backlogsMatch ? (backlogsMatch[0].toLowerCase().includes("no") ? 0 : parseInt(backlogsMatch[1], 10)) : 0,
        mandatory_skills: ["python", "javascript", "sql", "react", "node.js"].filter(s => jdText.toLowerCase().includes(s)),
        preferred_skills: ["aws", "docker", "redis", "typescript"].filter(s => jdText.toLowerCase().includes(s)),
        source_text: jdText,
      };
      if (parsedData.mandatory_skills.length === 0) {
        parsedData.mandatory_skills = ["python", "sql", "data structures"];
      }
    }

    const jobId = req.params.jobId || `JOB_${Date.now()}`;
    const mappedRequirements = {
      minCGPA: parsedData.minimum_cgpa ?? parsedData.minCGPA ?? 7.0,
      branches: parsedData.allowed_branches ?? parsedData.branches ?? ["cse", "it"],
      graduationYear: parsedData.graduation_year ?? 2026,
      maxBacklogs: parsedData.maximum_backlogs ?? parsedData.maxBacklogs ?? 0,
      requiredSkills: parsedData.mandatory_skills ?? parsedData.requiredSkills ?? [],
      preferredSkills: parsedData.preferred_skills ?? parsedData.preferredSkills ?? [],
    };

    const finalRole = parsedData.role || fallbackRole || "Software Engineer";

    const jobDoc = await Job.findOneAndUpdate(
      { jobId },
      {
        jobId,
        companyId,
        role: finalRole,
        description: jdText,
        requirements: mappedRequirements,
        rawJDText: jdText,
        status: "active",
      },
      { upsert: true, new: true }
    );

    // Emit JD_PARSED event
    await eventBus.publish(EventTypes.JD_PARSED, {
      source: "JDParserAgent",
      message: `Parsed requirements for Job ${jobId} (${finalRole})`,
      entity: { jobId, companyId },
      payload: { role: finalRole, requirements: mappedRequirements },
    });

    return res.status(200).json({
      success: true,
      message: "Job description parsed and requirements structured",
      data: {
        job: jobDoc,
        extractedRequirements: mappedRequirements,
      },
    });
  } catch (error) {
    next(error);
  }
};

