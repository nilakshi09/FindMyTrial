# FindMyTrial — Frontend

Next.js application that provides a beautiful, patient-friendly interface for searching clinical trials.

## Tech Stack

- **Framework**: Next.js 13 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Language**: TypeScript
- **Fonts**: Inter + Playfair Display (Google Fonts)
- **Deployment**: Netlify

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`.

## Project Structure

```
app/
├── globals.css           # Global styles & animations
├── layout.tsx            # Root layout with fonts & metadata
├── page.tsx              # Home page
└── api/
    └── search/
        └── route.ts      # API proxy route
components/
├── ui/                   # shadcn/ui primitives
├── Hero.tsx              # Hero section with search
├── Navbar.tsx            # Navigation bar
├── SearchResults.tsx     # Search results display
├── TrialCard.tsx         # Individual trial card
├── HowItWorks.tsx        # How it works section
├── SampleTrials.tsx      # Sample trial cards
├── Testimonials.tsx      # Testimonials section
├── FAQ.tsx               # FAQ accordion
├── FinalCTA.tsx          # Final call-to-action
└── Footer.tsx            # Footer
hooks/
├── use-scroll-animation.ts
└── use-toast.ts
lib/
└── utils.ts              # Utility functions
```
