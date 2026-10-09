import { describe, expect, it } from 'vitest';
import { redact } from '../services/redactionService';

const spanOf = (text, value, category) => {
  const start = text.indexOf(value);
  return { start, end: start + value.length, category };
};

describe('redactionService.redact', () => {
  it('numbers placeholders per category in order of appearance', () => {
    const text = 'Email a@example.com or b@example.com, call 0917 123 4567';
    const spans = [
      spanOf(text, '0917 123 4567', 'phone'),
      spanOf(text, 'a@example.com', 'email'),
      spanOf(text, 'b@example.com', 'email'),
    ];

    expect(redact(text, spans).redactedText).toBe('Email [EMAIL_1] or [EMAIL_2], call [PHONE_1]');
  });

  it('reuses the placeholder when the same value appears twice', () => {
    const text = 'Ask A@example.com, then cc a@example.com';
    const second = text.lastIndexOf('a@example.com');
    const spans = [
      spanOf(text, 'A@example.com', 'email'),
      { start: second, end: second + 'a@example.com'.length, category: 'email' },
    ];

    expect(redact(text, spans).redactedText).toBe('Ask [EMAIL_1], then cc [EMAIL_1]');
  });

  it('returns the text unchanged when there is nothing to redact', () => {
    expect(redact('Nothing here', [])).toEqual({ redactedText: 'Nothing here', replacements: [] });
  });
});
