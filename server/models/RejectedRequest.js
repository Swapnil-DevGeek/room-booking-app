const mongoose = require('mongoose');
const RejectedRequestSchema = new mongoose.Schema({
  reservation_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation', required: true },
  reject_reason: { type: String, required: true }, // Admin provided reason
}, { timestamps: true });

const RejectedRequest = mongoose.models.RejectedRequest || mongoose.model('RejectedRequest', RejectedRequestSchema);

module.exports = {RejectedRequest};