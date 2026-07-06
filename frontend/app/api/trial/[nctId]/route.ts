import { NextRequest, NextResponse } from 'next/server';
import {
  humanizePhase,
  calculateDuration,
  detectCompensation
} from '@findmytrial/shared';

export async function GET(
  request: NextRequest,
  { params }: { params: { nctId: string } }
) {
  const { nctId } = params;

  if (!nctId || !nctId.startsWith('NCT')) {
    return NextResponse.json(
      { error: 'Invalid NCT ID', code: 'INVALID_ID' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://clinicaltrials.gov/api/v2/studies/${nctId}`,
      { signal: AbortSignal.timeout(10000) }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Trial not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const data = await response.json();
    const study = data.protocolSection;

    // Extract all locations (not just the first one)
    const allLocations = (
      study?.contactsLocationsModule?.locations ?? []
    ).map((loc: any) => ({
      facility: loc.facility ?? '',
      city: loc.city ?? '',
      state: loc.state ?? '',
      country: loc.country ?? '',
      status: loc.status ?? '',
    }));

    // Extract interventions
    const interventions = (
      study?.armsInterventionsModule?.interventions ?? []
    ).map((i: any) => ({
      type: i.type ?? '',
      name: i.name ?? '',
      description: i.description ?? '',
    }));

    // Full eligibility criteria (untruncated)
    const eligibilityCriteria =
      study?.eligibilityModule?.eligibilityCriteria ?? '';

    const detailData = {
      nctId,
      title: study?.identificationModule?.briefTitle ?? '',
      officialTitle: study?.identificationModule?.officialTitle ?? '',
      status: study?.statusModule?.overallStatus ?? '',
      phase: humanizePhase(study?.designModule?.phases),
      conditions: study?.conditionsModule?.conditions ?? [],
      briefSummary: study?.descriptionModule?.briefSummary ?? '',
      detailedDescription: study?.descriptionModule?.detailedDescription ?? '',
      eligibilityCriteria,
      minimumAge: study?.eligibilityModule?.minimumAge ?? '',
      maximumAge: study?.eligibilityModule?.maximumAge ?? '',
      sex: study?.eligibilityModule?.sex ?? '',
      enrollmentCount: study?.designModule?.enrollmentInfo?.count ?? null,
      studyType: study?.designModule?.studyType ?? '',
      sponsor: study?.sponsorCollaboratorsModule?.leadSponsor?.name ?? '',
      duration: calculateDuration(
        study?.statusModule?.startDateStruct,
        study?.statusModule?.completionDateStruct
      ),
      compensation: detectCompensation(
        study?.descriptionModule?.briefSummary,
        study?.descriptionModule?.detailedDescription,
        study?.eligibilityModule?.eligibilityCriteria
      ),
      locations: allLocations,
      interventions,
      startDate: study?.statusModule?.startDateStruct?.date ?? '',
      completionDate: study?.statusModule?.completionDateStruct?.date ?? '',
    };

    return NextResponse.json(detailData);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch trial details', code: 'FETCH_ERROR' },
      { status: 503 }
    );
  }
}


