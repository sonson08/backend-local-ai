const { CATEGORY_LABELS } = require('./categories');

const normalizeValue = (value) => value.toLowerCase().replace(/[\s().+-]/g, '');

const byStart = (a, b) => a.start - b.start;

// The same value always gets the same placeholder, so the redacted prompt still reads coherently
const assignPlaceholders = (text, spans) => {
  const counters = {};
  const placeholderByValue = new Map();

  return [...spans].sort(byStart).map((span) => {
    const label = CATEGORY_LABELS[span.category];
    const key = `${label}:${normalizeValue(text.slice(span.start, span.end))}`;

    if (!placeholderByValue.has(key)) {
      counters[label] = (counters[label] ?? 0) + 1;
      placeholderByValue.set(key, `[${label}_${counters[label]}]`);
    }

    return { ...span, placeholder: placeholderByValue.get(key) };
  });
};

const applyPlaceholders = (text, spans) => {
  let result = '';
  let cursor = 0;

  [...spans].sort(byStart).forEach((span) => {
    result += text.slice(cursor, span.start) + span.placeholder;
    cursor = span.end;
  });

  return result + text.slice(cursor);
};

const redact = (text, spans) => {
  const replacements = assignPlaceholders(text, spans);
  return { redactedText: applyPlaceholders(text, replacements), replacements };
};

module.exports = { assignPlaceholders, applyPlaceholders, redact };
