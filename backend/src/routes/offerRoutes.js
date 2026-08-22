const express = require("express");
const router = express.Router();
const offerController = require("../controllers/offerController");

router.get("/", offerController.getAllOffers);
router.post("/", offerController.createOffer);
router.get("/:offerId", offerController.getOfferById);
router.get("/student/:studentId", offerController.getOffersByStudent);
router.patch("/:offerId/accept", offerController.acceptOffer);
router.post("/:offerId/accept", offerController.acceptOffer);
router.patch("/:offerId/reject", offerController.rejectOffer);
router.post("/:offerId/reject", offerController.rejectOffer);

module.exports = router;
