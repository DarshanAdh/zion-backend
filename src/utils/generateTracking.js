function randomCode(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i += 1) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateTrackingNumber() {
  return `ZN-${randomCode(6)}`;
}

function generatePickupCode() {
  return `PU-${randomCode(6)}`;
}

function generateTicketNumber() {
  return `TK-${randomCode(6)}`;
}

module.exports = {
  generateTrackingNumber,
  generatePickupCode,
  generateTicketNumber
};
