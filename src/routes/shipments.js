const express = require('express');
const { body, param } = require('express-validator');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const Shipment = require('../models/Shipment');
const { generateTrackingNumber } = require('../utils/generateTracking');
const { calculatePrice, calculateAllPrices } = require('../utils/priceCalculator');

const router = express.Router();

router.use(auth);

async function uniqueTrackingNumber() {
  for (let i = 0; i < 8; i += 1) {
    const candidate = generateTrackingNumber();
    const exists = await Shipment.exists({ trackingNumber: candidate });
    if (!exists) return candidate;
  }
  throw new Error('Unable to generate unique tracking number');
}

function estimateDeliveryDate(service) {
  const date = new Date();
  const days = service === 'overnight' ? 1 : service === 'express' ? 2 : 5;
  date.setDate(date.getDate() + days);
  return date;
}

router.post(
  '/calculate',
  [
    body('weight').isFloat({ gt: 0 }).withMessage('weight must be greater than 0'),
    body('serviceType').optional().isIn(['standard', 'express', 'overnight'])
  ],
  validate,
  async (req, res) => {
    const { weight } = req.body;
    return res.json({ prices: calculateAllPrices(weight) });
  }
);

router.post(
  '/',
  [
    body('sender.firstName').notEmpty(),
    body('sender.lastName').notEmpty(),
    body('sender.street').notEmpty(),
    body('sender.city').notEmpty(),
    body('sender.state').notEmpty(),
    body('sender.zip').notEmpty(),
    body('sender.phone').notEmpty(),
    body('recipient.firstName').notEmpty(),
    body('recipient.lastName').notEmpty(),
    body('recipient.street').notEmpty(),
    body('recipient.city').notEmpty(),
    body('recipient.state').notEmpty(),
    body('recipient.zip').notEmpty(),
    body('recipient.phone').notEmpty(),
    body('package.weight').isFloat({ gt: 0 }),
    body('service.type').isIn(['standard', 'express', 'overnight'])
  ],
  validate,
  async (req, res, next) => {
    try {
      const service = req.body.service.type;
      const trackingNumber = await uniqueTrackingNumber();
      const price = calculatePrice(req.body.package.weight, service);
      const estimatedDelivery = estimateDeliveryDate(service);

      const shipment = await Shipment.create({
        userId: req.user._id,
        trackingNumber,
        service,
        price,
        estimatedDelivery,
        sender: req.body.sender,
        recipient: req.body.recipient,
        package: req.body.package,
        timeline: [
          {
            status: 'created',
            description: 'Shipment created',
            location: `${req.body.sender.city}, ${req.body.sender.state}`
          }
        ]
      });

      return res.status(201).json({
        shipment: {
          _id: shipment._id,
          trackingNumber: shipment.trackingNumber,
          status: shipment.status,
          price: shipment.price,
          estimatedDelivery: shipment.estimatedDelivery,
          createdAt: shipment.createdAt
        }
      });
    } catch (err) {
      return next(err);
    }
  }
);

router.get('/', async (req, res, next) => {
  try {
    const shipments = await Shipment.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.json({ shipments });
  } catch (err) {
    return next(err);
  }
});

router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid shipment id')],
  validate,
  async (req, res, next) => {
    try {
      const shipment = await Shipment.findById(req.params.id);
      if (!shipment) return res.status(404).json({ error: 'Shipment not found' });
      if (String(shipment.userId) !== String(req.user._id)) return res.status(403).json({ error: 'Forbidden' });
      return res.json({ shipment });
    } catch (err) {
      return next(err);
    }
  }
);

router.patch(
  '/:id/cancel',
  [param('id').isMongoId().withMessage('Invalid shipment id')],
  validate,
  async (req, res, next) => {
    try {
      const shipment = await Shipment.findById(req.params.id);
      if (!shipment) return res.status(404).json({ error: 'Shipment not found' });
      if (String(shipment.userId) !== String(req.user._id)) return res.status(403).json({ error: 'Forbidden' });

      if (!['created', 'picked_up'].includes(shipment.status)) {
        return res.status(400).json({ error: 'Shipment cannot be cancelled at this stage' });
      }

      shipment.status = 'cancelled';
      shipment.timeline.push({
        status: 'cancelled',
        description: 'Shipment cancelled by user',
        location: `${shipment.sender.city}, ${shipment.sender.state}`
      });
      await shipment.save();

      return res.json({ shipment });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
