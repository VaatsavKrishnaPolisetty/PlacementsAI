const Company = require("../models/company");

exports.getAllCompanies = async (req, res, next) => {
  try {
    const companies = await Company.find().sort({ companyName: 1 });
    return res.status(200).json({ success: true, count: companies.length, data: companies });
  } catch (error) {
    next(error);
  }
};

exports.getCompanyById = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const company = await Company.findOne({ companyId });
    if (!company) {
      return res.status(404).json({ success: false, message: `Company ${companyId} not found` });
    }
    return res.status(200).json({ success: true, data: company });
  } catch (error) {
    next(error);
  }
};

exports.createCompany = async (req, res, next) => {
  try {
    const company = await Company.create(req.body);
    return res.status(201).json({ success: true, message: "Company created successfully", data: company });
  } catch (error) {
    next(error);
  }
};

exports.updateCompany = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const company = await Company.findOneAndUpdate({ companyId }, req.body, { new: true, runValidators: true });
    if (!company) {
      return res.status(404).json({ success: false, message: `Company ${companyId} not found` });
    }
    return res.status(200).json({ success: true, message: "Company updated successfully", data: company });
  } catch (error) {
    next(error);
  }
};
