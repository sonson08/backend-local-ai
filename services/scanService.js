const { SEVERITY_RANK } = require('./categories');
const { runDetectors } = require('./detectors');
const classifierService = require('./classifierService');
const policyService = require('./policyService');
const redactionService = require('./redactionService');

const SOURCE_RANK = { ai: 0, rule: 1, pattern: 1 };

const overlaps = (a, b) => a.start < b.end && b.start < a.end;

// Exact, deterministic findings always beat the model when they cover the same text
const byPriority = (a, b) => SOURCE_RANK[b.source] - SOURCE_RANK[a.source]
  || SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity]
  || (b.end - b.start) - (a.end - a.start)
  || a.order - b.order;

const resolveOverlaps = (findings) => [...findings]
  .sort(byPriority)
  .reduce((kept, finding) => (kept.some((other) => overlaps(other, finding)) ? kept : [...kept, finding]), [])
  .sort((a, b) => a.start - b.start);

const toResponseFinding = (finding, index) => ({
  id: `f${index + 1}`,
  category: finding.category,
  severity: finding.severity,
  source: finding.source,
  detector: finding.detector,
  start: finding.start,
  end: finding.end,
  match: finding.match,
  placeholder: finding.placeholder,
  reason: finding.reason,
});

const scan = async ({ text, useAi = true }) => {
  const startedAt = performance.now();
  const patternFindings = runDetectors(text);
  const ai = useAi ? await classifierService.classify(text) : classifierService.skipped();

  const findings = redactionService.assignPlaceholders(text, resolveOverlaps([...patternFindings, ...ai.findings]));
  const { riskLevel, recommendedAction } = policyService.decide(findings, { aiStatus: ai.status });

  return {
    riskLevel,
    recommendedAction,
    findings: findings.map(toResponseFinding),
    redactedText: redactionService.applyPlaceholders(text, findings),
    ai: { status: ai.status, model: ai.model, latencyMs: ai.latencyMs },
    durationMs: Math.round(performance.now() - startedAt),
  };
};

module.exports = { scan };
