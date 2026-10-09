const CATEGORY_LABELS = {
  email: 'EMAIL',
  phone: 'PHONE',
  payment_card: 'CARD',
  government_id: 'GOV_ID',
  person_name: 'NAME',
  address: 'ADDRESS',
  health_info: 'HEALTH',
  financial_info: 'FINANCIAL',
  confidential_info: 'CONFIDENTIAL',
  confidential_keyword: 'CONFIDENTIAL',
};

const CATEGORIES = Object.keys(CATEGORY_LABELS);

const AI_CATEGORY_SEVERITY = {
  person_name: 'medium',
  address: 'high',
  health_info: 'high',
  financial_info: 'medium',
  confidential_info: 'medium',
};

const AI_CATEGORIES = Object.keys(AI_CATEGORY_SEVERITY);

const SEVERITY_RANK = { none: 0, low: 1, medium: 2, high: 3 };

module.exports = { CATEGORY_LABELS, CATEGORIES, AI_CATEGORY_SEVERITY, AI_CATEGORIES, SEVERITY_RANK };
