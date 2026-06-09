'use client';

import { useState } from 'react';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';

const headlineWords = ["You", "deserve", "to", "know", "what's", "out", "there."];

export default function FinalCTA() {
  const { ref, isVisible } = useScrollAnimation();
  const [hovering, setHovering] = useState(false);

  return (
    <section className="py-24 md:py-32 bg-navy" ref={ref}>
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="font-serif text-3xl md:text-[40px] lg:text-5xl font-bold text-ivory leading-[1.15]">
          {headlineWords.map((word, i) => (
            <span
              key={i}
              className={`inline-block mr-[0.3em] transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
              }`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              {word}
            </span>
          ))}
        </h2>
        <p
          className={`mt-5 text-base text-ivory/60 leading-relaxed max-w-lg mx-auto transition-all duration-700 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          It takes 30 seconds. No signup. No jargon. Just answers.
        </p>
        <div
          className={`mt-10 transition-all duration-700 delay-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <a
            href="#hero"
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            className={`inline-block bg-amber text-white text-base font-semibold px-10 py-4 rounded-full animate-pulse-glow transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_0_30px_6px_rgba(200,146,42,0.25)] relative overflow-hidden ${
              hovering ? 'animate-shimmer' : ''
            }`}
          >
            Find My Trial Now
          </a>
        </div>
        <p
          className={`mt-6 text-xs text-ivory/40 transition-all duration-700 delay-[900ms] ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          Powered by ClinicalTrials.gov. Updated daily. Always free.
        </p>
      </div>
    </section>
  );
}
