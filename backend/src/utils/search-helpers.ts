// Replaced by parseNaturalLanguage() in Phase 2
// Old extractSearchTerms() removed — see git history for reference

export interface ParsedIntent {
  condition: string;
  modifiers: string[];
  clinicalSynonyms: string[];
  location?: string;
}

export function parseNaturalLanguage(input: string): ParsedIntent {
  let text = input.toLowerCase().trim();

  // --- SYNONYM MAP ---
  const synonymMap: Array<{ patterns: RegExp; synonyms: string[] }> = [
    {
      patterns: /stopped working|nothing works|not working|no longer works|treatment.{0,10}fail/,
      synonyms: ['refractory', 'treatment-resistant'],
    },
    {
      patterns: /came back|come back|returned|relapsed/,
      synonyms: ['recurrent', 'relapsed'],
    },
    {
      patterns: /\bspread\b|spreading|metastas/,
      synonyms: ['metastatic'],
    },
    {
      patterns: /early.{0,5}stage|stage (i|1|one)\b/,
      synonyms: ['stage I', 'stage II'],
    },
    {
      patterns: /advanced|late.{0,5}stage|stage (iii|iv|3|4)/,
      synonyms: ['stage III', 'stage IV'],
    },
    {
      patterns: /\bkids\b|\bchildren\b|\bchild\b|\bpediatric/,
      synonyms: ['pediatric'],
    },
    {
      patterns: /experimental|new treatment|investigational/,
      synonyms: ['investigational'],
    },
  ];

  // --- EXTRACT SYNONYMS ---
  const clinicalSynonyms: string[] = [];
  for (const entry of synonymMap) {
    if (entry.patterns.test(text)) {
      clinicalSynonyms.push(...entry.synonyms);
      // Remove matched phrase from text so it doesn't pollute condition extraction
      text = text.replace(entry.patterns, '');
    }
  }

  // --- EXTRACT LOCATION ---
  let location: string | undefined;
  const locationMatch = text.match(
    /(?:near|in|around|close to|located in)\s+([A-Za-z\s]{2,30})(?:,|$|\s+\d)/i
  );
  if (locationMatch) {
    location = locationMatch[1].trim();
    text = text.replace(locationMatch[0], '');
  }

  // --- PRESERVE COMPOUND MODIFIERS ---
  // Keep "stage 2", "type 1", "triple negative" intact
  const compoundModifierPattern =
    /\b(stage\s+\d+|type\s+\d+|triple\s+negative|double\s+negative|her2[+-]?|grade\s+\d+)\b/gi;
  const modifiers: string[] = [];
  const modifierMatches = text.match(compoundModifierPattern);
  if (modifierMatches) {
    modifiers.push(...modifierMatches.map(m => m.trim()));
    text = text.replace(compoundModifierPattern, '');
  }

  // --- EXTRACT CONDITION ---
  // Remove filler words, keep meaningful medical terms
  const stopWords = new Set([
    'i', 'have', 'has', 'had', 'with', 'and', 'or', 'the', 'a', 'an',
    'my', 'me', 'we', 'us', 'for', 'of', 'to', 'is', 'are', 'was',
    'been', 'be', 'do', 'does', 'did', 'not', 'no', 'standard',
    'treatment', 'therapy', 'medication', 'drug', 'looking', 'seeking',
    'want', 'need', 'trying', 'find', 'searching', 'trials', 'trial',
    'ago', 'old', 'years', 'months', 'weeks', 'days',
  ]);

  const conditionWords = text
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length >= 2 && !stopWords.has(word));

  const condition = conditionWords.join(' ').trim();

  return { condition, modifiers, clinicalSynonyms, location };
}

export function buildApiQuery(intent: ParsedIntent, pageToken?: string): URLSearchParams {
  const params = new URLSearchParams();

  params.set('filter.overallStatus', 'RECRUITING');
  params.set('pageSize', '10');

  if (intent.condition) {
    params.set('query.cond', intent.condition);
  }

  const termParts = [...intent.modifiers, ...intent.clinicalSynonyms];
  if (termParts.length > 0) {
    params.set('query.term', termParts.join(' '));
  }

  if (intent.location) {
    params.set('query.locn', intent.location);
  }

  if (pageToken) {
    params.set('pageToken', pageToken);
  }

  // Add fields parameter (from Phase 1 Task 1.6)
  params.set('fields', [
    'NCTId','BriefTitle','OfficialTitle','OverallStatus','BriefSummary',
    'DetailedDescription','Condition','Phase','StudyType','MinimumAge',
    'MaximumAge','Sex','EligibilityCriteria','LeadSponsorName','StartDate',
    'CompletionDate','LocationCity','LocationState','LocationCountry',
    'LocationFacility','InterventionName','InterventionType','EnrollmentCount',
  ].join(','));

  return params;
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
