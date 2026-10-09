const matchAll = require('./matchAll');

const CARD_CANDIDATE_PATTERN = /(?<![\d-])\d(?:[ -]?\d){12,18}(?![\d-])/g;

const passesLuhn = (digits) => {
  let sum = 0;
  let double = false;

  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index]);
    if (double) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
    double = !double;
  }

  return sum % 10 === 0;
};

const paymentCard = {
  id: 'payment_card',
  category: 'payment_card',
  severity: 'high',
  reason: 'Payment card number',
  find: (text) => matchAll(text, CARD_CANDIDATE_PATTERN)
    .filter((candidate) => passesLuhn(candidate.match.replace(/\D/g, ''))),
};

module.exports = paymentCard;
