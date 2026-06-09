const STOP_WORDS = new Set([
  'i', 'me', 'my', 'have', 'has', 'had', 'a', 'an', 'the', 'and', 'or',
  'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'is',
  'was', 'are', 'were', 'be', 'been', 'being', 'it', 'its', 'that', 'this',
  'these', 'those', 'am', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'shall', 'can', 'not', 'no', 'nor', 'so',
  'if', 'then', 'than', 'too', 'very', 'just', 'about', 'also', 'now',
  'current', 'stopped', 'stopped', 'working', 'treatment', 'taking',
  'diagnosed', 'with', 'years', 'year', 'old', 'ago', 'still',
]);

export function extractSearchTerms(input: string): string {
  const words = input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
  return words.join(' ');
}

export function summarizeCriteria(criteria: string): string {
  const lines = criteria.split('\n').filter((l) => l.trim());
  const inclusion = lines.find((l) =>
    /inclusion|include/i.test(l)
  );
  if (inclusion) {
    const startIdx = lines.indexOf(inclusion);
    const relevantLines = lines
      .slice(startIdx + 1, startIdx + 4)
      .filter((l) => l.trim().length > 10);
    if (relevantLines.length > 0) {
      return relevantLines.join(' ').substring(0, 120).trim();
    }
  }
  return criteria.substring(0, 120).trim();
}

export function simplifySummary(summary: string): string {
  if (!summary) return 'No summary available.';
  const cleaned = summary.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= 250) return cleaned;
  const truncated = cleaned.substring(0, 247);
  const lastPeriod = truncated.lastIndexOf('.');
  if (lastPeriod > 100) return truncated.substring(0, lastPeriod + 1);
  return truncated + '...';
}
