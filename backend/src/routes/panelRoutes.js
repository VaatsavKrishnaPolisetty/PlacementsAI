const express = require("express");
const router = express.Router();
const panelController = require("../controllers/panelController");

router.get("/", panelController.getAllPanels);
router.post("/", panelController.createPanel);
router.get("/:panelId", panelController.getPanelById);
router.patch("/:panelId", panelController.updatePanel);

module.exports = router;
