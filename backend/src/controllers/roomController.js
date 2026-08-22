const Room = require("../models/room");

exports.getAllRooms = async (req, res, next) => {
  try {
    const { type, status } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;

    const rooms = await Room.find(filter).sort({ roomName: 1 });
    return res.status(200).json({ success: true, count: rooms.length, data: rooms });
  } catch (error) {
    next(error);
  }
};

exports.getRoomById = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.status(404).json({ success: false, message: `Room ${roomId} not found` });
    }
    return res.status(200).json({ success: true, data: room });
  } catch (error) {
    next(error);
  }
};

exports.createRoom = async (req, res, next) => {
  try {
    const room = await Room.create(req.body);
    return res.status(201).json({ success: true, message: "Room added successfully", data: room });
  } catch (error) {
    next(error);
  }
};

exports.updateRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findOneAndUpdate({ roomId }, req.body, { new: true, runValidators: true });
    if (!room) {
      return res.status(404).json({ success: false, message: `Room ${roomId} not found` });
    }
    return res.status(200).json({ success: true, message: "Room updated successfully", data: room });
  } catch (error) {
    next(error);
  }
};
