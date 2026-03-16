const Location = require('../models/Location');

const seedData = [
  {
    name: 'Zion Austin Central',
    type: 'full_service',
    address: '789 Congress Ave',
    city: 'Austin',
    state: 'TX',
    zip: '78701',
    phone: '512-555-0100',
    hours: 'Mon-Fri 8am-7pm, Sat 9am-5pm',
    services: ['drop_off', 'pickup', 'packaging', 'notary']
  },
  {
    name: 'Zion Dallas Uptown',
    type: 'full_service',
    address: '1201 McKinney Ave',
    city: 'Dallas',
    state: 'TX',
    zip: '75202',
    phone: '214-555-0142',
    hours: 'Mon-Fri 8am-7pm, Sat 9am-5pm',
    services: ['drop_off', 'pickup', 'packaging']
  },
  {
    name: 'Zion Houston Galleria Drop',
    type: 'drop_off',
    address: '5000 Westheimer Rd',
    city: 'Houston',
    state: 'TX',
    zip: '77056',
    phone: '713-555-0190',
    hours: 'Mon-Sun 9am-8pm',
    services: ['drop_off']
  },
  {
    name: 'Zion San Antonio Riverwalk',
    type: 'full_service',
    address: '300 Alamo Plaza',
    city: 'San Antonio',
    state: 'TX',
    zip: '78205',
    phone: '210-555-0175',
    hours: 'Mon-Fri 8am-6pm, Sat 10am-4pm',
    services: ['drop_off', 'pickup', 'packaging']
  },
  {
    name: 'Zion Fort Worth Locker Hub',
    type: 'locker',
    address: '95 Main St',
    city: 'Fort Worth',
    state: 'TX',
    zip: '76102',
    phone: '817-555-0118',
    hours: '24/7',
    services: ['drop_off', 'pickup']
  },
  {
    name: 'Zion Plano Legacy Drop',
    type: 'drop_off',
    address: '7201 Bishop Rd',
    city: 'Plano',
    state: 'TX',
    zip: '75024',
    phone: '469-555-0164',
    hours: 'Mon-Sun 10am-7pm',
    services: ['drop_off', 'pickup']
  }
];

async function seedLocationsIfEmpty() {
  const count = await Location.countDocuments();
  if (count > 0) return;
  await Location.insertMany(seedData);
}

module.exports = seedLocationsIfEmpty;
