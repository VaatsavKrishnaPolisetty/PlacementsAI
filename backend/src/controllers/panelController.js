const Panel = require("../models/panel");

exports.getAllPanels = async (req, res, next) => {
  try {
    const { companyId, status } = req.query;
    const filter = {};
    if (companyId) filter.companyId = companyId;
    if (status) filter.status = status;

    const panels = await Panel.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: panels.length, data: panels });
  } catch (error) {
    next(error);
  }
};

exports.getPanelById = async (req, res, next) => {
  try {
    const { panelId } = req.params;
    const panel = await Panel.findOne({ panelId });
    if (!panel) {
      return res.status(404).json({ success: false, message: `Panel ${panelId} not found` });
    }
    return res.status(200).json({ success: true, data: panel });
  } catch (error) {
    next(error);
  }
};

exports.createPanel = async (req, res, next) => {
  try {
    const panel = await Panel.create(req.body);
    return res.status(201).json({ success: true, message: "Panel registered successfully", data: panel });
  } catch (error) {
    next(error);
  }
};

exports.updatePanel = async (req, res, next) => {
  try {
    const { panelId } = req.params;
    const panel = await Panel.findOneAndUpdate({ panelId }, req.body, { new: true, runValidators: true });
    if (!panel) {
      return res.status(404).json({ success: false, message: `Panel ${panelId} not found` });
    }
    return res.status(200).json({ success: true, message: "Panel updated successfully", data: panel });
  } catch (error) {
    next(error);
  }
};
