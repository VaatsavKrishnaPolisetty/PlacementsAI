const Offer = require("../models/offer");
const Company = require("../models/company");
const Job = require("../models/jobs");
const eventBus = require("../events/eventBus");
const EventTypes = require("../events/eventTypes");

exports.getAllOffers = async (req, res, next) => {
  try {
    const { studentId, jobId, companyId, status } = req.query;
    const filter = {};
    if (studentId) filter.studentId = studentId;
    if (jobId) filter.jobId = jobId;
    if (companyId) filter.companyId = companyId;
    if (status) filter.status = status;

    const offers = await Offer.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: offers.length, data: offers });
  } catch (error) {
    next(error);
  }
};

exports.getOfferById = async (req, res, next) => {
  try {
    const { offerId } = req.params;
    const offer = await Offer.findOne({ offerId });
    if (!offer) {
      return res.status(404).json({ success: false, message: `Offer ${offerId} not found` });
    }
    return res.status(200).json({ success: true, data: offer });
  } catch (error) {
    next(error);
  }
};

exports.getOffersByStudent = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const offers = await Offer.find({ studentId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: offers.length, data: offers });
  } catch (error) {
    next(error);
  }
};

exports.createOffer = async (req, res, next) => {
  try {
    const offer = await Offer.create(req.body);
    const company = await Company.findOne({ companyId: offer.companyId });
    const job = await Job.findOne({ jobId: offer.jobId });

    // Publish OFFER_RECEIVED event
    await eventBus.publish(EventTypes.OFFER_RECEIVED, {
      source: "OfferService",
      message: `New Offer extended to student ${offer.studentId} by ${company?.companyName || offer.companyId}`,
      entity: {
        offerId: offer.offerId,
        studentId: offer.studentId,
        jobId: offer.jobId,
        companyId: offer.companyId,
      },
      payload: {
        companyName: company?.companyName || "Company",
        role: job?.role || "Position",
        packageDetails: offer.packageDetails,
      },
    });

    return res.status(201).json({ success: true, message: "Offer created successfully", data: offer });
  } catch (error) {
    next(error);
  }
};

exports.acceptOffer = async (req, res, next) => {
  try {
    const { offerId } = req.params;
    const offer = await Offer.findOne({ offerId });
    if (!offer) {
      return res.status(404).json({ success: false, message: `Offer ${offerId} not found` });
    }

    offer.status = "accepted";
    offer.acceptedAt = new Date();
    await offer.save();

    const company = await Company.findOne({ companyId: offer.companyId });

    // Publish OFFER_ACCEPTED event which triggers PlacementOrchestrator's cascade rematching
    await eventBus.publish(EventTypes.OFFER_ACCEPTED, {
      source: "OfferService",
      message: `Student ${offer.studentId} accepted offer ${offer.offerId} for Job ${offer.jobId}`,
      entity: {
        offerId: offer.offerId,
        studentId: offer.studentId,
        jobId: offer.jobId,
        companyId: offer.companyId,
      },
      payload: {
        companyName: company?.companyName || "Company",
        acceptedAt: offer.acceptedAt,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Offer accepted successfully. Dynamic rematching & cascade workflow initiated.",
      data: offer,
    });
  } catch (error) {
    next(error);
  }
};

exports.rejectOffer = async (req, res, next) => {
  try {
    const { offerId } = req.params;
    const offer = await Offer.findOne({ offerId });
    if (!offer) {
      return res.status(404).json({ success: false, message: `Offer ${offerId} not found` });
    }

    offer.status = "rejected";
    offer.rejectedAt = new Date();
    offer.notes = req.body.notes || "Declined by candidate";
    await offer.save();

    await eventBus.publish(EventTypes.OFFER_REJECTED, {
      source: "OfferService",
      message: `Student ${offer.studentId} rejected offer ${offer.offerId}`,
      entity: {
        offerId: offer.offerId,
        studentId: offer.studentId,
        jobId: offer.jobId,
      },
      payload: { notes: offer.notes },
    });

    return res.status(200).json({ success: true, message: "Offer rejected", data: offer });
  } catch (error) {
    next(error);
  }
};
