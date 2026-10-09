const scanService = require('../services/scanService');

const scan = async (req, res) => {
  res.json(await scanService.scan(req.body));
};

module.exports = { scan };
