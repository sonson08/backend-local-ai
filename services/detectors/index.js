const email = require('./email');
const phoneDetectors = require('./phone');
const paymentCard = require('./cards');
const govIdDetectors = require('./govIds');

// Order breaks ties between overlapping findings of equal severity and length; specific ID formats beat the generic card check
const detectors = [...govIdDetectors, paymentCard, email, ...phoneDetectors];

const runDetectors = (text) => detectors.flatMap((detector, order) => detector.find(text).map((found) => ({
  source: 'pattern',
  detector: detector.id,
  category: detector.category,
  severity: detector.severity,
  reason: detector.reason,
  start: found.start,
  end: found.end,
  match: found.match,
  order,
})));

module.exports = { detectors, runDetectors };
