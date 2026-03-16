const mongoose = require('mongoose');

const PickupSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  address: { type: String, required: true, trim: true },
  date: { type: String, required: true, trim: true },
  timeWindow: { type: String, trim: true },
  packageCount: { type: Number, default: 1 },
  totalWeight: { type: Number, default: 0 },
  instructions: { type: String, trim: true },
  status: { type: String, enum: ['scheduled', 'confirmed', 'completed', 'cancelled'], default: 'scheduled' },
  confirmationCode: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Pickup', PickupSchema);
