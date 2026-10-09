import { afterEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import app from '../app';
import { connectionError, stubClassifierError, stubClassifierFindings, timeoutError } from './helpers/fakeOllama';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('POST /api/scan with local AI', () => {
  const text = 'Reply to Maria Santos at maria.santos@example.com about her refund.';

  it('merges AI findings with pattern findings', async () => {
    stubClassifierFindings([{ category: 'person_name', quote: 'Maria Santos', reason: 'Names a specific customer' }]);

    const response = await request(app).post('/api/scan').send({ text });

    expect(response.body).toMatchObject({
      riskLevel: 'high',
      recommendedAction: 'redact_and_review',
      redactedText: 'Reply to [NAME_1] at [EMAIL_1] about her refund.',
      ai: { status: 'completed', model: 'qwen3:4b' },
    });
    expect(response.body.findings.map(({ source, category }) => `${source}:${category}`)).toEqual([
      'ai:person_name',
      'pattern:email',
    ]);
  });

  it('lets the pattern finding win when the AI quote overlaps it', async () => {
    stubClassifierFindings([{ category: 'confidential_info', quote: 'maria.santos@example.com', reason: 'Contact detail' }]);

    const response = await request(app).post('/api/scan').send({ text });

    expect(response.body.findings).toHaveLength(1);
    expect(response.body.findings[0]).toMatchObject({ source: 'pattern', category: 'email' });
  });

  it('never lets the AI lower the risk found by patterns', async () => {
    stubClassifierFindings([]);

    const response = await request(app).post('/api/scan').send({ text });

    expect(response.body).toMatchObject({ riskLevel: 'high', recommendedAction: 'redact_and_review' });
  });

  it.each([
    ['unavailable', connectionError()],
    ['timeout', timeoutError()],
  ])('still returns pattern results when the AI is %s, and warns on clean prompts', async (status, error) => {
    stubClassifierError(error);

    const withPii = await request(app).post('/api/scan').send({ text });
    const clean = await request(app).post('/api/scan').send({ text: 'Explain photosynthesis simply.' });

    expect(withPii.status).toBe(200);
    expect(withPii.body).toMatchObject({ ai: { status }, recommendedAction: 'redact_and_review' });
    expect(withPii.body.findings).toHaveLength(1);
    expect(clean.body).toMatchObject({ ai: { status }, riskLevel: 'none', recommendedAction: 'warn' });
  });

  it('skips the AI when useAi is false', async () => {
    const fetchMock = stubClassifierFindings([]);

    const response = await request(app).post('/api/scan').send({ text, useAi: false });

    expect(response.body.ai.status).toBe('skipped');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('POST /api/scan patterns', () => {
  it('returns findings, risk and a redacted draft', async () => {
    const text = 'Reply to Maria Santos at maria.santos@example.com or 0917 123 4567 about her refund.';

    const response = await request(app).post('/api/scan').send({ text, useAi: false });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      riskLevel: 'high',
      recommendedAction: 'redact_and_review',
      redactedText: 'Reply to Maria Santos at [EMAIL_1] or [PHONE_1] about her refund.',
      ai: { status: 'skipped' },
    });
    expect(response.body.findings).toEqual([
      {
        id: 'f1',
        category: 'email',
        severity: 'high',
        source: 'pattern',
        detector: 'email',
        start: 25,
        end: 49,
        match: 'maria.santos@example.com',
        placeholder: '[EMAIL_1]',
        reason: 'Email address',
      },
      expect.objectContaining({ id: 'f2', category: 'phone', detector: 'ph_mobile', placeholder: '[PHONE_1]' }),
    ]);
  });

  it('allows prompts with nothing sensitive', async () => {
    const text = 'Explain how photosynthesis works in simple terms.';

    const response = await request(app).post('/api/scan').send({ text, useAi: false });

    expect(response.body).toMatchObject({ riskLevel: 'none', recommendedAction: 'allow', findings: [], redactedText: text });
  });

  it('keeps one finding when detectors overlap', async () => {
    // This TIN also passes the card checksum, so both detectors match the same span
    const response = await request(app).post('/api/scan').send({ text: 'TIN 123-456-789-00007', useAi: false });

    expect(response.body.findings).toHaveLength(1);
    expect(response.body.findings[0].detector).toBe('ph_tin');
  });

  it('rejects an empty prompt', async () => {
    const response = await request(app).post('/api/scan').send({ text: '' });

    expect(response.status).toBe(400);
    expect(response.body.error.details[0].path).toBe('text');
  });

  it('rejects unknown fields', async () => {
    const response = await request(app).post('/api/scan').send({ text: 'hi', extra: true });

    expect(response.status).toBe(400);
  });

  it('returns 413 for prompts over the length limit', async () => {
    const response = await request(app).post('/api/scan').send({ text: 'a'.repeat(20001) });

    expect(response.status).toBe(413);
    expect(response.body.error.message).toBe('Prompt is too long to scan');
  });
});

describe('POST /api/redact', () => {
  const text = 'Reply to Maria Santos at maria.santos@example.com about her refund.';

  it('redacts only the findings the user kept', async () => {
    const response = await request(app)
      .post('/api/redact')
      .send({ text, findings: [{ start: 25, end: 49, category: 'email' }] });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      redactedText: 'Reply to Maria Santos at [EMAIL_1] about her refund.',
      replacements: [{ start: 25, end: 49, category: 'email', placeholder: '[EMAIL_1]' }],
    });
  });

  it('accepts categories the AI will produce later', async () => {
    const response = await request(app)
      .post('/api/redact')
      .send({ text, findings: [{ start: 9, end: 21, category: 'person_name' }] });

    expect(response.body.redactedText).toBe('Reply to [NAME_1] at maria.santos@example.com about her refund.');
  });

  it.each([
    ['end before start', [{ start: 10, end: 5, category: 'email' }]],
    ['span past the end of text', [{ start: 25, end: 999, category: 'email' }]],
    ['overlapping spans', [{ start: 9, end: 21, category: 'person_name' }, { start: 15, end: 30, category: 'email' }]],
    ['unknown category', [{ start: 25, end: 49, category: 'favourite_color' }]],
  ])('rejects %s', async (label, findings) => {
    const response = await request(app).post('/api/redact').send({ text, findings });

    expect(response.status).toBe(400);
    expect(response.body.error.details.length).toBeGreaterThan(0);
  });
});
