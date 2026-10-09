import { vi } from 'vitest';

const jsonResponse = (body) => ({ ok: true, status: 200, json: async () => body });

export const stubClassifierReply = (content) => {
  const fetchMock = vi.fn(async () => jsonResponse({ message: { content } }));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

export const stubClassifierFindings = (findings) => stubClassifierReply(JSON.stringify({ findings }));

export const stubClassifierError = (error) => {
  const fetchMock = vi.fn(async () => {
    throw error;
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

export const timeoutError = () => new DOMException('The operation was aborted due to timeout', 'TimeoutError');

export const connectionError = () => new TypeError('fetch failed');
