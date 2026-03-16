const express = require('express');
const { body } = require('express-validator');
const SupportTicket = require('../models/SupportTicket');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { generateTicketNumber } = require('../utils/generateTracking');

const router = express.Router();

const faq = [
  {
    question: 'How do I track my package?',
    answer: 'Enter your tracking number ZN-XXXXXX on the Tracking page.'
  },
  {
    question: 'What is your delivery guarantee?',
    answer: 'Express and Overnight shipments include a money-back delivery guarantee.'
  },
  {
    question: 'Can I change my delivery address?',
    answer: 'Yes, use the Manage Delivery option on the Tracking page before Out for Delivery status.'
  },
  {
    question: 'How do I schedule a pickup?',
    answer: 'Go to Shipping -> Schedule and Manage Pickups and select a date, time window, and address.'
  },
  {
    question: 'What are the size limits for packages?',
    answer: 'Maximum 150 lbs and 165 inches combined length + girth.'
  },
  {
    question: 'Do you ship internationally?',
    answer: 'Yes, Zion ships to 60+ countries with full customs documentation support.'
  }
];

async function uniqueTicketNumber() {
  for (let i = 0; i < 8; i += 1) {
    const candidate = generateTicketNumber();
    const exists = await SupportTicket.exists({ ticketNumber: candidate });
    if (!exists) return candidate;
  }
  throw new Error('Unable to generate ticket number');
}

router.post(
  '/',
  auth,
  [
    body('subject').notEmpty().withMessage('subject is required'),
    body('message').notEmpty().withMessage('message is required'),
    body('category').optional().isIn(['tracking', 'billing', 'damage', 'other']),
    body('relatedTrackingNumber').optional().isString()
  ],
  validate,
  async (req, res, next) => {
    try {
      const ticketNumber = await uniqueTicketNumber();
      const ticket = await SupportTicket.create({
        userId: req.user._id,
        ticketNumber,
        subject: req.body.subject,
        message: req.body.message,
        category: req.body.category || 'other',
        relatedTrackingNumber: req.body.relatedTrackingNumber
      });

      return res.status(201).json({
        ticket: {
          _id: ticket._id,
          ticketNumber: ticket.ticketNumber,
          status: ticket.status
        }
      });
    } catch (err) {
      return next(err);
    }
  }
);

router.get('/my-tickets', auth, async (req, res, next) => {
  try {
    const tickets = await SupportTicket.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.json({ tickets });
  } catch (err) {
    return next(err);
  }
});

router.get('/faq', (req, res) => {
  res.json({ faq });
});

module.exports = router;
