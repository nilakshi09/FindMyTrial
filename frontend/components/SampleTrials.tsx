'use client';

import TrialCard, { TrialData } from './TrialCard';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';

const sampleTrials: TrialData[] = [
  {
    title: 'Investigating Belimumab + Standard Therapy in Moderate-to-Severe Lupus',
    status: 'Actively Recruiting',
    conditions: ['Systemic Lupus Erythematosus', 'Lupus Nephritis'],
    phase: 'Phase 3',
    summary:
      'This trial is testing whether adding belimumab to standard therapy improves outcomes in people with moderate-to-severe lupus. Participants will receive either the study drug or a placebo alongside their current treatment for 48 weeks, with regular check-ins.',
    location: 'Boston, MA',
    duration: '48 weeks',
    compensation: 'Travel stipend provided',
    ages: 'Ages 18–65',
  },
  {
    title: 'A New Immunotherapy Approach for Relapsing Multiple Sclerosis',
    status: 'Actively Recruiting',
    conditions: ['Relapsing MS', 'Multiple Sclerosis'],
    phase: 'Phase 2',
    summary:
      'Researchers are evaluating a new immunotherapy designed to reduce relapse rates in people with relapsing-remitting MS. Participation involves monthly infusions over 12 months and regular MRI scans to track lesion activity.',
    location: 'Chicago, IL',
    duration: '12 months',
    compensation: 'Up to $2,400',
    ages: 'Ages 21–55',
  },
  {
    title: 'Targeted Therapy for Stage 3 Non-Small Cell Lung Cancer',
    status: 'Actively Recruiting',
    conditions: ['NSCLC', 'Stage 3 Lung Cancer'],
    phase: 'Phase 2/3',
    summary:
      'This study compares a targeted oral therapy against standard chemotherapy in patients with stage 3 NSCLC whose tumors carry a specific genetic marker. It involves taking a daily pill for up to 18 months with bi-monthly scans.',
    location: 'Houston, TX',
    duration: '18 months',
    compensation: 'No cost to participate',
    ages: 'Ages 30–75',
  },
];

export default function SampleTrials() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section
      id="sample-results"
      className="py-24 md:py-32 bg-ivory"
      ref={ref}
    >
      <div className="max-w-6xl mx-auto px-6">
        <h2
          className={`font-serif text-3xl md:text-[40px] font-bold text-navy text-center leading-[1.15] transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          This is what a match looks like.
        </h2>
        <p
          className={`mt-4 text-base text-slate text-center max-w-xl mx-auto transition-all duration-700 delay-150 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          Real trial data, rewritten so anyone can understand it.
        </p>

        <div
          className={`mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch`}
        >
          {sampleTrials.map((trial, i) => (
            <div
              key={trial.title}
              className={`transition-all duration-700 ${
                isVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${300 + i * 100}ms` }}
            >
              <TrialCard trial={trial} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
