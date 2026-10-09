const createError = require('http-errors');
const config = require('../config');

const STATUS_TIMEOUT_MS = 3000;
const WARM_UP_TIMEOUT_MS = 120000;

const request = async (path, { timeoutMs = config.ollamaTimeoutMs, ...options } = {}) => {
  const response = await fetch(`${config.ollamaUrl}${path}`, {
    ...options,
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) {
    throw createError(502, `Ollama responded with status ${response.status}`);
  }

  return response.json();
};

const postJson = (path, body, options = {}) => request(path, {
  ...options,
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

// Ollama lists untagged models as "name:latest", so "qwen3" and "qwen3:latest" must match
const withDefaultTag = (name) => (name.includes(':') ? name : `${name}:latest`);

const getStatus = async () => {
  try {
    const [{ version }, { models }] = await Promise.all([
      request('/api/version', { timeoutMs: STATUS_TIMEOUT_MS }),
      request('/api/tags', { timeoutMs: STATUS_TIMEOUT_MS }),
    ]);
    const wanted = withDefaultTag(config.ollamaModel);
    const modelAvailable = models.some((model) => withDefaultTag(model.name) === wanted);

    return { reachable: true, version, model: config.ollamaModel, modelAvailable };
  } catch {
    return { reachable: false, version: null, model: config.ollamaModel, modelAvailable: false };
  }
};

const chat = async ({ messages, format, timeoutMs }) => {
  const body = await postJson('/api/chat', {
    model: config.ollamaModel,
    messages,
    format,
    stream: false,
    // Qwen3 reasons step by step by default, which is too slow for classifying a prompt before it is sent
    think: false,
    keep_alive: config.ollamaKeepAlive,
    options: { temperature: 0 },
  }, { timeoutMs });

  return body.message.content;
};

// A generate request with no prompt only loads the model, so the first real scan doesn't pay the load time
const warmUp = () => postJson(
  '/api/generate',
  { model: config.ollamaModel, keep_alive: config.ollamaKeepAlive },
  { timeoutMs: WARM_UP_TIMEOUT_MS },
);

module.exports = { getStatus, chat, warmUp };
