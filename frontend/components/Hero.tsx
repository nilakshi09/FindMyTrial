'use client';

import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSearchHistory } from '@/hooks/use-search-history';
import { trackEvent } from '@/lib/analytics';

interface HeroProps {
  onSearch: (query: string) => void;
  location: string;
  onLocationChange: (val: string) => void;
  isLoading: boolean;
}

function CountUpNumber({ target, duration = 1500 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const start = performance.now();
          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration, hasAnimated]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  },
};

const searchBarVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  },
};

const trustVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  },
};

const EXAMPLE_QUERIES = [
  'Stage 2 lupus, treatment stopped working',
  'Triple negative breast cancer, age 42',
  'Type 1 diabetes in children',
  'Chronic migraine — nothing has worked',
  "Early Parkinson's near Houston",
];

function getPreview(input: string): string {
  if (input.trim().length < 5) return '';

  const text = input.toLowerCase();

  // Extract location hint
  const locationMatch = text.match(
    /(?:near|in|around|close to)\s+([A-Za-z\s]{2,20})(?:,|$)/i
  );
  const locationHint = locationMatch ? locationMatch[1].trim() : null;

  // Extract condition (first meaningful noun phrase — simple heuristic)
  const stopWords = ['i', 'have', 'has', 'my', 'and', 'or', 'the', 'a', 'an',
    'with', 'for', 'that', 'treatment', 'therapy', 'stopped', 'working',
    'nothing', 'works', 'am', 'been', 'is', 'looking', 'seeking'];

  const conditionWords = text
    .replace(/(?:near|in|around|close to)\s+[A-Za-z\s]{2,20}/gi, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.includes(w))
    .slice(0, 4);

  const conditionHint = conditionWords.join(' ');
  if (!conditionHint) return '';

  if (locationHint) {
    return `Searching for: ${conditionHint} near ${locationHint}`;
  }
  return `Searching for: ${conditionHint}`;
}

