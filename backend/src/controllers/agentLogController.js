const AgentLog = require("../models/agentLog");

exports.getAllLogs = async (req, res, next) => {
  try {
    const { agent, eventType, status, limit = 100 } = req.query;
    const filter = {};
    if (agent) filter.agent = agent;
    if (eventType) filter.eventType = eventType;
    if (status) filter.status = status;

    const logs = await AgentLog.find(filter)
      .sort({ timestamp: -1 })
      .limit(Number(limit));

    return res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    next(error);
  }
};

exports.getLogByEventId = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const log = await AgentLog.findOne({ eventId });
    if (!log) {
      return res.status(404).json({ success: false, message: `Log ${eventId} not found` });
    }
    return res.status(200).json({ success: true, data: log });
  } catch (error) {
    next(error);
  }
};
