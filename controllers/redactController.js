const redactionService = require('../services/redactionService');

const redact = (req, res) => {
  const { text, findings } = req.body;
  res.json(redactionService.redact(text, findings));
};

module.exports = { redact };
