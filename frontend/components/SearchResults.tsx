'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TrialCard, { TrialData } from './TrialCard';
import { TrialCardSkeleton } from '@/components/TrialCardSkeleton';
import { useToast } from '@/hooks/use-toast';
import { trackEvent } from '@/lib/analytics';
import { SearchFilters, FilterState, DEFAULT_FILTERS } from './SearchFilters';

interface SearchResultsProps {
  results: TrialData[];
  isLoading: boolean;
  hasSearched: boolean;
  searchError?: string | null;
  activeLocation?: string;
  currentQuery?: string;
  currentLocation?: string;
  onSearch?: (q: string) => void;
  nextPageToken?: string;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  totalLoaded?: number;
}

/* ── No-results guidance panel ──────────────────────────────── */
function NoResultsPanel({ query, onSearch }: {
  query: string;
  onSearch?: (q: string) => void;
}) {
  // Extract first meaningful words as a simplified retry query
  const simplifiedQuery = query
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3)
    .slice(0, 2)
    .join(' ');

  return (
    <div className="rounded-xl border border-warm-gray bg-white p-8 text-center max-w-xl mx-auto">
      <div className="text-3xl mb-3">🔍</div>
      <h3 className="text-navy font-semibold text-lg mb-2">
        No actively recruiting trials found
      </h3>
      <p className="text-slate-500 text-sm mb-6">
        No trials matched <span className="font-medium text-navy">&quot;{query}&quot;</span>.
        This is common for very specific searches — try broadening your criteria.
      </p>

      <div className="text-left space-y-3 mb-6">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
          Suggestions
        </p>
        {[
          'Try just the condition name without stage or type qualifiers',
          'Broaden your location or remove it entirely',
          'Check for alternate names for your condition',
        ].map((suggestion) => (
          <div key={suggestion} className="flex items-start gap-2">
            <span className="text-amber mt-0.5">→</span>
            <p className="text-sm text-slate-600">{suggestion}</p>
          </div>
        ))}
      </div>

      {simplifiedQuery && onSearch && (
        <button
          onClick={() => onSearch(simplifiedQuery)}
          className="text-sm px-4 py-2 rounded-full border border-amber
                     text-amber hover:bg-amber hover:text-white transition-colors"
        >
          Try searching for &quot;{simplifiedQuery}&quot; instead
        </button>
      )}
    </div>
  );
}

/* ── Stagger animation variants ─────────────────────────────── */
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
};

