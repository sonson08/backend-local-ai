const { z } = require('zod');
const { CATEGORIES } = require('../services/categories');

const MAX_TEXT_LENGTH = 20000;
const MAX_REDACT_FINDINGS = 500;

const promptText = z.string().min(1).max(MAX_TEXT_LENGTH);

const scanRequestSchema = z.strictObject({
  text: promptText,
  profile: z.enum(['default']).optional(),
  useAi: z.boolean().optional(),
});

const redactSpanSchema = z.strictObject({
  start: z.int().nonnegative(),
  end: z.int().positive(),
  category: z.enum(CATEGORIES),
});

const redactRequestSchema = z
  .strictObject({
    text: promptText,
    findings: z.array(redactSpanSchema).max(MAX_REDACT_FINDINGS),
  })
  .superRefine(({ text, findings }, ctx) => {
    findings.forEach((span, index) => {
      if (span.end <= span.start) {
        ctx.addIssue({ code: 'custom', path: ['findings', index, 'end'], message: 'end must be greater than start' });
      }
      if (span.end > text.length) {
        ctx.addIssue({ code: 'custom', path: ['findings', index, 'end'], message: 'end is past the end of text' });
      }
    });

    const sorted = findings.map((span, index) => ({ ...span, index })).sort((a, b) => a.start - b.start);
    sorted.slice(1).forEach((span, position) => {
      if (span.start < sorted[position].end) {
        ctx.addIssue({ code: 'custom', path: ['findings', span.index], message: 'findings must not overlap' });
      }
    });
  });

module.exports = { MAX_TEXT_LENGTH, scanRequestSchema, redactRequestSchema };
