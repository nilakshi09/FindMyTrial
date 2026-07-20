'use client';

import { useState, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import SearchResults from '@/components/SearchResults';
import HowItWorks from '@/components/HowItWorks';
import SampleTrials from '@/components/SampleTrials';
import Testimonials from '@/components/Testimonials';
import FAQ from '@/components/FAQ';
import FinalCTA from '@/components/FinalCTA';
import Footer from '@/components/Footer';
import BackgroundDecor from '@/components/BackgroundDecor';
import type { TrialData } from '@/components/TrialCard';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const { toast } = useToast();
  const [results, setResults] = useState<TrialData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [location, setLocation] = useState('');
  const [lastSearchedQuery, setLastSearchedQuery] = useState('');
  const [nextPageToken, setNextPageToken] = useState<string | undefined>(undefined);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const handleSearch = useCallback(async (query: string) => {
    setIsLoading(true);
    setHasSearched(true);
    setSearchError(null);
    setNextPageToken(undefined);
    setResults([]);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`);
      const data = await res.json();

      if (data.error) {
        setSearchError(data.error);
        setResults([]);
      } else {
        setResults(data.results || []);
        setNextPageToken(data.nextPageToken);
      }
    } catch {
      setSearchError('Unable to reach the trial database. Please check your connection and try again.');
      setResults([]);
    } finally {
      setIsLoading(false);
      setLastSearchedQuery(query);
    }

    setTimeout(() => {
      const el = document.getElementById('search-results');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }, [location]);

  const handleRetrySearch = useCallback((query: string) => {
    handleSearch(query);
  }, [handleSearch]);

  const handleLoadMore = useCallback(async () => {
    if (!nextPageToken || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(lastSearchedQuery)}&location=${encodeURIComponent(location)}&pageToken=${encodeURIComponent(nextPageToken)}`
      );
      const data = await res.json();
      setResults(prev => [...prev, ...(data.results ?? [])]);
      setNextPageToken(data.nextPageToken);
    } catch {
      // Silently fail — existing results remain
    } finally {
      setIsLoadingMore(false);
    }
  }, [nextPageToken, isLoadingMore, lastSearchedQuery, location]);

  return (
    <main id="main-content" className="relative bg-ivory min-h-screen">
      <BackgroundDecor />
      <Navbar />
      <Hero onSearch={handleSearch} location={location} onLocationChange={setLocation} isLoading={isLoading} />
      <div className="flex justify-center p-4">
        <button 
          onClick={() => toast({ title: 'Toast works!', description: 'shadcn/ui toast is wired.' })}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Test Toast
        </button>
      </div>
      <div id="search-results">
        <SearchResults
          results={results}
          isLoading={isLoading}
          hasSearched={hasSearched}
          searchError={searchError}
          activeLocation={location}
          currentQuery={lastSearchedQuery}
          currentLocation={location}
          onSearch={handleRetrySearch}
          nextPageToken={nextPageToken}
          isLoadingMore={isLoadingMore}
          onLoadMore={handleLoadMore}
          totalLoaded={results.length}
        />
      </div>
      <HowItWorks />
      <SampleTrials />
      <Testimonials />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}

