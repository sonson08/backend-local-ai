import { afterEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import app from '../app';

const jsonResponse = (body) => ({ ok: true, status: 200, json: async () => body });

const stubOllama = ({ models }) => {
  vi.stubGlobal('fetch', vi.fn(async (url) => {
    if (url.endsWith('/api/version')) {
      return jsonResponse({ version: '0.40.2' });
    }
    return jsonResponse({ models });
  }));
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('GET /health', () => {
  it('reports local AI ready when Ollama has the configured model', async () => {
    stubOllama({ models: [{ name: 'qwen3:4b' }] });

    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'ok',
      localAi: { reachable: true, version: '0.40.2', model: 'qwen3:4b', modelAvailable: true, ready: true },
    });
  });

  it('reports local AI not ready when the model is missing', async () => {
    stubOllama({ models: [{ name: 'llama3.2:latest' }] });

    const response = await request(app).get('/health');

    expect(response.body.localAi).toMatchObject({ reachable: true, modelAvailable: false, ready: false });
  });

  it('stays up when Ollama is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new TypeError('fetch failed');
    }));

    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.localAi).toMatchObject({ reachable: false, version: null, ready: false });
  });
});

describe('error handling', () => {
  it('returns JSON for unknown routes', async () => {
    const response = await request(app).get('/does-not-exist');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: { message: 'Not Found' } });
  });

  it('returns JSON for malformed request bodies', async () => {
    const response = await request(app)
      .post('/health')
      .set('Content-Type', 'application/json')
      .send('{"text":');

    expect(response.status).toBe(400);
    expect(response.body.error.message).toBeTypeOf('string');
  });
});
