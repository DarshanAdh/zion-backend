const express = require('express');
const { body, param } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(auth);

router.get('/profile', async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

router.patch(
  '/profile',
  [
    body('firstName').optional().notEmpty(),
    body('lastName').optional().notEmpty(),
    body('phone').optional().isString()
  ],
  validate,
  async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id).select('-password');
      if (!user) return res.status(404).json({ error: 'User not found' });

      if (req.body.firstName !== undefined) user.firstName = req.body.firstName;
      if (req.body.lastName !== undefined) user.lastName = req.body.lastName;
      if (req.body.phone !== undefined) user.phone = req.body.phone;
      await user.save();

      return res.json({ user });
    } catch (err) {
      return next(err);
    }
  }
);

router.patch(
  '/password',
  [
    body('currentPassword').notEmpty().withMessage('currentPassword is required'),
    body('newPassword').isLength({ min: 8 }).withMessage('newPassword must be at least 8 chars')
  ],
  validate,
  async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id).select('+password');
      if (!user) return res.status(404).json({ error: 'User not found' });

      const ok = await user.comparePassword(req.body.currentPassword);
      if (!ok) return res.status(401).json({ error: 'Current password is incorrect' });

      user.password = req.body.newPassword;
      await user.save();

      return res.json({ message: 'Password updated' });
    } catch (err) {
      return next(err);
    }
  }
);

router.get('/addresses', async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('addresses');
    return res.json({ addresses: user?.addresses || [] });
  } catch (err) {
    return next(err);
  }
});

router.post(
  '/addresses',
  [
    body('label').notEmpty(),
    body('street').notEmpty(),
    body('city').notEmpty(),
    body('state').notEmpty(),
    body('zip').notEmpty()
  ],
  validate,
  async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user) return res.status(404).json({ error: 'User not found' });

      user.addresses.push({
        label: req.body.label,
        street: req.body.street,
        city: req.body.city,
        state: req.body.state,
        zip: req.body.zip
      });
      await user.save();

      const address = user.addresses[user.addresses.length - 1];
      return res.status(201).json({ address });
    } catch (err) {
      return next(err);
    }
  }
);

router.delete(
  '/addresses/:id',
  [param('id').isMongoId().withMessage('Invalid address id')],
  validate,
  async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user) return res.status(404).json({ error: 'User not found' });

      const address = user.addresses.id(req.params.id);
      if (!address) return res.status(404).json({ error: 'Address not found' });

      address.deleteOne();
      await user.save();

      return res.json({ message: 'Address removed' });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
