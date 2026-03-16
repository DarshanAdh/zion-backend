const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { globalLimiter } = require('./middleware/rateLimiter');

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : '*',
    credentials: true
  })
);
app.use(express.json({ limit: '10kb' }));
app.use(globalLimiter);

app.use('/api/auth', require('./routes/auth'));
app.use('/api/shipments', require('./routes/shipments'));
app.use('/api/tracking', require('./routes/tracking'));
app.use('/api/pickups', require('./routes/pickups'));
app.use('/api/locations', require('./routes/locations'));
app.use('/api/support', require('./routes/support'));
app.use('/api/users', require('./routes/users'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use(require('./middleware/errorHandler'));

module.exports = app;
