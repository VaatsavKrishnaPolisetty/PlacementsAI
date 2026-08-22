const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const uploadController = require("../controllers/uploadController");

router.post("/resume", upload.single("resume"), uploadController.uploadResume);
router.post("/jd", upload.single("jd"), uploadController.uploadJobDescription);

module.exports = router;
