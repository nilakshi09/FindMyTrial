export interface StudyProtocolSection {
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

export interface Study {
  protocolSection?: StudyProtocolSection;
}

export interface TrialResult {
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