/* ── Component ──────────────────────────────────────────────── */
export default function SearchResults({
  results,
  isLoading,
  hasSearched,
  searchError,
  activeLocation,
  currentQuery,
  currentLocation,
  onSearch,
  nextPageToken,
  isLoadingMore,
  onLoadMore,
  totalLoaded,
}: SearchResultsProps) {
  const { toast } = useToast();
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertEmail, setAlertEmail] = useState('');
  const [alertFrequency, setAlertFrequency] = useState<'daily' | 'weekly'>('weekly');
  const [isCreatingAlert, setIsCreatingAlert] = useState(false);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);

  const alertModalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (showAlertModal) alertModalRef.current?.focus();
  }, [showAlertModal]);

  async function createAlert() {
    if (!alertEmail.includes('@')) return;
    setIsCreatingAlert(true);
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: alertEmail,
          query: currentQuery,
          location: currentLocation || undefined,
          frequency: alertFrequency,
        }),
      });
      if (res.ok) {
        trackEvent('Create Alert');
        toast({ title: 'Alert created!',
                description: `We'll email you when new "${currentQuery}" trials appear.` });
        setShowAlertModal(false);
        setAlertEmail('');
      } else {
        const data = await res.json();
        toast({ title: data.error || 'Could not create alert',
                variant: 'destructive' });
      }
    } finally {
      setIsCreatingAlert(false);
    }
  }

  const filteredResults = results.filter(trial => {
    // Phase filter
    if (filters.phases.length > 0) {
      const trialPhaseRaw = trial.phase ?? '';
      const matchesPhase = filters.phases.some(p => 
        trialPhaseRaw.toUpperCase().includes(p.replace('_', ' ').replace('PHASE', 'PHASE ').trim())
      );
      if (!matchesPhase) return false;
    }
    
    // Study type filter
    if (filters.studyType !== 'ALL') {
      if (!trial.studyType?.toUpperCase().includes(filters.studyType)) return false;
    }
    
    return true;
  });

  const showLocationPill = !!(activeLocation?.trim()) && hasSearched && !searchError && (isLoading || results.length > 0);
  if (!hasSearched && !isLoading) return null;

  return (
    <section className="py-16 md:py-24 bg-ivory border-t border-warm-gray/40">
      <div className="max-w-6xl mx-auto px-6">
        {/* Location filter indicator */}
        {showLocationPill && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-slate-500">
              📍 Filtering by{' '}
              <span className="font-medium text-navy">{activeLocation}</span>
            </span>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* ── Loading skeleton state ──────────────────────── */}
          {isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Searching indicator */}
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-3 bg-white rounded-full px-6 py-3 shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
                  <span className="w-2 h-2 rounded-full bg-amber animate-pulse" />
                  <span className="text-sm text-slate">
                    Searching 470,000+ trials...
                  </span>
                </div>
              </div>

              {/* Skeleton grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{ animationDelay: `${i * 150}ms` }}
                  >
                    <TrialCardSkeleton />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Error state ─────────────────────────────── */}
          {!isLoading && searchError && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="max-w-lg mx-auto"
            >
              <div className="rounded-2xl border border-amber/30 bg-amber/5 p-8 text-center shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
                <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-amber/10 flex items-center justify-center">
                  <span className="text-xl">⚠️</span>
                </div>
                <p className="text-navy font-serif font-semibold text-lg">{searchError}</p>
                <p className="text-slate text-sm mt-3 leading-relaxed">
                  If this continues, visit{' '}
                  <a
                    href="https://clinicaltrials.gov"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber font-medium underline underline-offset-2 hover:text-amber/80 transition-colors"
                  >
                    ClinicalTrials.gov
                  </a>{' '}
                  directly.
                </p>
              </div>
            </motion.div>
          )}

          {/* ── Empty state — NoResultsPanel ───────────────── */}
          {!isLoading && !searchError && hasSearched && results.length === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="py-8"
            >
              <NoResultsPanel query={currentQuery ?? ''} onSearch={onSearch} />
            </motion.div>
          )}

          {/* ── Results ────────────────────────────────────── */}
          {!isLoading && !searchError && hasSearched && results.length > 0 && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header */}
              <div className="text-center">
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-navy">
                  We found{' '}
                  <span className="inline-flex items-center justify-center min-w-[2rem] px-2.5 py-0.5 text-lg md:text-xl bg-amber/10 text-amber rounded-full font-bold align-middle mx-1">
                    {results.length}
                  </span>{' '}
                  trial{results.length !== 1 && 's'} for you
                </h2>
                <p className="mt-3 text-sm text-slate">
                  Results pulled live from ClinicalTrials.gov
                </p>
              </div>

              {/* Alert button bar */}
              <div className="flex items-center justify-between mb-4 mt-8">
                <div className="flex items-center gap-4">
                  <p className="text-sm text-slate-500">
                    {filteredResults.length} results found
                  </p>
                  <button
                    onClick={() => setShowFilters(p => !p)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      showFilters 
                        ? 'border-amber text-amber bg-amber/10' 
                        : 'border-warm-gray text-slate-500'
                    }`}
                  >
                    ⚙ Filters {filters.phases.length > 0 || filters.studyType !== 'ALL' 
                      ? `(active)` : ''}
                  </button>
                </div>
                {currentQuery && (
                  <button
                    onClick={() => { setShowFilters(false); setShowAlertModal(true); }}
                    className="text-xs px-3 py-1.5 border border-amber text-amber 
                               rounded-full hover:bg-amber hover:text-white transition-colors"
                  >
                    🔔 Alert me for new matches
                  </button>
                )}
              </div>

              {showFilters && results.length > 0 && (
                <div className="mb-6">
                  <SearchFilters 
                    filters={filters} 
                    onChange={setFilters}
                    resultCount={filteredResults.length}
                  />
                </div>
              )}

              {/* Cards grid */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {filteredResults.map((trial) => (
                  <motion.div key={trial.title} variants={cardVariants}>
                    <TrialCard trial={trial} />
                  </motion.div>
                ))}
              </motion.div>

              {/* Load More section */}
              {hasSearched && !isLoading && results.length > 0 && (
                <div className="mt-8 text-center">
                  <p className="text-sm text-slate-500 mb-4">
                    Showing {totalLoaded} result{totalLoaded !== 1 ? 's' : ''}
                    {nextPageToken ? ' · more available' : ' · no more results'}
                  </p>
                  {nextPageToken && (
                    <button
                      onClick={onLoadMore}
                      disabled={isLoadingMore}
                      className="px-6 py-2.5 rounded-full border border-amber text-amber
                                 hover:bg-amber hover:text-white transition-colors text-sm
                                 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoadingMore ? 'Loading...' : 'Load More Results'}
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Alert creation modal */}
      {showAlertModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center 
                        justify-center p-4"
             onClick={() => setShowAlertModal(false)}>
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm"
               onClick={e => e.stopPropagation()}
               ref={alertModalRef}
               tabIndex={-1}>
            <h3 className="text-navy font-semibold mb-1">Get notified</h3>
            <p className="text-slate-500 text-sm mb-4">
              We&apos;ll email you when new trials matching
              <strong> &quot;{currentQuery}&quot;</strong> appear.
            </p>
            <div className="space-y-3 mb-4">
              <div>
                <label htmlFor="alertEmail" className="sr-only">Alert Email</label>
                <input id="alertEmail" type="email" value={alertEmail}
                       onChange={e => setAlertEmail(e.target.value)}
                       placeholder="your@email.com"
                       className="w-full border border-warm-gray rounded-lg 
                                  px-3 py-2 text-sm focus:outline-none focus:border-amber" />
              </div>
              <div>
                <label htmlFor="alertFrequency" className="sr-only">Alert Frequency</label>
                <select id="alertFrequency" value={alertFrequency}
                        onChange={e => setAlertFrequency(e.target.value as 'daily' | 'weekly')}
                        className="w-full border border-warm-gray rounded-lg 
                                   px-3 py-2 text-sm focus:outline-none focus:border-amber">
                  <option value="weekly">Weekly digest</option>
                  <option value="daily">Daily</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={createAlert}
                      disabled={!alertEmail.includes('@') || isCreatingAlert}
                      className="flex-1 bg-amber text-white rounded-lg py-2 text-sm 
                                 font-medium disabled:opacity-50">
                {isCreatingAlert ? 'Creating...' : 'Create Alert'}
              </button>
              <button onClick={() => setShowAlertModal(false)}
                      className="px-4 py-2 border border-warm-gray rounded-lg 
                                 text-sm text-slate-500">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}


