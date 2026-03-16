const express = require('express');
const { param, query } = require('express-validator');
const Location = require('../models/Location');
const validate = require('../middleware/validate');

const router = express.Router();

router.get(
  '/',
  [
    query('city').optional().isString(),
    query('zip').optional().isString(),
    query('type').optional().isIn(['full_service', 'drop_off', 'locker'])
  ],
  validate,
  async (req, res, next) => {
    try {
      const filter = {};
      if (req.query.city) filter.city = new RegExp(`^${req.query.city}$`, 'i');
      if (req.query.zip) filter.zip = req.query.zip;
      if (req.query.type) filter.type = req.query.type;

      const locations = await Location.find(filter).sort({ city: 1, name: 1 });
      return res.json({ locations });
    } catch (err) {
      return next(err);
    }
  }
);

router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid location id')],
  validate,
  async (req, res, next) => {
    try {
      const location = await Location.findById(req.params.id);
      if (!location) return res.status(404).json({ error: 'Location not found' });
      return res.json({ location });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
