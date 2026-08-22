import mongoose from 'mongoose'

const slot = new mongoose.Schema({ date: String, startTime: String, endTime: String, panelId: String, roomId: String, score: Number, reason: String }, { _id: false })
export const Schedule = mongoose.model('Schedule', new mongoose.Schema({ eventId: String, studentId: String, studentName: String, company: String, panelId: String, panelName: String, roomId: String, roomName: String, date: String, startTime: String, endTime: String, status: String, meetingLink: String }, { timestamps: true }))
export const Negotiation = mongoose.model('Negotiation', new mongoose.Schema({ id: String, scheduleId: String, studentId: String, studentName: String, requestedBy: String, reason: String, description: String, currentSlot: Object, suggestedSlots: [slot], recommendedSlot: slot, aiReasoning: String, status: String, approvedBy: String }, { timestamps: true }))
export const Event = mongoose.model('Event', new mongoose.Schema({ companyId: String, company: String, title: String, eventType: String, date: String, startTime: String, endTime: String, duration: Number, status: String }))
export const Panel = mongoose.model('Panel', new mongoose.Schema({ name: String, members: [String], unavailable: [slot] }))
export const Room = mongoose.model('Room', new mongoose.Schema({ name: String, building: String, capacity: Number, unavailable: [slot] }))
export const Notification = mongoose.model('Notification', new mongoose.Schema({ recipientId: String, recipientType: String, title: String, message: String, type: String, read: Boolean }, { timestamps: true }))
