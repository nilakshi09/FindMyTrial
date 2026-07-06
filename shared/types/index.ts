export interface TrialData {
  nctId: string;
  title: string;
  status: string;
  conditions: string[];
  phase: string;
  summary: string;
  location: string;
  duration: string;
  compensation: string;
  ages: string;
}

export interface SavedTrial {
  nctId: string;
  trial: TrialData;
  savedAt: string;
  notes: string;
}

export interface StudyProtocolSection {
  identificationModule?: {
    briefTitle?: string;
    nctId?: string;
    officialTitle?: string;
  };
  statusModule?: {
    overallStatus?: string;
    startDateStruct?: { date?: string };
    completionDateStruct?: { date?: string };
  };
  conditionsModule?: {
    conditions?: string[];
  };
  designModule?: {
    phases?: string[];
    studyType?: string;
    enrollmentInfo?: { count?: number };
  };
  descriptionModule?: {
    briefSummary?: string;
    detailedDescription?: string;
  };
  eligibilityModule?: {
    eligibilityCriteria?: string;
    sex?: string;
    minimumAge?: string;
    maximumAge?: string;
  };
  contactsLocationsModule?: {
    locations?: Array<{
      facility?: string;
      city?: string;
      stateOrProvince?: string;
      state?: string;
      country?: string;
      status?: string;
    }>;
  };
  sponsorCollaboratorsModule?: {
    leadSponsor?: { name?: string };
  };
  armsInterventionsModule?: {
    interventions?: Array<{
      type?: string;
      name?: string;
      description?: string;
    }>;
  };
}

export interface ParsedIntent {
  condition: string;
  modifiers: string[];
  clinicalSynonyms: string[];
  location?: string;
}

export interface SearchResponse {
  results: TrialData[];
  nextPageToken?: string;
  totalCount?: number;
  query?: string;
}

export interface ErrorResponse {
  error: string;
  code: string;
}
