const matchAll = (text, pattern) => Array.from(text.matchAll(pattern), (match) => ({
  start: match.index,
  end: match.index + match[0].length,
  match: match[0],
}));

module.exports = matchAll;
