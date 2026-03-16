require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');
const seedLocationsIfEmpty = require('./config/seedLocations');

const PORT = process.env.PORT || 5050;

async function start() {
  try {
    await connectDB();
    await seedLocationsIfEmpty();
    app.listen(PORT, () => {
      console.log(`Zion backend listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
