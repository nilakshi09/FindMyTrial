import { NextRequest, NextResponse } from 'next/server';

interface StudyProtocolSection {
  identificationModule?: {
    briefTitle?: string;
    nctId?: string;
  };
  statusModule?: {
    overallStatus?: string;
  };
  conditionsModule?: {
    conditions?: string[];
  };
  designModule?: {
    phases?: string[];
  };
  descriptionModule?: {
    briefSummary?: string;
  };
  eligibilityModule?: {
    eligibilityCriteria?: string;
    sex?: string;
    minimumAge?: string;
    maximumAge?: string;
  };
  contactsLocationsModule?: {
    locations?: Array<{
      city?: string;
      stateOrProvince?: string;
      country?: string;
    }>;
  };
}

interface Study {
  protocolSection?: StudyProtocolSection;
}

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

function extractSearchTerms(input: string): string {
  const words = input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
  return words.join(' ');
}

function summarizeCriteria(criteria: string): string {
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

function simplifySummary(summary: string): string {
  if (!summary) return 'No summary available.';
  const cleaned = summary.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= 250) return cleaned;
  const truncated = cleaned.substring(0, 247);
  const lastPeriod = truncated.lastIndexOf('.');
  if (lastPeriod > 100) return truncated.substring(0, lastPeriod + 1);
  return truncated + '...';
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query || query.trim().length === 0) {
    return NextResponse.json({ results: [] });
  }

  const searchTerm = extractSearchTerms(query);

  if (!searchTerm) {
    return NextResponse.json({ results: [] });
  }

  try {
    const url = `https://clinicaltrials.gov/api/v2/studies?filter.overallStatus=RECRUITING&pageSize=5&query.term=${encodeURIComponent(searchTerm)}`;

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    const studies: Study[] = data.studies || [];

    const results = studies.map((study) => {
      const p = study.protocolSection || {};
      const id = p.identificationModule || {};
      const status = p.statusModule || {};
      const conditions = p.conditionsModule || {};
      const design = p.designModule || {};
      const desc = p.descriptionModule || {};
      const elig = p.eligibilityModule || {};
      const loc = p.contactsLocationsModule || {};

      const firstLocation = loc.locations?.[0];
      const locationStr = firstLocation
        ? [firstLocation.city, firstLocation.stateOrProvince]
            .filter(Boolean)
            .join(', ')
        : 'Location not specified';

      const phases = design.phases?.filter((p) => p) || [];
      const phaseStr = phases.length > 0 ? phases.join(' / ') : '';

      const ageRange = [
        elig.minimumAge || '',
        elig.maximumAge || '',
      ]
        .filter(Boolean)
        .join('\u2013')
        .replace(/ Years?/g, '')
        .replace(/ Months?/g, ' mo');

      const agesStr = ageRange
        ? `Ages ${ageRange}`
        : summarizeCriteria(elig.eligibilityCriteria || '').substring(0, 50);

      return {
        title: id.briefTitle || 'Untitled Trial',
        status: status.overallStatus || 'Unknown',
        conditions: conditions.conditions || [],
        phase: phaseStr,
        summary: simplifySummary(desc.briefSummary || ''),
        location: locationStr,
        duration: '',
        compensation: '',
        ages: agesStr,
      };
    });

    return NextResponse.json({ results });
  } catch (error) {
    console.error('ClinicalTrials.gov API error:', error);
    return NextResponse.json(
      { results: [], error: 'Failed to fetch trial data. Please try again.' },
      { status: 500 }
    );
  }
}
