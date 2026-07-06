export interface StudyProtocolSection {
  identificationModule?: {
    briefTitle?: string;
    nctId?: string;
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
      city?: string;
      stateOrProvince?: string;
      country?: string;
    }>;
  };
}

export interface Study {
  protocolSection?: StudyProtocolSection;
}

export interface TrialResult {
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
