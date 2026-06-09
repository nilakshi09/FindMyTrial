# FindMyTrial — Technical Specification

> **Version**: 1.0  
> **Last Updated**: 2026-06-09  
> **Derived from**: [idea.md](./idea.md) · [requirements.md](./requirements.md)  
> **Status**: Draft

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture](#2-architecture)
3. [Data Models & Interfaces](#3-data-models--interfaces)
4. [ClinicalTrials.gov API Integration](#4-clinicaltrialsgov-api-integration)
5. [Frontend Architecture](#5-frontend-architecture)
6. [Backend Architecture](#6-backend-architecture)
7. [Feature Specifications](#7-feature-specifications)
8. [Error Handling & Resilience](#8-error-handling--resilience)
9. [Performance Strategy](#9-performance-strategy)
10. [Security & Privacy](#10-security--privacy)
11. [Deployment Architecture](#11-deployment-architecture)
12. [Gap Analysis — Current State vs Requirements](#12-gap-analysis--current-state-vs-requirements)
13. [Implementation Roadmap](#13-implementation-roadmap)

---

## 1. System Overview

FindMyTrial is a patient-facing web application that bridges the gap between ClinicalTrials.gov's regulatory database and the patients who could benefit from its data. The system accepts natural language input, queries the ClinicalTrials.gov API v2 in real time, filters for actively recruiting trials, and rewrites results in plain English.

### 1.1 Design Principles

| Principle | Implication |
|-----------|-------------|
| **Patient-first** | Every design decision optimizes for non-expert comprehension |
| **Zero friction** | No accounts, no paywalls, no setup — immediate search |
| **Real-time data** | No stale caches; every search hits the live ClinicalTrials.gov API |
| **Graceful degradation** | Upstream API failures produce helpful messages, not broken UIs |
| **Privacy by default** | No PII collected; saved data stays in the browser (MVP) |

### 1.2 Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend Framework** | Next.js (App Router) | 13.5.1 |
| **UI Library** | React | 18.2.0 |
| **Language** | TypeScript | 5.2.2 |
| **Styling** | Tailwind CSS + shadcn/ui (Radix UI primitives) | 3.x + latest |
| **Backend Framework** | Express.js | 4.18.x |
| **Data Source** | ClinicalTrials.gov API v2 | OpenAPI 3.0 |
| **Fonts** | Inter (body) + Playfair Display (headings) | Google Fonts |
| **Icons** | lucide-react | latest |
| **Deployment** | Netlify | — |

---

## 2. Architecture

### 2.1 High-Level Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                          CLIENT (Browser)                        │
│                                                                  │
│   ┌──────────┐   ┌──────────────┐   ┌─────────────────────┐     │
│   │  Navbar   │   │   Hero       │   │   SearchResults     │     │
│   │          │   │  (Search Bar)│   │   └─ TrialCard[]    │     │
│   └──────────┘   └──────┬───────┘   └──────────▲──────────┘     │
│                          │                      │                 │
│                          │  fetch()             │  TrialData[]    │
│                          ▼                      │                 │
│   ┌─────────────────────────────────────────────┘                │
│   │                 Local State (useState)                        │
│   │   results: TrialData[]                                       │
│   │   isLoading: boolean                                         │
│   │   hasSearched: boolean                                       │
│   │                                                              │
│   │   [Future] localStorage for saved trials                     │
│   └──────────────────────────────────────────────────────────────┘
└───────────────────────────┬──────────────────────────────────────┘
                            │
                   HTTP GET /api/search?q=...
                            │
                            ▼
┌───────────────────────────────────────────────────────────────────┐
│                   SERVER (Next.js API Route)                      │
│                   app/api/search/route.ts                         │
│                                                                   │
│   1. Extract search terms (stop word removal)                     │
│   2. Build ClinicalTrials.gov API query                           │
│   3. Fetch results (filter: RECRUITING)                           │
│   4. Transform response → TrialData[]                             │
│   5. Return JSON                                                  │
└───────────────────────────┬───────────────────────────────────────┘
                            │
              HTTP GET /api/v2/studies?...
                            │
                            ▼
┌───────────────────────────────────────────────────────────────────┐
│               ClinicalTrials.gov API v2                           │
│               https://clinicaltrials.gov/api/v2                   │
│                                                                   │
│   • No auth required                                              │
│   • ~50 req/min rate limit                                        │
│   • Data refreshes daily (Mon–Fri)                                │
│   • Token-based pagination                                        │
└───────────────────────────────────────────────────────────────────┘
```

### 2.2 Dual Server Design

The project has **two redundant search implementations**:

| Path | Entry Point | When Used |
|------|------------|-----------|
| **Primary** | `frontend/app/api/search/route.ts` | Default — Next.js serverless function, called by frontend via `fetch('/api/search')` |
| **Secondary** | `backend/src/routes/search.ts` | Optional standalone Express server on port 3001, identical logic |

> **Decision**: The frontend API route is self-contained. The backend exists for scenarios where the API needs to be deployed independently (e.g., shared across multiple frontends or for background jobs like alerts).

### 2.3 Request Flow (Search)

```
User types query → Hero.onSearch(query)
  → page.tsx handleSearch(query)
    → fetch(`/api/search?q=${encodeURIComponent(query)}`)
      → route.ts GET handler
        → extractSearchTerms(query)
          → remove stop words, punctuation, short words
          → join remaining terms with "+"
        → fetch(`https://clinicaltrials.gov/api/v2/studies?
              filter.overallStatus=RECRUITING
              &pageSize=5
              &query.term=${terms}`)
        → parse response.studies[]
        → map each study → TrialData object
        → return { results: TrialData[] }
    → setResults(data.results)
    → scroll to #search-results
```

---

## 3. Data Models & Interfaces

### 3.1 Core Types

#### `TrialData` — Frontend display model

```typescript
interface TrialData {
  title: string;         // briefTitle from API
  status: string;        // overallStatus (e.g., "RECRUITING")
  conditions: string[];  // conditions array (e.g., ["Lupus", "SLE"])
  phase: string;         // human-readable phase (e.g., "Phase 2")
  summary: string;       // briefSummary, truncated to 250 chars at sentence boundary
  location: string;      // first location's "city, state" or "Location not specified"
  duration: string;      // ⚠️ currently always "" — not extracted from API
  compensation: string;  // ⚠️ currently always "" — not extracted from API
  ages: string;          // formatted age range (e.g., "18 – 65 years")
}
```

#### `StudyProtocolSection` — ClinicalTrials.gov API response mapping

```typescript
interface StudyProtocolSection {
  identificationModule?: {
    nctId?: string;
    briefTitle?: string;
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
    studyType?: string;
    phases?: string[];
    enrollmentInfo?: { count?: number; type?: string };
  };
  eligibilityModule?: {
    eligibilityCriteria?: string;
    sex?: string;
    minimumAge?: string;
    maximumAge?: string;
    healthyVolunteers?: string;
  };
  descriptionModule?: {
    briefSummary?: string;
    detailedDescription?: string;
  };
  contactsLocationsModule?: {
    locations?: Array<{
      facility?: string;
      city?: string;
      state?: string;
      country?: string;
      zip?: string;
      status?: string;
      geoPoint?: { lat?: number; lon?: number };
    }>;
  };
  armsInterventionsModule?: {
    interventions?: Array<{
      type?: string;
      name?: string;
      description?: string;
    }>;
  };
  sponsorCollaboratorsModule?: {
    leadSponsor?: { name?: string };
  };
}
```

### 3.2 Extended Types (Post-MVP)

#### `SavedTrial` — Local storage persistence

```typescript
interface SavedTrial {
  nctId: string;            // unique identifier
  trial: TrialData;         // full trial data snapshot
  savedAt: string;          // ISO 8601 timestamp
  notes?: string;           // user's personal notes
}
```

#### `SearchAlert` — Notification subscription

```typescript
interface SearchAlert {
  id: string;               // UUID
  query: string;            // original search text
  location?: string;        // optional location filter
  frequency: 'daily' | 'weekly';
  email: string;            // notification recipient
  createdAt: string;        // ISO 8601
  lastCheckedAt?: string;   // ISO 8601
}
```

### 3.3 API Response Envelope

```typescript
// Internal API response
interface SearchResponse {
  results: TrialData[];
  totalCount?: number;       // total matching studies (from API)
  nextPageToken?: string;    // for pagination
  query: string;             // echo back the processed query
}

// Error response
interface ErrorResponse {
  error: string;             // human-readable error message
  code: string;              // machine-readable error code
  details?: string;          // additional context
}
```

---

## 4. ClinicalTrials.gov API Integration

### 4.1 API Overview

| Property | Value |
|----------|-------|
| **Base URL** | `https://clinicaltrials.gov/api/v2` |
| **Auth** | None required |
| **Rate Limit** | ~50 requests/minute/IP |
| **Rate Limit Response** | HTTP 429 Too Many Requests |
| **Data Freshness** | Daily refresh (Monday–Friday) |
| **Spec** | OpenAPI 3.0 ([YAML](https://clinicaltrials.gov/api/oas/v2/ctg-oas-v2.yaml)) |

### 4.2 Endpoints Used

#### `GET /studies` — Search trials

| Parameter | Type | Usage in FindMyTrial |
|-----------|------|---------------------|
| `query.term` | string | General full-text search (processed user input) |
| `query.cond` | string | Condition-specific search (extracted from NLP) |
| `query.locn` | string | Location text search (user-provided city/state) |
| `filter.overallStatus` | string | Always `RECRUITING` (hardcoded) |
| `filter.geo` | string | Geographic radius: `distance(lat,lon,radiusMi)` |
| `filter.phase` | string | Phase filter: `PHASE1`, `PHASE2`, `PHASE3` |
| `pageSize` | integer | Results per page (currently 5, should be 10–20) |
| `pageToken` | string | Token for next page |
| `fields` | string | Comma-separated field list to reduce payload size |

#### `GET /studies/{nctId}` — Single trial detail

Used for the trial detail page (future) and for generating shareable summaries.

#### `GET /stats/field/values` — Enum values

Used at build time or on-demand to validate filter options (e.g., valid phase values).

### 4.3 Query Construction Strategy

**Current approach** (basic):
```
User input → remove stop words → join with "+" → query.term
```

**Target approach** (improved NLP):
```
User input: "I have stage 2 lupus and standard treatment stopped working"
                    │
                    ▼
         ┌──────────────────┐
         │  extractIntent() │
         └────────┬─────────┘
                  │
    ┌─────────────┼─────────────┐
    ▼             ▼             ▼
 condition    modifiers     context
 "lupus"     "stage 2"    "treatment resistant"
    │             │             │
    ▼             ▼             ▼
 query.cond   query.term   query.term
 "lupus"      "stage 2     "refractory OR
               lupus"       treatment resistant"
```

**Improved term extraction should**:
1. Identify the primary condition (use for `query.cond`)
2. Preserve medical modifiers (stage, grade, type) in `query.term`
3. Map patient language to clinical synonyms (e.g., "stopped working" → "refractory")
4. Extract location if embedded in query (e.g., "trials near Chicago")

### 4.4 Response Transformation

ClinicalTrials.gov returns deeply nested JSON. The transformation pipeline:

```
API Response (protocolSection)
  │
  ├─ identificationModule.nctId        → nctId
  ├─ identificationModule.briefTitle   → title
  ├─ statusModule.overallStatus        → status
  ├─ conditionsModule.conditions[]     → conditions
  ├─ designModule.phases[]             → phase (humanized)
  ├─ descriptionModule.briefSummary    → summary (truncated)
  ├─ eligibilityModule.minimumAge      ┐
  ├─ eligibilityModule.maximumAge      ┤→ ages (formatted range)
  ├─ eligibilityModule.sex             → eligibleSex
  ├─ contactsLocationsModule           ┐
  │   .locations[0].city               ┤→ location
  │   .locations[0].state              ┘
  ├─ statusModule.startDateStruct      ┐
  ├─ statusModule.completionDateStruct ┤→ duration (calculated)
  ├─ armsInterventionsModule           → interventions (what's being tested)
  └─ sponsorCollaboratorsModule        → sponsor
```

### 4.5 Phase Humanization

| API Value | Display Text | Plain English Description |
|-----------|-------------|--------------------------|
| `EARLY_PHASE1` | Pre-Phase 1 | Earliest safety testing in humans |
| `PHASE1` | Phase 1 | Testing safety and dosage in a small group |
| `PHASE2` | Phase 2 | Testing effectiveness and side effects |
| `PHASE3` | Phase 3 | Large-scale testing to confirm effectiveness |
| `PHASE4` | Phase 4 | Post-approval monitoring of long-term effects |
| `NA` | N/A | Phase not applicable (observational studies) |
| *(missing)* | Not specified | Phase information not provided |

### 4.6 Field Selection (Payload Optimization)

To reduce response size, use the `fields` parameter to request only the fields we need:

```
fields=NCTId,BriefTitle,OfficialTitle,OverallStatus,BriefSummary,
  Condition,Phase,StudyType,MinimumAge,MaximumAge,Sex,
  EligibilityCriteria,LeadSponsorName,StartDate,CompletionDate,
  LocationCity,LocationState,LocationCountry,LocationFacility,
  InterventionName,InterventionType,EnrollmentCount
```

---

## 5. Frontend Architecture

### 5.1 Directory Structure

```
frontend/
├── app/
│   ├── layout.tsx                 # Root layout (fonts, metadata, global styles)
│   ├── page.tsx                   # Main page (single-page app, state management)
│   ├── globals.css                # CSS variables, keyframes, custom animations
│   └── api/
│       └── search/
│           └── route.ts           # API route: search → ClinicalTrials.gov → TrialData[]
├── components/
│   ├── Navbar.tsx                 # Fixed nav, scroll blur, mobile hamburger
│   ├── Hero.tsx                   # Gradient hero, search bar, trust pills
│   ├── SearchResults.tsx          # Results container (loading/empty/grid states)
│   ├── TrialCard.tsx              # Individual trial display card
│   ├── HowItWorks.tsx             # 3-step explainer section
│   ├── SampleTrials.tsx           # Hardcoded example trials
│   ├── Testimonials.tsx           # Social proof section
│   ├── FAQ.tsx                    # Accordion FAQ
│   ├── FinalCTA.tsx               # Bottom call-to-action
│   ├── Footer.tsx                 # Links, disclaimer
│   └── ui/                        # 47 shadcn/ui Radix primitives
├── hooks/
│   ├── use-scroll-animation.ts    # IntersectionObserver entrance animations
│   └── use-toast.ts               # Toast notification system (unused)
├── lib/
│   └── utils.ts                   # cn() — clsx + tailwind-merge
├── tailwind.config.ts             # Custom theme (ivory/navy/amber palette)
├── next.config.js                 # ESLint skip, unoptimized images
├── components.json                # shadcn/ui config
├── netlify.toml                   # Netlify deployment config
├── package.json
└── tsconfig.json
```

### 5.2 Design System

#### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `ivory` | `#FAF7F2` | Page background |
| `navy` | `#0F1F3D` | Primary text, headings, dark sections |
| `amber` | `#C8922A` | Accent, CTAs, interactive highlights |
| `slate` | `#5A6475` | Secondary text, muted labels |
| `warm-gray` | `#E8E2D9` | Borders, dividers, card backgrounds |

#### Typography

| Element | Font | Weight | Size |
|---------|------|--------|------|
| Body text | Inter | 400 | 16px (1rem) |
| Headings (h1–h3) | Playfair Display | 700 | 2.5rem–4rem |
| Labels / small text | Inter | 500 | 14px (0.875rem) |
| Monospace / IDs | System mono | 400 | 13px |

#### Animation Library

| Animation | Trigger | Duration | Usage |
|-----------|---------|----------|-------|
| `hero-gradient-drift` | Page load | 15s infinite | Hero background gradient |
| `shimmer-sweep` | Hover | 0.6s | CTA button shimmer highlight |
| `amber-ring-pulse` | Hover | 1.5s infinite | How It Works step circles |
| `fade-in-up` | IntersectionObserver | 0.6s | Section entrance animation |
| `word-fade-in` | IntersectionObserver | 0.5s per word | FinalCTA staggered text |
| `pulse-glow` | Continuous | 2s infinite | CTA button ambient glow |
| `pulse-dot` | Continuous | 2s infinite | "Live data" indicator badge |
| `line-grow` | IntersectionObserver | 1s | How It Works connecting line |

### 5.3 Component Hierarchy

```
<RootLayout>                        ← layout.tsx (fonts, metadata)
  └─ <HomePage>                     ← page.tsx (client component, state)
       ├─ <Navbar />                ← fixed, scroll-aware
       ├─ <Hero onSearch isLoading />
       │     ├─ gradient background
       │     ├─ live data badge
       │     ├─ animated headline
       │     ├─ search input + submit button
       │     └─ trust pills (CountUpNumber)
       ├─ <SearchResults results isLoading hasSearched />
       │     └─ <TrialCard trial={...} />[]  ← responsive grid
       ├─ <HowItWorks />
       ├─ <SampleTrials />
       │     └─ <TrialCard />[] (hardcoded data)
       ├─ <Testimonials />
       ├─ <FAQ />
       ├─ <FinalCTA />
       └─ <Footer />
```

### 5.4 State Management

**Current**: React `useState` in `page.tsx` — minimal and appropriate for MVP.

```typescript
// page.tsx state
const [results, setResults] = useState<TrialData[]>([]);
const [isLoading, setIsLoading] = useState(false);
const [hasSearched, setHasSearched] = useState(false);
```

**Post-MVP additions**:

| State | Storage | Purpose |
|-------|---------|---------|
| `savedTrials` | `localStorage` | Bookmarked trials persisted across sessions |
| `searchHistory` | `localStorage` | Recent searches for quick re-query |
| `userLocation` | `sessionStorage` | Cached location for filtering |
| `alertSubscriptions` | Backend DB | Email alert configurations |

**localStorage schema** (post-MVP):

```typescript
// Key: "findmytrial_saved"
// Value: JSON string of SavedTrial[]
{
  "findmytrial_saved": [
    {
      "nctId": "NCT04852770",
      "trial": { /* TrialData */ },
      "savedAt": "2026-06-09T15:00:00Z",
      "notes": "Ask Dr. Smith about this one"
    }
  ]
}

// Key: "findmytrial_history"
// Value: JSON string of { query: string, timestamp: string }[]
{
  "findmytrial_history": [
    { "query": "stage 2 lupus", "timestamp": "2026-06-09T15:00:00Z" }
  ]
}
```

### 5.5 Routing

**Current**: Single-page app — no client-side routing. All content on `page.tsx` with anchor-scroll navigation.

**Post-MVP route additions**:

| Route | Purpose |
|-------|---------|
| `/` | Home — search + landing page |
| `/trial/[nctId]` | Trial detail page (full plain English breakdown) |
| `/saved` | Saved trials list |
| `/alerts` | Manage search alert subscriptions |
| `/share/[shareId]` | Public shareable trial summary |

---

## 6. Backend Architecture

### 6.1 Directory Structure

```
backend/
├── src/
│   ├── index.ts                   # Express app entry (CORS, routes, health check)
│   ├── routes/
│   │   └── search.ts              # GET /api/search — mirrors frontend API route
│   ├── utils/
│   │   └── search-helpers.ts      # extractSearchTerms, summarizeCriteria, simplifySummary
│   └── types/
│       └── index.ts               # StudyProtocolSection, Study, TrialResult interfaces
├── package.json
└── tsconfig.json
```

### 6.2 Express Server Configuration

```typescript
// Port: process.env.PORT || 3001
// CORS: allows process.env.FRONTEND_URL || 'http://localhost:3000'
// Body parser: express.json()
// Routes:
//   GET /api/search?q=<query>  → searchRouter
//   GET /api/health            → { status: 'ok', timestamp }
```

### 6.3 Backend Expansion Plan (Post-MVP)

The Express backend becomes essential once features require server-side persistence:

| Endpoint | Method | Purpose | Phase |
|----------|--------|---------|-------|
| `/api/search` | GET | Search trials (existing) | MVP |
| `/api/health` | GET | Health check (existing) | MVP |
| `/api/trial/:nctId` | GET | Fetch single trial detail | MVP |
| `/api/alerts` | POST | Create a new search alert | v1.x |
| `/api/alerts` | GET | List user's active alerts | v1.x |
| `/api/alerts/:id` | DELETE | Remove an alert | v1.x |
| `/api/share` | POST | Generate shareable summary link | v1.x |
| `/api/share/:shareId` | GET | Retrieve shared summary | v1.x |

### 6.4 Shared Code Strategy

The search logic is currently duplicated between frontend and backend. To resolve:

```
shared/                          # New shared package
├── types/
│   └── index.ts                 # TrialData, StudyProtocolSection, etc.
├── utils/
│   ├── search-helpers.ts        # extractSearchTerms, simplifySummary
│   ├── phase-humanizer.ts       # Phase API values → plain English
│   └── trial-transformer.ts     # API response → TrialData mapping
└── package.json                 # Internal package (workspace reference)
```

Both `frontend/app/api/search/route.ts` and `backend/src/routes/search.ts` import from `shared/`.

---

## 7. Feature Specifications

### 7.1 Natural Language Search (FR-1 through FR-4)

#### Current Implementation

`extractSearchTerms()` performs basic stop-word removal:

```
Input:  "I have stage 2 lupus and standard treatment stopped working"
Step 1: Remove stop words (I, have, and, standard, stopped, working, treatment)
Step 2: Remove punctuation
Step 3: Filter words < 3 chars
Output: "stage+lupus"  → sent as query.term
```

**Problems**:
- "treatment" is a stop word — but "treatment resistant" is a meaningful clinical concept
- "stage 2" is split and "2" is dropped (< 3 chars)
- No condition vs. modifier distinction
- No synonym mapping (patient language → clinical terms)

#### Target Implementation

```typescript
interface ParsedIntent {
  condition: string;          // primary condition → query.cond
  modifiers: string[];        // stage, type, grade → included in query.term
  clinicalSynonyms: string[]; // mapped from patient language
  location?: string;          // extracted location → query.locn
  age?: number;               // mentioned age → post-filter
}

function parseNaturalLanguage(input: string): ParsedIntent {
  // 1. Identify condition (longest medical noun phrase)
  // 2. Preserve compound modifiers ("stage 2", "type 1", "triple negative")
  // 3. Map patient language to clinical synonyms:
  //    "stopped working" → "refractory"
  //    "came back" → "recurrent"
  //    "spread" → "metastatic"
  //    "early stage" → "stage I OR stage II"
  // 4. Extract location if present ("near Chicago", "in Texas")
  // 5. Extract age if mentioned ("I'm 45")
}
```

**Synonym mapping table** (expandable):

| Patient Language | Clinical Synonym |
|-----------------|-----------------|
| stopped working | refractory, treatment-resistant |
| came back | recurrent, relapsed |
| spread | metastatic |
| early stage | stage I, stage II |
| advanced | advanced, late-stage |
| new treatment | investigational, experimental |
| children / kids | pediatric |
| alternative | complementary, integrative |

#### Example Queries (Suggested in UI)

```
"I have stage 2 lupus and standard treatment stopped working"
"My father has early-stage Parkinson's and lives near Houston"
"Triple negative breast cancer, age 42, looking for immunotherapy trials"
"Chronic migraine — nothing has worked so far"
"Type 1 diabetes in children under 12"
```

### 7.2 Trial Search & Matching (FR-5 through FR-10)

#### ClinicalTrials.gov API Query Construction

```typescript
function buildApiQuery(intent: ParsedIntent): URLSearchParams {
  const params = new URLSearchParams();

  // Always filter to recruiting only
  params.set('filter.overallStatus', 'RECRUITING');

  // Condition-specific search (more precise than query.term)
  if (intent.condition) {
    params.set('query.cond', intent.condition);
  }

  // Additional terms (modifiers + synonyms)
  const termParts = [...intent.modifiers, ...intent.clinicalSynonyms];
  if (termParts.length > 0) {
    params.set('query.term', termParts.join(' '));
  }

  // Location filtering
  if (intent.location) {
    params.set('query.locn', intent.location);
  }

  // Pagination
  params.set('pageSize', '10');  // increased from 5

  // Field selection (payload optimization)
  params.set('fields', REQUIRED_FIELDS.join(','));

  return params;
}
```

#### Geographic Filtering

Two approaches available:

| Method | Parameter | Input | Precision |
|--------|-----------|-------|-----------|
| **Text-based** | `query.locn` | City/state name | Approximate — matches location text fields |
| **Radius-based** | `filter.geo` | `distance(lat,lon,radiusMi)` | Precise — requires geocoding the user's input |

**Implementation plan**:
1. MVP: Use `query.locn` with the city/state text the user provides
2. Post-MVP: Add geocoding (browser Geolocation API or geocoding service) → `filter.geo` for radius-based filtering

#### Pagination

```typescript
// Token-based pagination from ClinicalTrials.gov API
interface PaginationState {
  currentToken?: string;     // current page token
  nextToken?: string;        // token for next page (from API response)
  hasMore: boolean;          // derived: nextToken !== undefined
  totalLoaded: number;       // running count of loaded results
}

// UI: "Load More" button or infinite scroll
// Each "Load More" appends results to existing array
```

### 7.3 Plain English Summaries (FR-11 through FR-14)

#### Summary Template

Each trial card should present information in this structure:

```
┌─────────────────────────────────────────────────────────┐
│  ● Recruiting                                  Phase 2   │
│                                                          │
│  Trial Title in Plain Language                           │
│                                                          │
│  Conditions: Lupus · Systemic Lupus Erythematosus        │
│                                                          │
│  WHAT'S BEING TESTED                                     │
│  Researchers are testing [intervention name] to see      │
│  if it can [brief mechanism/goal].                       │
│                                                          │
│  WHAT PARTICIPATION INVOLVES                             │
│  [extracted from eligibility criteria + arms]            │
│                                                          │
│  📍 Location     │  ⏱ Duration      │  💰 Compensation  │
│  Boston, MA      │  ~18 months       │  Not specified     │
│  + 3 more sites  │  (est. end 2027)  │                    │
│                                                          │
│  👤 Ages 18–65   │  👥 Enrolling 200 │  🏥 Sponsor: NIH  │
│                                                          │
│  [View on ClinicalTrials.gov]  [Save Trial]  [Share]    │
└─────────────────────────────────────────────────────────┘
```

#### Duration Calculation

Currently returns empty string. Fix:

```typescript
function calculateDuration(
  startDate?: { date?: string },
  completionDate?: { date?: string }
): string {
  if (!startDate?.date || !completionDate?.date) return 'Duration not specified';

  const start = new Date(startDate.date);
  const end = new Date(completionDate.date);
  const months = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30));

  if (months < 1) return 'Less than 1 month';
  if (months === 1) return '~1 month';
  if (months < 12) return `~${months} months`;
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (remainingMonths === 0) return `~${years} year${years > 1 ? 's' : ''}`;
  return `~${years} year${years > 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
}
```

#### Compensation Detection

The ClinicalTrials.gov API does not have a dedicated compensation field. Strategy:

```typescript
function detectCompensation(
  briefSummary?: string,
  detailedDescription?: string,
  eligibilityCriteria?: string
): string {
  const text = [briefSummary, detailedDescription, eligibilityCriteria]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (/compensat|reimburse|stipend|payment|paid|\$\d/.test(text)) {
    return 'Compensation may be available — check with study team';
  }
  return 'Not specified — contact study team for details';
}
```

#### ClinicalTrials.gov Link

```typescript
function getTrialUrl(nctId: string): string {
  return `https://clinicaltrials.gov/study/${nctId}`;
}
```

### 7.4 Save & Track Trials (FR-15 through FR-18)

#### localStorage Implementation (MVP)

```typescript
const STORAGE_KEY = 'findmytrial_saved';
const MAX_SAVED = 50;

function getSavedTrials(): SavedTrial[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveTrial(nctId: string, trial: TrialData): boolean {
  const saved = getSavedTrials();
  if (saved.some(s => s.nctId === nctId)) return false; // already saved
  if (saved.length >= MAX_SAVED) return false;           // limit reached

  saved.unshift({ nctId, trial, savedAt: new Date().toISOString() });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  return true;
}

function removeTrial(nctId: string): void {
  const saved = getSavedTrials().filter(s => s.nctId !== nctId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
}

function isTrialSaved(nctId: string): boolean {
  return getSavedTrials().some(s => s.nctId === nctId);
}
```

#### Custom Hook

```typescript
function useSavedTrials() {
  const [saved, setSaved] = useState<SavedTrial[]>([]);

  useEffect(() => { setSaved(getSavedTrials()); }, []);

  const save = (nctId: string, trial: TrialData) => {
    saveTrial(nctId, trial);
    setSaved(getSavedTrials());
  };

  const remove = (nctId: string) => {
    removeTrial(nctId);
    setSaved(getSavedTrials());
  };

  const isSaved = (nctId: string) => saved.some(s => s.nctId === nctId);

  return { saved, save, remove, isSaved };
}
```

### 7.5 Alerts & Notifications (FR-19 through FR-21)

> **Phase**: Post-MVP (requires backend persistence + email service)

#### Architecture

```
User creates alert
  → POST /api/alerts { query, location, frequency, email }
  → Store in database (SQLite or PostgreSQL)
  → Cron job runs daily/weekly:
      → For each alert:
          → Query ClinicalTrials.gov API with saved parameters
          → Compare against last known results (by nctId)
          → If new results found → send email notification
          → Update lastCheckedAt
```

#### Email Service Options

| Service | Free Tier | Notes |
|---------|-----------|-------|
| Resend | 3,000 emails/month | Modern API, good DX |
| SendGrid | 100 emails/day | Established, robust |
| Postmark | 100 emails/month | Transactional focus |

### 7.6 Share with Doctor (FR-22 through FR-24)

#### Shareable Summary Generation

```typescript
// POST /api/share
// Body: { trials: TrialData[], patientNote?: string }
// Returns: { shareId: string, shareUrl: string }

interface ShareableSummary {
  shareId: string;               // short UUID
  trials: TrialData[];           // selected trials
  patientNote?: string;          // optional message
  createdAt: string;             // ISO 8601
  expiresAt: string;             // 30 days after creation
}
```

#### Delivery Options

1. **Copy link** — `/share/[shareId]` — public page with trial summaries
2. **Download PDF** — Client-side PDF generation via `jspdf` or `@react-pdf/renderer`
3. **Email directly** — POST to email service with formatted HTML

---

## 8. Error Handling & Resilience

### 8.1 Error Categories

| Category | Trigger | User-Facing Message | Technical Action |
|----------|---------|--------------------:|-----------------|
| **API Timeout** | ClinicalTrials.gov > 10s | "The trial database is responding slowly. Please try again in a moment." | Retry once with exponential backoff |
| **API Rate Limit** | HTTP 429 | "We're experiencing high demand. Please wait a few seconds and try again." | Retry after `Retry-After` header or 30s |
| **API Down** | HTTP 5xx | "The ClinicalTrials.gov database is temporarily unavailable. This is maintained by the U.S. government and is usually back within minutes." | Show cached sample results as fallback |
| **No Results** | Empty results array | "We didn't find any actively recruiting trials matching your description. Try broadening your search — for example, use just your condition name without stage or type." | Suggest query modifications |
| **Network Error** | fetch fails | "Please check your internet connection and try again." | — |
| **Invalid Input** | Empty/too-short query | "Please describe your condition in a few words so we can search for relevant trials." | Prevent API call |

### 8.2 Retry Strategy

```typescript
async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries = 2,
  baseDelay = 1000
): Promise<Response> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(10000), // 10s timeout
      });

      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('Retry-After') || '30');
        await delay(retryAfter * 1000);
        continue;
      }

      if (response.ok) return response;

      if (response.status >= 500 && attempt < maxRetries) {
        await delay(baseDelay * Math.pow(2, attempt));
        continue;
      }

      throw new ApiError(response.status, await response.text());
    } catch (error) {
      if (attempt === maxRetries) throw error;
      await delay(baseDelay * Math.pow(2, attempt));
    }
  }
  throw new Error('Max retries exceeded');
}
```

---

## 9. Performance Strategy

### 9.1 Frontend Performance

| Optimization | Technique | Target |
|-------------|-----------|--------|
| **Code splitting** | Next.js automatic + dynamic imports for below-fold sections | < 150 KB initial JS |
| **Font loading** | `next/font/google` with `display: swap` + preload | No FOIT |
| **Image optimization** | Next.js `<Image>` with lazy loading | LCP < 2s |
| **CSS** | Tailwind purge (built-in) — only ship used classes | < 20 KB CSS |
| **Animation perf** | Use `transform` and `opacity` only (GPU-composited) | 60fps animations |
| **Scroll handlers** | IntersectionObserver (not scroll events) | No jank |

### 9.2 API Performance

| Optimization | Technique | Impact |
|-------------|-----------|--------|
| **Field selection** | Use `fields` param to request only needed fields | ~70% smaller response payload |
| **Result caching** | Next.js `revalidate: 300` (5 min) on fetch | Reduce redundant API calls |
| **Debounced search** | 300ms debounce on input (if adding live search) | Prevent excessive API calls |
| **Rate limit awareness** | Track requests, queue if approaching 50/min limit | Prevent 429 errors |

### 9.3 Core Web Vitals Targets

| Metric | Target | Strategy |
|--------|--------|----------|
| **LCP** (Largest Contentful Paint) | < 2.0s | Preload hero fonts, SSR above-fold content |
| **FID** (First Input Delay) | < 100ms | Minimal JS in critical path |
| **CLS** (Cumulative Layout Shift) | < 0.1 | Fixed dimensions for hero, font swap handling |
| **TTFB** (Time to First Byte) | < 600ms | Netlify edge CDN |

---

## 10. Security & Privacy

### 10.1 Data Flow Security

```
Browser ──HTTPS──▶ Netlify Edge ──HTTPS──▶ Next.js Serverless ──HTTPS──▶ ClinicalTrials.gov
                                                    │
                                          No PII logged or stored
                                          No cookies (MVP)
                                          No auth tokens (MVP)
```

### 10.2 Security Measures

| Measure | Implementation |
|---------|---------------|
| **HTTPS** | Enforced by Netlify (automatic SSL) |
| **Input sanitization** | Strip HTML/script tags from search input before processing |
| **No PII storage** | MVP stores nothing server-side; saved trials in browser localStorage only |
| **CORS** | Backend allows only `FRONTEND_URL` origin |
| **Rate limiting** | Inherits ClinicalTrials.gov API rate limit (~50 req/min); add own rate limiting if abuse detected |
| **CSP headers** | Content Security Policy to prevent XSS |
| **Dependency audit** | Regular `npm audit` in CI pipeline |

### 10.3 Privacy Policy Requirements

| Item | Status |
|------|--------|
| No personal health information (PHI) collected | ✅ MVP |
| No third-party analytics without consent | ✅ MVP |
| No tracking cookies | ✅ MVP |
| localStorage data stays on user's device | ✅ MVP |
| Clear disclosure of data source (ClinicalTrials.gov) | ✅ Implemented in Footer |
| Medical disclaimer on every page | ✅ Implemented in Footer |

---

## 11. Deployment Architecture

### 11.1 Netlify Configuration

```toml
# netlify.toml
[build]
  command = "npx next build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### 11.2 Environment Variables

| Variable | Environment | Purpose |
|----------|------------|---------|
| `NEXT_PUBLIC_API_URL` | Frontend | Backend URL (unused in MVP — frontend uses own API route) |
| `PORT` | Backend | Express server port (default: 3001) |
| `NODE_ENV` | Both | `development` / `production` |
| `FRONTEND_URL` | Backend | CORS allowed origin |

### 11.3 Deployment Pipeline

```
Push to main
  → Netlify auto-build triggered
    → npm install
    → npx next build
    → Deploy to Netlify CDN
    → API routes deployed as serverless functions
```

### 11.4 Infrastructure Diagram

```
┌──────────────┐        ┌──────────────────┐        ┌─────────────────┐
│   Browser    │◄──────▶│   Netlify CDN    │        │ ClinicalTrials  │
│              │  HTTPS  │                  │  HTTPS  │   .gov API v2   │
│  Static      │        │  Static Assets   │◄──────▶│                 │
│  Assets +    │        │  + Serverless    │        │  ~50 req/min    │
│  localStorage│        │    Functions     │        │  Daily refresh  │
└──────────────┘        └──────────────────┘        └─────────────────┘
                                │
                                │  (Post-MVP)
                                ▼
                        ┌──────────────────┐
                        │  Backend Server  │
                        │  (Express.js)    │
                        │                  │
                        │  • Alerts cron   │
                        │  • Share links   │
                        │  • Database      │
                        └──────────────────┘
```

---

## 12. Gap Analysis — Current State vs Requirements

### 12.1 Implemented ✅

| Requirement | ID | Status | Notes |
|-------------|-----|--------|-------|
| Natural language search input | FR-1 | ✅ Done | Basic stop-word removal |
| Query ClinicalTrials.gov API in real time | FR-5 | ✅ Done | `query.term` with extracted terms |
| Filter to actively recruiting trials | FR-6 | ✅ Done | `filter.overallStatus=RECRUITING` |
| Prominent search bar | FR-3 | ✅ Done | Hero section with animated search |
| Trial summary display | FR-11 | ⚠️ Partial | Summary shown but duration & compensation are empty |
| Age range display | FR-8 | ⚠️ Partial | Displayed but not used as a filter |
| Mobile-responsive design | NFR-8 | ✅ Done | Tailwind responsive breakpoints |

### 12.2 Not Yet Implemented ❌

| Requirement | ID | Priority | Complexity | Notes |
|-------------|-----|----------|------------|-------|
| Improved NLP / intent extraction | FR-2 | Must Have | Medium | Synonym mapping, compound modifier preservation |
| Location-based filtering | FR-7 | Must Have | Low | Add `query.locn` parameter to API call |
| Example queries in UI | FR-4 | Should Have | Low | Clickable suggestions below search bar |
| Pagination | FR-9 | Must Have | Medium | Token-based, "Load More" button |
| No results guidance | FR-10 | Should Have | Low | Helpful message + query suggestions |
| Phase humanization | FR-12 | Must Have | Low | Map API phase codes → plain English |
| Distance from user | FR-13 | Should Have | Medium | Requires geocoding |
| ClinicalTrials.gov link | FR-14 | Must Have | Low | `clinicaltrials.gov/study/{nctId}` |
| Duration calculation | FR-11 | Must Have | Low | Calculate from start/completion dates |
| Compensation detection | FR-11 | Should Have | Low | Regex scan of descriptions |
| Save/bookmark trials | FR-15–17 | Should Have | Medium | localStorage + custom hook |
| Saved trials page | FR-18 | Should Have | Medium | New route `/saved` |
| Trial detail page | — | Should Have | Medium | New route `/trial/[nctId]` |
| nctId on TrialData | — | Must Have | Low | Pass through from API response |
| "Learn More" button action | — | Must Have | Low | Link to ClinicalTrials.gov or detail page |
| "Save Trial" button action | — | Should Have | Low | Wire to localStorage |
| Email alerts | FR-19–21 | Could Have | High | Requires backend, DB, email service, cron |
| Shareable summary | FR-22–23 | Should Have | Medium | Share page + PDF generation |
| Email to doctor | FR-24 | Could Have | High | Requires email service |
| `pageSize` increase | — | Must Have | Low | Change from 5 to 10–20 |
| Field selection optimization | — | Should Have | Low | Add `fields` param to reduce payload |
| Retry logic with backoff | — | Should Have | Medium | Handle 429, timeouts, 5xx |
| Input validation | — | Must Have | Low | Minimum query length, sanitization |

### 12.3 Technical Debt

| Item | Impact | Fix |
|------|--------|-----|
| Duplicated search logic (frontend route + backend route) | Maintenance burden | Extract to shared package |
| `TrialData` missing `nctId` field | Can't link to ClinicalTrials.gov or save | Add `nctId` to interface and mapping |
| 47 unused shadcn/ui components | Bundle size bloat | Remove unused components or rely on tree-shaking |
| Hardcoded `pageSize=5` | Too few results | Make configurable, default to 10 |
| No error boundary | Unhandled errors crash entire page | Add React error boundary |
| No loading skeleton | Poor perceived performance | Add skeleton UI during search |

---

## 13. Implementation Roadmap

### Phase 1 — Core Fixes (MVP Completion)

> **Goal**: Complete the must-have requirements for a functional MVP.

| Task | Requirement | Effort |
|------|-------------|--------|
| Add `nctId` to TrialData and pass through from API | Blocker for save, share, linking | 1 hour |
| Wire "Learn More" → ClinicalTrials.gov link | FR-14 | 30 min |
| Add location filtering (`query.locn`) | FR-7 | 2 hours |
| Increase `pageSize` to 10, add "Load More" pagination | FR-9 | 3 hours |
| Calculate and display duration | FR-11 | 1 hour |
| Implement phase humanization | FR-12 | 1 hour |
| Add compensation detection (regex) | FR-11 | 1 hour |
| Improve `extractSearchTerms` with synonym mapping | FR-2 | 4 hours |
| Input validation (min length, sanitization) | — | 1 hour |
| Add example queries below search bar | FR-4 | 1 hour |
| Add "no results" guidance with suggestions | FR-10 | 1 hour |
| Add retry logic with exponential backoff | — | 2 hours |

**Estimated total**: ~18 hours

### Phase 2 — Save & Detail (v1.1)

> **Goal**: Let users save, revisit, and deeply explore trials.

| Task | Requirement | Effort |
|------|-------------|--------|
| Implement `useSavedTrials` hook with localStorage | FR-15–17 | 3 hours |
| Wire "Save Trial" button to hook | FR-15 | 1 hour |
| Create `/saved` page | FR-18 | 4 hours |
| Create `/trial/[nctId]` detail page | — | 6 hours |
| Add search history to localStorage | — | 2 hours |
| Extract shared code package | Tech debt | 4 hours |
| Add loading skeleton UI | UX improvement | 2 hours |
| Add React error boundary | Reliability | 1 hour |

**Estimated total**: ~23 hours

### Phase 3 — Share & Alerts (v1.2)

> **Goal**: Enable sharing with doctors and automated alerts.

| Task | Requirement | Effort |
|------|-------------|--------|
| Create `/share/[shareId]` page | FR-22–23 | 6 hours |
| Add PDF generation (`@react-pdf/renderer`) | FR-22 | 6 hours |
| Set up database (SQLite/PostgreSQL) | Infra | 4 hours |
| Build alerts API (CRUD endpoints) | FR-19–21 | 8 hours |
| Build alerts cron job | FR-19 | 6 hours |
| Integrate email service (Resend) | FR-19, FR-24 | 4 hours |
| Create `/alerts` management page | FR-21 | 4 hours |

**Estimated total**: ~38 hours

---

*This specification is a living document. Update as implementation progresses and requirements evolve.*
