const express = require('express');
const { body, param } = require('express-validator');
const Pickup = require('../models/Pickup');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { generatePickupCode } = require('../utils/generateTracking');

const router = express.Router();

router.use(auth);

async function uniquePickupCode() {
  for (let i = 0; i < 8; i += 1) {
    const candidate = generatePickupCode();
    const exists = await Pickup.exists({ confirmationCode: candidate });
    if (!exists) return candidate;
  }
  throw new Error('Unable to generate pickup code');
}

router.post(
  '/',
  [
    body('address').notEmpty().withMessage('address is required'),
    body('date').notEmpty().withMessage('date is required'),
    body('timeWindow').optional().isString(),
    body('packageCount').optional().isInt({ min: 1 }),
    body('totalWeight').optional().isFloat({ min: 0 }),
    body('instructions').optional().isString()
  ],
  validate,
  async (req, res, next) => {
    try {
      const confirmationCode = await uniquePickupCode();
      const pickup = await Pickup.create({
        userId: req.user._id,
        ...req.body,
        confirmationCode
      });
      return res.status(201).json({ pickup, confirmationCode });
    } catch (err) {
      return next(err);
    }
  }
);

router.get('/', async (req, res, next) => {
  try {
    const pickups = await Pickup.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.json({ pickups });
  } catch (err) {
    return next(err);
  }
});

router.patch(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid pickup id')],
  validate,
  async (req, res, next) => {
    try {
      const pickup = await Pickup.findById(req.params.id);
      if (!pickup) return res.status(404).json({ error: 'Pickup not found' });
      if (String(pickup.userId) !== String(req.user._id)) return res.status(403).json({ error: 'Forbidden' });
      if (['completed', 'cancelled'].includes(pickup.status)) {
        return res.status(400).json({ error: 'Pickup cannot be modified' });
      }

      const allowed = ['date', 'timeWindow', 'packageCount', 'totalWeight', 'instructions'];
      for (const key of allowed) {
        if (req.body[key] !== undefined) pickup[key] = req.body[key];
      }
      await pickup.save();
      return res.json({ pickup });
    } catch (err) {
      return next(err);
    }
  }
);

router.delete(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid pickup id')],
  validate,
  async (req, res, next) => {
    try {
      const pickup = await Pickup.findById(req.params.id);
      if (!pickup) return res.status(404).json({ error: 'Pickup not found' });
      if (String(pickup.userId) !== String(req.user._id)) return res.status(403).json({ error: 'Forbidden' });
      if (['completed', 'cancelled'].includes(pickup.status)) {
        return res.status(400).json({ error: 'Pickup cannot be cancelled' });
      }

      pickup.status = 'cancelled';
      await pickup.save();
      return res.json({ message: 'Pickup cancelled' });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
