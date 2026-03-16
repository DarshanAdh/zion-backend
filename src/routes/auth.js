const express = require('express');
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const User = require('../models/User');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
}

router.post(
  '/signup',
  authLimiter,
  [
    body('firstName').trim().notEmpty().withMessage('firstName is required'),
    body('lastName').trim().notEmpty().withMessage('lastName is required'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('phone').optional().isString()
  ],
  validate,
  async (req, res, next) => {
    try {
      const { firstName, lastName, email, phone, password } = req.body;
      const exists = await User.findOne({ email: email.toLowerCase() });
      if (exists) return res.status(400).json({ error: 'Email already in use' });

      const user = await User.create({ firstName, lastName, email, phone, password });
      const token = signToken(user._id);

      return res.status(201).json({
        token,
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        }
      });
    } catch (err) {
      return next(err);
    }
  }
);

router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required')
  ],
  validate,
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });

      const valid = await user.comparePassword(password);
      if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

      const token = signToken(user._id);
      return res.json({
        token,
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        }
      });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