export default function Hero({ onSearch, location, onLocationChange, isLoading }: HeroProps) {
  const { history, addToHistory, clearHistory } = useSearchHistory();
  const [showHistory, setShowHistory] = useState(false);
  const [query, setQuery] = useState('');
  const [interpretationPreview, setInterpretationPreview] = useState('');
  const isQueryValid = query.trim().length >= 3;

  useEffect(() => {
    const timer = setTimeout(() => {
      const preview = getPreview(query);
      setInterpretationPreview(preview);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isQueryValid) {
      const trimmedQuery = query.trim();
      onSearch(trimmedQuery);
      addToHistory(trimmedQuery);
      trackEvent('Search', { query: trimmedQuery.slice(0, 50) });
    }
  };

  function handleExampleClick(example: string) {
    setQuery(example);
    onSearch(example);
    addToHistory(example);
    trackEvent('Search', { query: example.slice(0, 50) });
  }

  return (
    <section id="hero" className="relative pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden">
      {/* Animated gradient background */}
      <div
        className="absolute inset-0 animate-hero-gradient"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(200,146,42,0.07) 0%, rgba(245,239,230,0.03) 50%, transparent 80%), #FAF7F2',
          backgroundSize: '200% 200%',
        }}
      />

      {/* Floating decorative orbs */}
      <div
        className="absolute top-20 left-[10%] w-[400px] h-[400px] rounded-full animate-float-orb pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(200,146,42,0.04) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute top-40 right-[5%] w-[300px] h-[300px] rounded-full animate-float-orb-delayed pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(10,22,40,0.03) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute bottom-10 left-[30%] w-[350px] h-[350px] rounded-full animate-float-orb-slow pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(200,146,42,0.03) 0%, transparent 70%)',
        }}
      />

      <motion.div
        className="relative max-w-3xl mx-auto px-6 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Live data badge */}
        <motion.div variants={itemVariants} className="flex justify-center">
          <div className="inline-flex items-center gap-2.5 mb-7 px-5 py-2 rounded-full border border-amber/25 bg-white/60 backdrop-blur-sm shadow-xs">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-pulse-dot absolute inline-flex h-full w-full rounded-full bg-amber opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber" />
            </span>
            <span className="text-xs text-amber font-semibold tracking-wide">
              Live data from ClinicalTrials.gov
            </span>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="font-serif text-[2.5rem] md:text-[3.5rem] lg:text-[4rem] font-bold text-navy leading-[1.1] tracking-tight"
          variants={itemVariants}
        >
          <span className="block">Find the clinical trial</span>
          <span className="block">
            that could change{' '}
            <span className="relative inline-block">
              everything
              <svg
                className="absolute -bottom-1 left-0 w-full h-3 text-amber/30"
                viewBox="0 0 200 12"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M2 8 Q50 2 100 6 Q150 10 198 4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            .
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="mt-6 text-base md:text-lg text-slate-500 leading-relaxed max-w-xl mx-auto"
          variants={itemVariants}
        >
          Describe your condition in plain English. We search 460,000+ registered
          trials and surface the ones actively recruiting patients like you — in
          seconds.
        </motion.p>

        {/* Search Bar */}
        <motion.form
          onSubmit={handleSubmit}
          className="mt-10 max-w-[680px] mx-auto"
          variants={searchBarVariants}
        >
          <div className="search-focus-glow relative flex items-center bg-white rounded-2xl shadow-md border border-warm-gray hover:shadow-lg transition-all duration-400">
            <Search className="absolute left-5 text-slate-500 opacity-50" size={20} strokeWidth={1.8} />
            <input
              name="search"
              type="text"
              autoComplete="off"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setShowHistory(true)}
              onBlur={() => setTimeout(() => setShowHistory(false), 150)}
              onKeyDown={(e) => {
                 if (e.key === 'Escape') setShowHistory(false);
              }}
              placeholder="e.g. I have stage 2 lupus and my current treatment stopped working"
              className="flex-1 pl-14 pr-4 py-4 md:py-5 bg-transparent rounded-2xl text-navy placeholder:text-slate-500 placeholder:opacity-50 text-sm md:text-base focus:outline-none"
              disabled={isLoading}
              aria-label="Describe your condition to search for clinical trials"
            />
            <button
              type="submit"
              disabled={!isQueryValid || isLoading}
              className={`mr-2.5 relative overflow-hidden bg-amber text-white text-sm font-semibold px-6 py-3 md:px-7 md:py-3.5 rounded-xl transition-all duration-300 shrink-0 ${!isQueryValid || isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-110 hover:scale-[1.03] hover:shadow-glow-amber active:scale-[0.98]'}`}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Searching…
                </span>
              ) : (
                'Find My Trial'
              )}
            </button>

          </div>

          {/* History dropdown — normal flow, pushes content below */}
          {showHistory && history.length > 0 && (
            <div className="mt-1 bg-white border border-warm-gray rounded-xl shadow-lg z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-warm-gray">
                <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                  Recent searches
                </span>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); clearHistory(); setShowHistory(false); }}
                  className="text-xs text-slate-400 hover:text-navy transition-colors"
                >
                  Clear history
                </button>
              </div>
              {history.map((entry) => (
                <button
                  key={entry.timestamp}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setQuery(entry.query);
                    onSearch(entry.query);
                    addToHistory(entry.query);
                    setShowHistory(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-navy hover:bg-ivory transition-colors flex items-center gap-2 border-b border-warm-gray last:border-0"
                >
                  <span className="text-slate-500 opacity-70">🕐</span>
                  {entry.query}
                </button>
              ))}
            </div>
          )}
          {query.length > 0 && query.trim().length < 3 && (
            <p className="text-sm text-slate-500 mt-1">
              Describe your condition in a few words to search
            </p>
          )}

          {/* Location input */}
          <div className="flex items-center gap-2 mt-3">
            <span className="text-slate-500 text-sm opacity-70">📍</span>
            <input
              id="locationInput"
              type="text"
              placeholder="City, state, or zip code (optional)"
              value={location}
              onChange={e => onLocationChange(e.target.value)}
              className="flex-1 bg-transparent border-b border-warm-gray text-navy placeholder:text-slate-500 placeholder:opacity-70 text-sm py-1 focus:outline-none focus:border-amber transition-colors"
              disabled={isLoading}
              aria-label="Filter by location"
            />
            {location && (
              <button
                type="button"
                onClick={() => onLocationChange('')}
                className="text-slate-500 hover:text-navy text-xs transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {/* Interpretation preview */}
          {interpretationPreview && (
            <p className="text-xs text-slate-400 mt-2 italic transition-opacity duration-200">
              {interpretationPreview}
            </p>
          )}
        </motion.form>

        {/* Example query pills */}
        <motion.div
          className="mt-5 max-w-[680px] mx-auto"
          variants={trustVariants}
        >
          <p className="text-xs text-slate/50 mb-2.5 uppercase tracking-widest font-medium">
            Try an example
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {EXAMPLE_QUERIES.map((example) => (
              <button
                key={example}
                onClick={() => handleExampleClick(example)}
                disabled={isLoading}
                className="text-xs px-3.5 py-1.5 rounded-full border border-warm-gray
                           text-slate-500 hover:border-amber/70 hover:text-amber
                           transition-all duration-300
                           disabled:opacity-40 disabled:cursor-not-allowed
                           bg-white/50 backdrop-blur-sm shadow-xs
                           hover:shadow-sm hover:bg-white/70"
              >
                {example}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Helper text */}
        <motion.p
          className="mt-4 text-xs text-slate/60"
          variants={trustVariants}
        >
          Free to use. No account required. Pulls live data from ClinicalTrials.gov.
        </motion.p>

        {/* Trust indicators */}
        <motion.div
          className="mt-8 flex flex-wrap justify-center gap-3"
          variants={trustVariants}
        >
          <span className="text-xs text-slate-500 font-medium border border-warm-gray rounded-full px-5 py-2 bg-white/50 backdrop-blur-sm shadow-xs hover:shadow-sm transition-all duration-300">
            <CountUpNumber target={470000} />+ Registered Trials
          </span>
          {['Updated Daily', 'Plain English Results'].map((pill) => (
            <span
              key={pill}
              className="text-xs text-slate-500 font-medium border border-warm-gray rounded-full px-5 py-2 bg-white/50 backdrop-blur-sm shadow-xs hover:shadow-sm transition-all duration-300"
            >
              {pill}
            </span>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
