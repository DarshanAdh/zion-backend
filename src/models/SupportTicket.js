const mongoose = require('mongoose');

const SupportTicketSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  ticketNumber: { type: String, unique: true, required: true, index: true },
  subject: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  category: { type: String, enum: ['tracking', 'billing', 'damage', 'other'], default: 'other' },
  relatedTrackingNumber: { type: String, trim: true },
  status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SupportTicket', SupportTicketSchema);
