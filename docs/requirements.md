# FindMyTrial — Requirements

> Derived from [idea.md](./idea.md)

---

## 1. Overview

FindMyTrial is a patient-facing web application that translates clinical trial data from ClinicalTrials.gov into plain, accessible English. Users describe their medical situation in natural language, and the system returns actively recruiting trials matched to their condition, location, and basic eligibility — all presented without jargon.

---

## 2. User Personas

| Persona | Description |
|---------|-------------|
| **Patient** | A person with a medical condition seeking clinical trials. No medical or technical expertise assumed. |
| **Caregiver** | A family member or friend searching on behalf of a patient. |
| **Physician** | A doctor receiving shared trial results from a patient to evaluate together. |

---

## 3. Functional Requirements

### 3.1 Natural Language Search

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Users can enter a free-text description of their condition (e.g., *"I have stage 2 lupus and standard treatment stopped working"*) | **Must Have** |
| FR-2 | The system extracts medical intent from plain language input (condition, stage, treatment history) | **Must Have** |
| FR-3 | The search bar is the primary entry point — prominent, accessible, and inviting | **Must Have** |
| FR-4 | Suggested example queries are displayed to guide first-time users | **Should Have** |

### 3.2 Trial Search & Matching

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-5 | Query the ClinicalTrials.gov API v2 in real time based on extracted medical terms | **Must Have** |
| FR-6 | Filter results to only **actively recruiting** trials (`RECRUITING` status) | **Must Have** |
| FR-7 | Filter by user-provided location (city, state, or zip code) | **Must Have** |
| FR-8 | Filter by basic eligibility factors: age, sex, diagnosis stage | **Should Have** |
| FR-9 | Support pagination for large result sets | **Must Have** |
| FR-10 | Display a "no results found" state with helpful guidance when no trials match | **Should Have** |

### 3.3 Plain English Trial Summaries

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-11 | Rewrite each trial result into a plain English summary covering: | **Must Have** |
|  | — What researchers are testing | |
|  | — What participation involves | |
|  | — How long the trial runs | |
|  | — Whether travel is required | |
|  | — What compensation looks like | |
| FR-12 | Display trial phase in human-friendly language (e.g., *"Early safety testing"* for Phase I) | **Must Have** |
| FR-13 | Show recruiting locations with distance from user (if location provided) | **Should Have** |
| FR-14 | Link back to the official ClinicalTrials.gov listing for full details | **Must Have** |

### 3.4 Save & Track Trials

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-15 | Users can save/bookmark individual trials to a personal list | **Should Have** |
| FR-16 | Saved trials persist across sessions (local storage for MVP, account-based later) | **Should Have** |
| FR-17 | Users can remove saved trials | **Should Have** |
| FR-18 | Saved trials list is accessible from a dedicated page or panel | **Should Have** |

### 3.5 Alerts & Notifications

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-19 | Users can opt in to email alerts when new trials match their saved search criteria | **Could Have** |
| FR-20 | Alert frequency is configurable (daily, weekly) | **Could Have** |
| FR-21 | Users can manage and delete their active alerts | **Could Have** |

### 3.6 Share with Doctor

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-22 | Users can generate a shareable summary (link or PDF) of selected trial results | **Should Have** |
| FR-23 | The shareable summary includes trial ID, plain English overview, eligibility snapshot, and location details | **Should Have** |
| FR-24 | Users can email the summary directly to a recipient (e.g., their physician) | **Could Have** |

---

## 4. Non-Functional Requirements

### 4.1 Performance

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-1 | Initial page load (Time to Interactive) | < 2 seconds |
| NFR-2 | Search results returned after user query | < 3 seconds |
| NFR-3 | Application bundle size (gzipped) | < 300 KB |

### 4.2 Accessibility

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-4 | WCAG 2.1 AA compliance | All pages |
| NFR-5 | Full keyboard navigation support | All interactive elements |
| NFR-6 | Screen reader compatibility | All content |
| NFR-7 | Minimum color contrast ratio | 4.5:1 (text), 3:1 (large text) |

### 4.3 Responsiveness

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-8 | Mobile-first responsive design | 320px — 2560px viewport |
| NFR-9 | Touch-friendly interactions on mobile | All interactive elements |

### 4.4 Security & Privacy

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-10 | No health data stored on servers in MVP (local storage only) | MVP |
| NFR-11 | HTTPS enforced on all connections | All environments |
| NFR-12 | No third-party tracking or analytics without consent | All pages |

### 4.5 Reliability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-13 | Graceful error handling when ClinicalTrials.gov API is unavailable | Fallback messaging |
| NFR-14 | Uptime target | 99.5% |

---

## 5. Technical Requirements

