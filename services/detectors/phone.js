const matchAll = require('./matchAll');

const MOBILE_PATTERN = /(?<![\d+])(?:\+63|0)[\s-]?9\d{2}[\s-]?\d{3}[\s-]?\d{4}(?!\d)/g;

// Area code must be in parentheses or after +63; bare 7–8 digit runs are too often amounts or reference numbers
const LANDLINE_PATTERN = /(?<![\d+(])(?:\(0\d{1,2}\)|\+63[\s-]?\(?[2-8]\d?\)?)[\s-]?\d{3,4}[\s-]?\d{4}(?!\d)/g;

const phMobile = {
  id: 'ph_mobile',
  category: 'phone',
  severity: 'medium',
  reason: 'Philippine mobile number',
  find: (text) => matchAll(text, MOBILE_PATTERN),
};

const phLandline = {
  id: 'ph_landline',
  category: 'phone',
  severity: 'low',
  reason: 'Philippine landline number',
  find: (text) => matchAll(text, LANDLINE_PATTERN),
};

module.exports = [phMobile, phLandline];
