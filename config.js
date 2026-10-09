require('dotenv/config');
const { z } = require('zod');

const envSchema = z.object({
  OLLAMA_URL: z.url().default('http://127.0.0.1:11434'),
  OLLAMA_MODEL: z.string().min(1).default('qwen3:4b'),
  OLLAMA_TIMEOUT_MS: z.coerce.number().int().positive().default(15000),
  OLLAMA_KEEP_ALIVE: z.string().min(1).default('30m'),
  ALLOWED_ORIGINS: z.string().default(''),
});

const env = envSchema.parse(process.env);

const config = {
  ollamaUrl: env.OLLAMA_URL.replace(/\/+$/, ''),
  ollamaModel: env.OLLAMA_MODEL,
  ollamaTimeoutMs: env.OLLAMA_TIMEOUT_MS,
  ollamaKeepAlive: env.OLLAMA_KEEP_ALIVE,
  allowedOrigins: env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean),
};

module.exports = config;
