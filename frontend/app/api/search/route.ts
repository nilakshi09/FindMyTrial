import { NextRequest, NextResponse } from 'next/server';
import { redis, buildCacheKey } from '@/lib/redis';
import {
  StudyProtocolSection,
  ParsedIntent,
  humanizePhase,
  calculateDuration,
  detectCompensation,
  parseNaturalLanguage,
  buildApiQuery,
} from '@findmytrial/shared';

export const dynamic = 'force-dynamic';

interface Study {
  protocolSection?: StudyProtocolSection;
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



// TODO Phase 3: extract to shared/utils/fetch-with-retry.ts
async function fetchWithRetry(
  url: string,
  maxRetries = 2,
  baseDelay = 1000
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(10000),
      });

      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('Retry-After') ?? '30');
        await new Promise(r => setTimeout(r, retryAfter * 1000));
        continue;
      }

      if (response.status >= 500 && attempt < maxRetries) {
        await new Promise(r => setTimeout(r, baseDelay * Math.pow(2, attempt)));
        continue;
      }

      return response;
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, baseDelay * Math.pow(2, attempt)));
      }
    }
  }

  throw lastError ?? new Error('Request failed after retries');
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get('q');
  const locationParam = searchParams.get('location') ?? '';
  const pageToken = searchParams.get('pageToken') ?? undefined;

  if (!q || q.trim().length < 3) {
    return NextResponse.json(
      { error: 'Query must be at least 3 characters', code: 'QUERY_TOO_SHORT' },
      { status: 400 }
    );
  }

  const sanitizedQuery = q
    .replace(/<[^>]*>/g, '')        // remove HTML tags
    .replace(/javascript:/gi, '')    // remove javascript: protocol
    .trim();

  const intent = parseNaturalLanguage(sanitizedQuery);

  // Explicit location input fills in when query text has no embedded location
  if (!intent.location && locationParam.trim()) {
    intent.location = locationParam.trim();
  }

  if (!intent.condition && intent.modifiers.length === 0 && intent.clinicalSynonyms.length === 0) {
    return NextResponse.json({ results: [] });
  }

  // Check cache (skip for paginated requests)
  if (!pageToken) {
    const cacheKey = buildCacheKey(sanitizedQuery, locationParam);
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        console.log('[Cache] HIT:', cacheKey);
        return NextResponse.json(cached);
      }
    } catch (cacheError) {
      // Cache miss or Redis unavailable — continue to live fetch
      console.warn('[Cache] Redis error:', cacheError);
    }
  }

  const params = buildApiQuery(intent, pageToken);
  const ctgovUrl = `https://clinicaltrials.gov/api/v2/studies?${params.toString()}`;

  try {
    const response = await fetchWithRetry(ctgovUrl);

    if (!response.ok) {
      return NextResponse.json(
        {
          error: 'The trial database is temporarily unavailable. Please try again in a moment.',
          code: 'API_ERROR'
        },
        { status: 503 }
      );
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

      const phaseStr = humanizePhase(design.phases);

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
        nctId: id.nctId ?? '',
        title: id.briefTitle || 'Untitled Trial',
        status: status.overallStatus || 'Unknown',
        conditions: conditions.conditions || [],
        phase: phaseStr,
        summary: simplifySummary(desc.briefSummary || ''),
        location: locationStr,
        duration: calculateDuration(
          study.protocolSection?.statusModule?.startDateStruct,
          study.protocolSection?.statusModule?.completionDateStruct
        ),
        compensation: detectCompensation(
          study.protocolSection?.descriptionModule?.briefSummary,
          study.protocolSection?.descriptionModule?.detailedDescription,
          study.protocolSection?.eligibilityModule?.eligibilityCriteria
        ),
        ages: agesStr,
      };
    });

    const nextPageToken = data.nextPageToken ?? undefined;

    const responsePayload = {
      results,
      nextPageToken,
      totalCount: data.totalCount,
      query: sanitizedQuery,
    };

    // Store in cache — 5 minute TTL (skip for paginated requests)
    if (!pageToken) {
      const cacheKey = buildCacheKey(sanitizedQuery, locationParam);
      try {
        await redis.setex(cacheKey, 300, responsePayload);
        console.log('[Cache] SET:', cacheKey);
      } catch (cacheError) {
        // Non-fatal — continue without caching
        console.warn('[Cache] Could not cache result:', cacheError);
      }
    }

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error('ClinicalTrials.gov API error:', error);

    const isTimeout = error instanceof Error && error.name === 'TimeoutError';

    return NextResponse.json(
      {
        error: isTimeout
          ? 'The trial database is responding slowly. Please try again in a moment.'
          : 'Unable to reach the trial database. Please check your connection and try again.',
        code: isTimeout ? 'TIMEOUT' : 'NETWORK_ERROR'
      },
      { status: 503 }
    );
  }
}
