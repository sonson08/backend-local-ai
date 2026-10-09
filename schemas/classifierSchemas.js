const { z } = require('zod');
const { AI_CATEGORIES } = require('../services/categories');

const classifierOutputSchema = z.object({
  findings: z.array(z.object({
    category: z.enum(AI_CATEGORIES),
    quote: z.string().min(1),
    reason: z.string().min(1),
  })),
});

const { $schema, ...classifierJsonSchema } = z.toJSONSchema(classifierOutputSchema);

module.exports = { classifierOutputSchema, classifierJsonSchema };