### 5.1 Architecture

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Frontend** | Next.js 13, React 18, TypeScript | App Router, SSR/SSG where appropriate |
| **Styling** | Tailwind CSS, shadcn/ui, Radix UI | Accessible component primitives |
| **Backend** | Express.js, Node.js, TypeScript | Separate API server |
| **Data Source** | ClinicalTrials.gov API v2 | Real-time queries, no data caching of trial content |
| **Deployment** | Netlify | Frontend hosting + serverless functions |

### 5.2 External Dependencies

| Dependency | Purpose | Documentation |
|------------|---------|---------------|
| ClinicalTrials.gov API v2 | Primary trial data source | [API Docs](https://clinicaltrials.gov/data-api/api) |
| Google Fonts (Inter, Playfair Display) | Typography | [fonts.google.com](https://fonts.google.com) |

### 5.3 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/search?q=<query>` | Search for recruiting clinical trials |
| `GET` | `/api/search?q=<query>&location=<loc>` | Search with location filtering |
| `GET` | `/api/health` | Health check (backend) |
| `GET` | `/api/trial/:nctId` | Get detailed info for a single trial |

---

## 6. User Stories

### Search & Discovery

> **US-1**: As a patient, I want to describe my condition in my own words so that I don't need to know medical terminology to find relevant trials.

> **US-2**: As a caregiver, I want to search for trials near a specific city so that I can find options that don't require long-distance travel.

> **US-3**: As a patient, I want to see only trials that are actively recruiting so that I don't waste time on closed studies.

### Understanding Results

> **US-4**: As a patient, I want each trial explained in plain English so that I can understand what participation actually involves.

> **US-5**: As a patient, I want to know if a trial offers compensation or covers travel so that I can factor that into my decision.

> **US-6**: As a patient, I want to understand what phase a trial is in and what that means in simple terms so that I can assess the risk level.

### Saving & Sharing

> **US-7**: As a patient, I want to save trials I'm interested in so that I can come back to them later.

> **US-8**: As a patient, I want to share a summary of matching trials with my doctor so that we can discuss them at my next appointment.

### Alerts

> **US-9**: As a patient with a rare disease, I want to be notified when new trials match my condition so that I don't miss an opportunity.

---

## 7. MVP Scope (v1.0)

The minimum viable product focuses on the core search-to-understanding flow:

### In Scope (MVP)

- [x] Natural language search input
- [x] Real-time ClinicalTrials.gov API integration
- [x] Filter to actively recruiting trials only
- [x] Location-based filtering
- [x] Plain English trial summaries
- [x] Human-friendly phase descriptions
- [x] Link to official ClinicalTrials.gov listing
- [x] Mobile-responsive design
- [x] Pagination of results

### Post-MVP (v1.x)

- [ ] Save/bookmark trials (local storage)
- [ ] Age and sex eligibility filtering
- [ ] Shareable trial summaries (link/PDF)
- [ ] Email alerts for new matching trials
- [ ] Share with doctor via email
- [ ] Dark mode
- [ ] Multi-language support

---

## 8. Acceptance Criteria

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Basic search | A user on the home page | They type "stage 2 breast cancer" and press search | They see a list of actively recruiting breast cancer trials in plain English within 3 seconds |
| Location filter | A user enters a condition and a zip code | They submit the search | Results are filtered to trials with sites near that zip code |
| No results | A user searches for an extremely rare condition with no recruiting trials | They submit the search | They see a friendly message explaining no matches were found, with suggestions to broaden their search |
| Trial detail | A user views a trial result | They read the summary card | They can understand what's being tested, what participation involves, duration, travel, and compensation — all in plain language |
| External link | A user wants the official listing | They click the "View on ClinicalTrials.gov" link | They are taken to the correct trial page on clinicaltrials.gov |

---

## 9. Constraints & Assumptions

### Constraints

- ClinicalTrials.gov API rate limits apply — the app must handle throttling gracefully
- No medical advice is provided — the app is an information tool only
- Trial data accuracy depends on ClinicalTrials.gov; the app does not independently verify listings

### Assumptions

- Users have a basic understanding of their own diagnosis (condition name, general stage)
- Users have access to a modern web browser (last 2 major versions of Chrome, Firefox, Safari, Edge)
- Internet connectivity is required (no offline mode in MVP)

---

## 10. Legal & Compliance

| Item | Requirement |
|------|-------------|
| **Medical Disclaimer** | Prominently displayed on every page — FindMyTrial is not a medical provider |
| **Data Attribution** | All trial data attributed to ClinicalTrials.gov |
| **Privacy** | No PII collected or stored in MVP; future versions with accounts must comply with applicable privacy laws |
| **Terms of Use** | Clearly state the app surfaces public data and does not guarantee trial eligibility or availability |
