const BASE_PRICES = {
  standard: { base: 8.99, perLb: 1.2 },
  express: { base: 18.99, perLb: 1.8 },
  overnight: { base: 38.99, perLb: 2.8 }
};

function round2(value) {
  return Math.round(value * 100) / 100;
}

function calculatePrice(weight, serviceType) {
  const normalizedWeight = Number(weight) || 0;
  const key = String(serviceType || 'standard').toLowerCase();
  const rule = BASE_PRICES[key] || BASE_PRICES.standard;
  return round2(rule.base + rule.perLb * normalizedWeight);
}

function calculateAllPrices(weight) {
  return {
    standard: calculatePrice(weight, 'standard'),
    express: calculatePrice(weight, 'express'),
    overnight: calculatePrice(weight, 'overnight')
  };
}

module.exports = {
  calculatePrice,
  calculateAllPrices
};
