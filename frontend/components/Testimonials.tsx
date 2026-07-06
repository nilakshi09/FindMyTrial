'use client';

import { useRef } from 'react';
import { motion, useInView, type Variants } from 'framer-motion';

const testimonials = [
  {
    quote:
      "I'd been on the same treatment for 4 years with no improvement. I typed two sentences and found a trial 40 miles away. I'm enrolling next month.",
    name: 'Sarah M.',
    condition: 'diagnosed with relapsing MS',
    direction: 'left' as const,
  },
  {
    quote:
      "My doctor didn't know about this trial. I shared my FindMyTrial results at my next appointment. We're now looking at this together.",
    name: 'James T.',
    condition: 'stage 3 NSCLC',
    direction: 'up' as const,
  },
  {
    quote:
      'I thought clinical trials were only for wealthy people or people near big research hospitals. This showed me three recruiting near me, one with a travel stipend.',
    name: 'Priya K.',
    condition: 'rare autoimmune condition',
    direction: 'right' as const,
  },
];

function getDirectionalVariants(direction: 'left' | 'up' | 'right'): Variants {
  const offset =
    direction === 'left'
      ? { x: -60, y: 0 }
      : direction === 'right'
      ? { x: 60, y: 0 }
      : { x: 0, y: 40 };

  return {
    hidden: { opacity: 0, ...offset },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
    },
  };
}

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

export default function Testimonials() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  return (
    <section
      className="py-24 md:py-32 relative overflow-hidden"
      ref={sectionRef}
      style={{
        background:
          'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(200,146,42,0.04) 0%, transparent 70%), #FAF7F2',
      }}
    >
      <div className="max-w-6xl mx-auto px-6">
        {/* Section label with decorative lines */}
        <motion.div
          className="flex items-center justify-center gap-3"
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
        >
          <span className="block w-8 h-[1.5px] bg-amber/40 rounded-full" />
          <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-amber font-sans">
            What Patients Are Saying
          </span>
          <span className="block w-8 h-[1.5px] bg-amber/40 rounded-full" />
        </motion.div>

        <motion.h2
          className="mt-3 font-serif text-3xl md:text-[40px] font-bold text-navy text-center leading-[1.15]"
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
        >
          For people who&apos;ve run out of options — and found one.
        </motion.h2>

        <motion.div
          className="mt-16 grid md:grid-cols-3 gap-7 items-stretch"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {testimonials.map((t) => (
            <motion.div
              key={t.name}
              className="testimonial-card group relative flex flex-col bg-white/80 backdrop-blur-sm border border-warm-gray/60 rounded-[20px] p-10 shadow-[0_4px_24px_rgba(15,31,61,0.06)] transition-all duration-[350ms] hover:-translate-y-2 hover:shadow-[0_20px_48px_rgba(15,31,61,0.12)] hover:border-amber/40"
              style={{
                transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              }}
              variants={getDirectionalVariants(t.direction)}
            >
              {/* Decorative quote mark — larger, more visible, fades in on hover */}
              <span
                className="absolute top-2 left-5 font-serif text-[140px] text-amber/10 leading-none select-none pointer-events-none z-0 transition-all duration-500 group-hover:text-amber/25"
                aria-hidden="true"
              >
                &ldquo;
              </span>

              {/* Quote text */}
              <p className="relative z-[1] flex-1 text-base text-navy leading-[1.8] italic pt-10">
                {t.quote}
              </p>

              {/* Attribution with amber left border accent */}
              <p className="relative z-[1] mt-6 text-sm text-slate not-italic border-l-2 border-amber pl-3">
                — {t.name}, {t.condition}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
