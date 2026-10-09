const matchAll = require('./matchAll');

const EMAIL_PATTERN = /(?<![\w.%+-])[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}(?![\w-])/g;

const email = {
  id: 'email',
  category: 'email',
  severity: 'high',
  reason: 'Email address',
  find: (text) => matchAll(text, EMAIL_PATTERN),
};

module.exports = email;
