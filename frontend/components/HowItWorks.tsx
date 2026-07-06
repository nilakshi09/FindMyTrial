'use client';

import { useRef, useState } from 'react';
import { FileText, Search, BookOpen } from 'lucide-react';
import { motion, useInView } from 'framer-motion';

const steps = [
  {
    number: '01',
    icon: FileText,
    title: 'Describe your situation',
    description:
      'Type your diagnosis, treatment history, and location in your own words. No clinical terminology needed.',
  },
  {
    number: '02',
    icon: Search,
    title: 'We search in real time',
    description:
      'FindMyTrial queries ClinicalTrials.gov live, filtering for actively recruiting trials that match your profile.',
  },
  {
    number: '03',
    icon: BookOpen,
    title: 'Read results in plain English',
    description:
      "Each match is rewritten by AI: what's being tested, what participation involves, how long it runs, and what compensation is offered.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
};

function StepNode({
  step,
  index,
}: {
  step: (typeof steps)[0];
  index: number;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className="flex flex-col items-center text-center"
      variants={itemVariants}
    >
      <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-amber font-sans mb-3">
        Step {step.number}
      </span>

      {/* Gradient border circle with glow */}
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative cursor-default"
      >
        {/* Outer gradient border ring */}
        <div
          className={`absolute -inset-[3px] rounded-full transition-all duration-300 ${
            hovered
              ? 'opacity-100 shadow-[0_0_24px_6px_rgba(200,146,42,0.35)]'
              : 'opacity-60'
          }`}
          style={{
            background: 'linear-gradient(135deg, #C8922A 0%, #E8B84A 50%, #C8922A 100%)',
          }}
        />
        <motion.div
          animate={hovered ? { scale: 1.06 } : { scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="relative w-20 h-20 rounded-full flex items-center justify-center"
          style={{
            background: hovered
              ? 'linear-gradient(135deg, #C8922A 0%, #E8B84A 100%)'
              : 'linear-gradient(135deg, #F5E6C8 0%, #EDD9B4 100%)',
          }}
        >
          <step.icon
            size={30}
            className={`transition-colors duration-300 ${
              hovered ? 'text-white' : 'text-amber'
            }`}
            strokeWidth={1.5}
          />
        </motion.div>
      </div>

      <h3 className="font-serif text-[22px] font-bold text-navy mt-5">
        {step.title}
      </h3>
      <p className="mt-2 text-[15px] text-slate leading-relaxed max-w-[240px]">
        {step.description}
      </p>
    </motion.div>
  );
}

export default function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  return (
    <section
      id="how-it-works"
      className="py-24 md:py-32 bg-[#F5EFE6] overflow-hidden"
      ref={sectionRef}
    >
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          className="text-center relative"
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
        >
          {/* Subtle gradient orb behind title */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[160px] rounded-full pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(200,146,42,0.08) 0%, transparent 70%)',
            }}
          />

          {/* Label with decorative flanking lines */}
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="block w-8 h-[1.5px] bg-amber/40 rounded-full" />
            <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-amber font-sans">
              How It Works
            </span>
            <span className="block w-8 h-[1.5px] bg-amber/40 rounded-full" />
          </div>

          <h2 className="relative font-serif text-3xl md:text-[40px] font-bold text-navy leading-[1.15]">
            From your words to your match — in three steps.
          </h2>
          <p className="mt-4 text-base text-slate max-w-md mx-auto relative">
            No forms. No clinical jargon. No dead ends.
          </p>
        </motion.div>

        {/* Desktop: horizontal with connecting line */}
        <motion.div
          className="hidden md:flex items-start justify-between mt-16 relative"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {/* Connecting dashed line */}
          <div className="absolute top-[70px] left-[16.67%] right-[16.67%] h-[2px] overflow-hidden">
            <motion.div
              className="h-full border-t-2 border-dashed border-amber/40"
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
              style={{ transformOrigin: 'left center' }}
            />
          </div>

          {steps.map((step, i) => (
            <div key={step.number} className="flex-1 flex justify-center">
              <StepNode step={step} index={i} />
            </div>
          ))}
        </motion.div>

        {/* Mobile: vertical timeline */}
        <motion.div
          className="md:hidden mt-16 relative pl-10"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {/* Vertical connecting line */}
          <div className="absolute left-[23px] top-0 bottom-0 w-[2px] overflow-hidden">
            <motion.div
              className="w-full h-full border-l-2 border-dashed border-amber/40"
              initial={{ scaleY: 0 }}
              animate={isInView ? { scaleY: 1 } : { scaleY: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
              style={{ transformOrigin: 'top center' }}
            />
          </div>

          <div className="space-y-12">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                className="flex items-start gap-5"
                variants={itemVariants}
              >
                {/* Circle on the line — larger for touch targets */}
                <div className="shrink-0 w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-[#F5E6C8] to-[#EDD9B4] relative -ml-[25px] shadow-sm">
                  <div
                    className="absolute -inset-[2px] rounded-full opacity-50"
                    style={{
                      background: 'linear-gradient(135deg, #C8922A 0%, #E8B84A 100%)',
                    }}
                  />
                  <div className="relative w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-[#F5E6C8] to-[#EDD9B4]">
                    <step.icon size={20} className="text-amber" strokeWidth={1.5} />
                  </div>
                </div>
                <div className="pt-1">
                  <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-amber font-sans">
                    Step {step.number}
                  </span>
                  <h3 className="font-serif text-[20px] font-bold text-navy mt-1">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-slate leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
