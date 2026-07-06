import { Router, Request, Response } from 'express';
import { simplifySummary, summarizeCriteria } from '../utils/search-helpers';
import type { Study, TrialResult } from '../types';
import {
  humanizePhase,
  calculateDuration,
  detectCompensation,
  parseNaturalLanguage,
  buildApiQuery
} from '@findmytrial/shared';


// TODO Phase 3: extract to shared/utils/fetch-with-retry.ts
async function fetchWithRetry(
  url: string,
  maxRetries = 2,
  baseDelay = 1000
): Promise<globalThis.Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await globalThis.fetch(url, {
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

export const searchRouter = Router();

searchRouter.get('/', async (req: Request, res: Response) => {
  const query = req.query.q as string | undefined;

  if (!query || query.trim().length === 0) {
    return res.json({ results: [] });
  }

  const intent = parseNaturalLanguage(query);

  if (!intent.condition && intent.modifiers.length === 0 && intent.clinicalSynonyms.length === 0) {
    return res.json({ results: [] });
  }

  const params = buildApiQuery(intent);
  const ctgovUrl = `https://clinicaltrials.gov/api/v2/studies?${params.toString()}`;

  try {
    const response = await fetchWithRetry(ctgovUrl);

    if (!response.ok) {
      return res.status(503).json({
        error: 'The trial database is temporarily unavailable. Please try again in a moment.',
        code: 'API_ERROR'
      });
    }

    const data = (await response.json()) as { studies?: Study[] };
    const studies: Study[] = data.studies || [];

    const results: TrialResult[] = studies.map((study) => {
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

    return res.json({ results });
  } catch (error) {
    console.error('ClinicalTrials.gov API error:', error);

    const isTimeout = error instanceof Error && error.name === 'TimeoutError';

    return res.status(503).json({
      error: isTimeout
        ? 'The trial database is responding slowly. Please try again in a moment.'
        : 'Unable to reach the trial database. Please check your connection and try again.',
      code: isTimeout ? 'TIMEOUT' : 'NETWORK_ERROR'
    });
  }
});
