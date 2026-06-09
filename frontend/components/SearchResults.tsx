'use client';

import TrialCard, { TrialData } from './TrialCard';

interface SearchResultsProps {
  results: TrialData[];
  isLoading: boolean;
  hasSearched: boolean;
}

export default function SearchResults({
  results,
  isLoading,
  hasSearched,
}: SearchResultsProps) {
  if (!hasSearched && !isLoading) return null;

  return (
    <section className="py-16 md:py-24 bg-ivory border-t border-warm-gray/40">
      <div className="max-w-6xl mx-auto px-6">
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-3 bg-white rounded-full px-6 py-3 shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
              <span className="w-2 h-2 rounded-full bg-amber animate-pulse" />
              <span className="text-sm text-slate">
                Searching 470,000+ trials...
              </span>
            </div>
          </div>
        )}

        {!isLoading && hasSearched && results.length === 0 && (
          <div className="text-center py-12 max-w-md mx-auto">
            <p className="text-base text-navy font-serif font-semibold">
              We didn&apos;t find an exact match.
            </p>
            <p className="mt-3 text-sm text-slate leading-relaxed">
              Try describing your condition differently, or use fewer specific
              terms.
            </p>
          </div>
        )}

        {!isLoading && hasSearched && results.length > 0 && (
          <>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-navy text-center">
              We found {results.length} trial{results.length !== 1 && 's'} for you
            </h2>
            <p className="mt-2 text-sm text-slate text-center">
              Results pulled live from ClinicalTrials.gov
            </p>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              {results.map((trial, i) => (
                <div
                  key={trial.title}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <TrialCard trial={trial} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
