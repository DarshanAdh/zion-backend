const mongoose = require('mongoose');

const ShipmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  trackingNumber: { type: String, unique: true, index: true, required: true },
  status: {
    type: String,
    enum: ['created', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'returned', 'cancelled'],
    default: 'created'
  },
  service: { type: String, enum: ['standard', 'express', 'overnight'], required: true },
  price: { type: Number, required: true },
  estimatedDelivery: { type: Date, required: true },
  sender: {
    firstName: String,
    lastName: String,
    street: String,
    city: String,
    state: String,
    zip: String,
    phone: String
  },
  recipient: {
    firstName: String,
    lastName: String,
    street: String,
    city: String,
    state: String,
    zip: String,
    phone: String
  },
  package: {
    type: { type: String },
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    declaredValue: Number,
    instructions: String
  },
  timeline: [
    {
      status: String,
      description: String,
      location: String,
      timestamp: { type: Date, default: Date.now }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Shipment', ShipmentSchema);
