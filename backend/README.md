# FindMyTrial — Backend

Express.js API server that queries [ClinicalTrials.gov](https://clinicaltrials.gov) and returns simplified, patient-friendly trial results.

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Data Source**: ClinicalTrials.gov API v2

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

The API will be available at `http://localhost:3001`.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/search?q=<query>` | Search for recruiting clinical trials |
| `GET` | `/api/health` | Health check |

## Project Structure

```
src/
├── index.ts              # Express app entry point
├── routes/
│   └── search.ts         # Search endpoint logic
├── utils/
│   └── search-helpers.ts # NLP helpers & text processing
└── types/
    └── index.ts          # TypeScript interfaces
```
