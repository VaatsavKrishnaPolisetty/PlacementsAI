const express = require("express");
const router = express.Router();
const companyController = require("../controllers/companyController");

router.get("/", companyController.getAllCompanies);
router.post("/", companyController.createCompany);
router.get("/:companyId", companyController.getCompanyById);
router.patch("/:companyId", companyController.updateCompany);

module.exports = router;
