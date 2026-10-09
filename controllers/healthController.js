const ollamaService = require('../services/ollamaService');

const getHealth = async (req, res) => {
  const ollama = await ollamaService.getStatus();

  res.json({
    status: 'ok',
    localAi: {
      ...ollama,
      ready: ollama.reachable && ollama.modelAvailable,
    },
  });
};

module.exports = { getHealth };
