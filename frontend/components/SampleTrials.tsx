'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import TrialCard, { TrialData } from './TrialCard';

const sampleTrials: TrialData[] = [
  {
    nctId: 'NCT00000001',
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
    nctId: 'NCT00000002',
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
    nctId: 'NCT00000003',
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

/* ── Animation variants ─────────────────────────────────────── */
const headingVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
};

const subtextVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.12,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
};

/* ── Component ──────────────────────────────────────────────── */
export default function SampleTrials() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' });

  return (
    <section
      id="sample-results"
      className="py-24 md:py-32 bg-ivory"
      ref={sectionRef}
    >
      <div className="max-w-6xl mx-auto px-6">
        {/* Decorative label */}
        <motion.div
          className="text-center"
          variants={headingVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-amber mb-4">
            Sample Results
          </span>
          <h2 className="font-serif text-3xl md:text-[40px] font-bold text-navy leading-[1.15]">
            This is what a match looks like.
          </h2>
        </motion.div>

        <motion.p
          className="mt-4 text-base text-slate text-center max-w-xl mx-auto"
          variants={subtextVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          Real trial data, rewritten so anyone can understand it.
        </motion.p>

        {/* Cards grid */}
        <motion.div
          className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {sampleTrials.map((trial) => (
            <motion.div key={trial.title} variants={cardVariants}>
              <TrialCard trial={trial} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
