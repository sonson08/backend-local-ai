const { SEVERITY_RANK } = require('./categories');

const ACTION_BY_RISK = {
  none: 'allow',
  low: 'warn',
  medium: 'redact_and_review',
  high: 'redact_and_review',
};

const ACTION_RANK = { allow: 0, warn: 1, redact_and_review: 2, block: 3 };

const AI_INCOMPLETE_STATUSES = ['unavailable', 'timeout', 'invalid_output'];

// When the contextual check didn't run, a clean pattern result must not read as "safe to send"
const AI_INCOMPLETE_MIN_ACTION = 'warn';

const highestSeverity = (findings) => findings.reduce(
  (highest, finding) => (SEVERITY_RANK[finding.severity] > SEVERITY_RANK[highest] ? finding.severity : highest),
  'none',
);

const atLeast = (action, minimum) => (ACTION_RANK[action] < ACTION_RANK[minimum] ? minimum : action);

const decide = (findings, { aiStatus } = {}) => {
  const riskLevel = highestSeverity(findings);
  const action = ACTION_BY_RISK[riskLevel];
  const recommendedAction = AI_INCOMPLETE_STATUSES.includes(aiStatus) ? atLeast(action, AI_INCOMPLETE_MIN_ACTION) : action;

  return { riskLevel, recommendedAction };
};

module.exports = { decide };
