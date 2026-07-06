import { ParsedIntent } from '../types';

export function humanizePhase(phases?: string[]): string {
  const phase = phases?.[0];
  const map: Record<string, string> = {
    EARLY_PHASE1: 'Pre-Phase 1 · Earliest safety testing',
    PHASE1: 'Phase 1 · Safety and dosage testing',
    PHASE2: 'Phase 2 · Effectiveness testing',
    PHASE3: 'Phase 3 · Large-scale confirmation',
    PHASE4: 'Phase 4 · Long-term monitoring',
    NA: 'Not applicable',
  };
  return map[phase ?? ''] ?? 'Not specified';
}

export function calculateDuration(
  startDate?: { date?: string },
  completionDate?: { date?: string }
): string {
  if (!startDate?.date || !completionDate?.date) return 'Duration not specified';

  const start = new Date(startDate.date);
  const end = new Date(completionDate.date);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 'Duration not specified';
  if (end <= start) return 'Duration not specified';

  const totalMonths = Math.round(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
  );

  if (totalMonths < 1) return 'Less than 1 month';
  if (totalMonths === 1) return '~1 month';
  if (totalMonths < 12) return `~${totalMonths} months`;

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  if (months === 0) return `~${years} year${years > 1 ? 's' : ''}`;
  return `~${years} year${years > 1 ? 's' : ''}, ${months} month${months > 1 ? 's' : ''}`;
}

export function detectCompensation(
  briefSummary?: string,
  detailedDescription?: string,
  eligibilityCriteria?: string
): string {
  const text = [briefSummary, detailedDescription, eligibilityCriteria]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const compensationPattern = /compensat|reimburse|stipend|\bpayment\b|\bpaid\b|\$\s*\d/;

  if (compensationPattern.test(text)) {
    return 'Compensation may be available — confirm with study team';
  }
  return 'Not specified — contact study team for details';
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

  // Add fields parameter
  params.set('fields', [
    'NCTId','BriefTitle','OfficialTitle','OverallStatus','BriefSummary',
    'DetailedDescription','Condition','Phase','StudyType','MinimumAge',
    'MaximumAge','Sex','EligibilityCriteria','LeadSponsorName','StartDate',
    'CompletionDate','LocationCity','LocationState','LocationCountry',
    'LocationFacility','InterventionName','InterventionType','EnrollmentCount',
  ].join(','));

  return params;
}
