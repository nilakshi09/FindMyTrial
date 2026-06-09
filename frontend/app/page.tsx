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
import type { TrialData } from '@/components/TrialCard';

export default function Home() {
  const [results, setResults] = useState<TrialData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback(async (query: string) => {
    setIsLoading(true);
    setHasSearched(true);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }

    setTimeout(() => {
      const el = document.getElementById('search-results');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }, []);

  return (
    <main className="bg-ivory min-h-screen">
      <Navbar />
      <Hero onSearch={handleSearch} isLoading={isLoading} />
      <div id="search-results">
        <SearchResults
          results={results}
          isLoading={isLoading}
          hasSearched={hasSearched}
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
