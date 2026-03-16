const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: ['full_service', 'drop_off', 'locker'], required: true },
  address: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  zip: { type: String, required: true, trim: true },
  phone: { type: String, trim: true },
  hours: { type: String, trim: true },
  services: [{ type: String }]
});

module.exports = mongoose.model('Location', LocationSchema);
