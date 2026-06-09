import { Router, Request, Response } from 'express';
import { extractSearchTerms, simplifySummary, summarizeCriteria } from '../utils/search-helpers';
import type { Study, TrialResult } from '../types';

export const searchRouter = Router();

searchRouter.get('/', async (req: Request, res: Response) => {
  const query = req.query.q as string | undefined;

  if (!query || query.trim().length === 0) {
    return res.json({ results: [] });
  }

  const searchTerm = extractSearchTerms(query);

  if (!searchTerm) {
    return res.json({ results: [] });
  }

  try {
    const url = `https://clinicaltrials.gov/api/v2/studies?filter.overallStatus=RECRUITING&pageSize=5&query.term=${encodeURIComponent(searchTerm)}`;

    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`ClinicalTrials.gov API returned ${response.status}`);
    }

    const data = await response.json();
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

    return res.json({ results });
  } catch (error) {
    console.error('ClinicalTrials.gov API error:', error);
    return res.status(500).json({
      results: [],
      error: 'Failed to fetch trial data. Please try again.',
    });
  }
});
