const express = require('express');
const { body, param } = require('express-validator');
const Shipment = require('../models/Shipment');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.get('/:trackingNumber', async (req, res, next) => {
  try {
    const shipment = await Shipment.findOne({ trackingNumber: req.params.trackingNumber });
    if (!shipment) return res.status(404).json({ error: 'Tracking number not found' });

    return res.json({
      tracking: {
        trackingNumber: shipment.trackingNumber,
        status: shipment.status,
        service: shipment.service,
        estimatedDelivery: shipment.estimatedDelivery,
        sender: { city: shipment.sender.city, state: shipment.sender.state },
        recipient: { city: shipment.recipient.city, state: shipment.recipient.state },
        timeline: shipment.timeline
      }
    });
  } catch (err) {
    return next(err);
  }
});

router.post(
  '/:id/update',
  auth,
  [
    param('id').isMongoId().withMessage('Invalid shipment id'),
    body('status').optional().isIn([
      'created',
      'picked_up',
      'in_transit',
      'out_for_delivery',
      'delivered',
      'failed',
      'returned',
      'cancelled'
    ]),
    body('description').notEmpty(),
    body('location').notEmpty()
  ],
  validate,
  async (req, res, next) => {
    try {
      const shipment = await Shipment.findById(req.params.id);
      if (!shipment) return res.status(404).json({ error: 'Shipment not found' });

      const { status, description, location } = req.body;
      if (status) shipment.status = status;
      shipment.timeline.push({ status: status || shipment.status, description, location });
      await shipment.save();

      return res.json({ shipment });
    } catch (err) {
      return next(err);
    }
  }
);

router.patch(
  '/:id/manage',
  auth,
  [
    param('id').isMongoId().withMessage('Invalid shipment id'),
    body('action').isIn(['redirect', 'hold', 'release']),
    body('newAddress').optional().isString()
  ],
  validate,
  async (req, res, next) => {
    try {
      const shipment = await Shipment.findById(req.params.id);
      if (!shipment) return res.status(404).json({ error: 'Shipment not found' });

      const { action, newAddress } = req.body;

      if (action === 'redirect') {
        if (!newAddress) return res.status(400).json({ error: 'newAddress is required for redirect' });
        shipment.recipient.street = newAddress;
        shipment.timeline.push({
          status: shipment.status,
          description: 'Delivery redirected to a new address',
          location: `${shipment.recipient.city}, ${shipment.recipient.state}`
        });
      } else if (action === 'hold') {
        shipment.timeline.push({
          status: shipment.status,
          description: 'Package put on hold',
          location: `${shipment.recipient.city}, ${shipment.recipient.state}`
        });
      } else {
        shipment.timeline.push({
          status: shipment.status,
          description: 'Package released from hold',
          location: `${shipment.recipient.city}, ${shipment.recipient.state}`
        });
      }

      await shipment.save();
      return res.json({ shipment });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
