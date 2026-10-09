const createError = require('http-errors');

const isTextTooLong = (issue) => issue.code === 'too_big' && issue.path.length === 1 && issue.path[0] === 'text';

const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body ?? {});

  if (result.success) {
    req.body = result.data;
    next();
    return;
  }

  const { issues } = result.error;
  const tooLong = issues.some(isTextTooLong);

  next(createError(tooLong ? 413 : 400, tooLong ? 'Prompt is too long to scan' : 'Invalid request body', {
    details: issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message })),
  }));
};

module.exports = validateBody;
