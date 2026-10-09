const matchAll = require('./matchAll');

// Undashed numbers are only flagged next to a label, because a bare 9–14 digit run is usually an order or reference number
const findLabelled = (text, labels, digitCounts) => {
  const pattern = new RegExp(
    `\\b(?:${labels.join('|')})\\b(?:\\s*(?:no\\.?|number|num|#))?\\s*[:#-]?\\s*(\\d{9,14})(?!\\d)`,
    'gid',
  );

  return Array.from(text.matchAll(pattern))
    .filter((match) => digitCounts.includes(match[1].length))
    .map((match) => {
      const [start, end] = match.indices[1];
      return { start, end, match: match[1] };
    });
};

const createGovIdDetector = ({ id, name, dashedPattern, labels, digitCounts }) => ({
  id,
  category: 'government_id',
  severity: 'high',
  reason: `Philippine ${name}`,
  find: (text) => [...matchAll(text, dashedPattern), ...findLabelled(text, labels, digitCounts)],
});

const govIds = [
  createGovIdDetector({
    id: 'ph_tin',
    name: 'TIN',
    dashedPattern: /(?<![\d-])\d{3}-\d{3}-\d{3}(?:-\d{3}(?:\d{2})?)?(?![\d-])/g,
    labels: ['TIN'],
    digitCounts: [9, 12, 14],
  }),
  createGovIdDetector({
    id: 'ph_sss',
    name: 'SSS number',
    dashedPattern: /(?<![\d-])\d{2}-\d{7}-\d(?![\d-])/g,
    labels: ['SSS'],
    digitCounts: [10],
  }),
  createGovIdDetector({
    id: 'ph_philhealth',
    name: 'PhilHealth number',
    dashedPattern: /(?<![\d-])\d{2}-\d{9}-\d(?![\d-])/g,
    labels: ['PhilHealth', 'PHIC'],
    digitCounts: [12],
  }),
  createGovIdDetector({
    id: 'ph_umid',
    name: 'UMID / CRN',
    dashedPattern: /(?<![\d-])\d{4}-\d{7}-\d(?![\d-])/g,
    labels: ['UMID', 'CRN'],
    digitCounts: [12],
  }),
];

module.exports = govIds;
