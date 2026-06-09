'use client';

import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';

interface HeroProps {
  onSearch: (query: string) => void;
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

export default function Hero({ onSearch, isLoading }: HeroProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('search') as string;
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const headlineLines = [
    'Find the clinical trial',
    'that could change everything.',
  ];

  return (
    <section id="hero" className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Animated gradient background */}
      <div
        className="absolute inset-0 animate-hero-gradient"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(200,146,42,0.06) 0%, rgba(245,239,230,0.02) 50%, transparent 80%), #FAF7F2',
          backgroundSize: '200% 200%',
        }}
      />

      <div className="relative max-w-3xl mx-auto px-6 text-center">
        {/* Live data badge */}
        <div
          className={`inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full border border-amber/30 bg-ivory/80 transition-all duration-700 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber animate-pulse-dot" />
          <span className="text-xs text-amber font-medium tracking-wide">
            Live data from ClinicalTrials.gov
          </span>
        </div>

        {/* Headline with staggered line animation */}
        <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-navy leading-[1.15] tracking-tight">
          {headlineLines.map((line, i) => (
            <span
              key={i}
              className={`block animate-headline-line ${
                mounted ? '' : 'opacity-0'
              }`}
              style={{ animationDelay: `${200 + i * 200}ms` }}
            >
              {line}
            </span>
          ))}
        </h1>

        <p
          className={`mt-6 text-base md:text-lg text-slate leading-relaxed max-w-2xl mx-auto transition-all duration-700 delay-500 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          Describe your condition in plain English. We search 470,000+ registered
          trials and surface the ones actively recruiting patients like you — in
          seconds.
        </p>

        <form
          onSubmit={handleSubmit}
          className={`mt-10 max-w-[680px] mx-auto transition-all duration-700 delay-700 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="relative flex items-center bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] border border-warm-gray/60 focus-within:border-amber/40 focus-within:shadow-[0_0_0_3px_rgba(200,146,42,0.15),0_2px_16px_rgba(0,0,0,0.06)] transition-all duration-300">
            <Search className="absolute left-5 text-slate/50" size={20} />
            <input
              name="search"
              type="text"
              placeholder="e.g. I have stage 2 lupus and my current treatment stopped working"
              className="flex-1 pl-14 pr-4 py-4 md:py-5 bg-transparent rounded-2xl text-navy placeholder:text-slate/50 text-sm md:text-base focus:outline-none"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="mr-2 bg-amber text-white text-sm font-medium px-5 py-2.5 md:px-6 md:py-3 rounded-xl hover:brightness-110 hover:scale-[1.02] hover:shadow-[0_0_20px_4px_rgba(200,146,42,0.2)] transition-all duration-200 disabled:opacity-60 shrink-0"
            >
              Find My Trial
            </button>
          </div>
        </form>

        <p
          className={`mt-4 text-xs text-slate/70 transition-all duration-700 delay-[900ms] ${
            mounted ? 'opacity-100' : 'opacity-0'
          }`}
        >
          Free to use. No account required. Pulls live data from ClinicalTrials.gov.
        </p>

        <div
          className={`mt-8 flex flex-wrap justify-center gap-3 transition-all duration-700 delay-[1000ms] ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <span className="text-xs text-slate border border-warm-gray rounded-full px-4 py-1.5 bg-white/60">
            <CountUpNumber target={470000} />+ Registered Trials
          </span>
          {['Updated Daily', 'Plain English Results'].map((pill) => (
            <span
              key={pill}
              className="text-xs text-slate border border-warm-gray rounded-full px-4 py-1.5 bg-white/60"
            >
              {pill}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
