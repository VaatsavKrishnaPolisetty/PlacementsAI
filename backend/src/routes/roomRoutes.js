const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");

router.get("/", roomController.getAllRooms);
router.post("/", roomController.createRoom);
router.get("/:roomId", roomController.getRoomById);
router.patch("/:roomId", roomController.updateRoom);

module.exports = router;
