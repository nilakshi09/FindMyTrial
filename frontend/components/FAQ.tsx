'use client';

import { useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, useInView, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    q: 'Is FindMyTrial free to use?',
    a: 'Yes, completely. There are no paywalls, no premium tiers, and no hidden costs. FindMyTrial will always be free for patients.',
  },
  {
    q: 'Where does the trial data come from?',
    a: 'All trial data is pulled in real time from ClinicalTrials.gov, the official U.S. registry maintained by the National Institutes of Health. We don\'t store or alter the underlying data — we just make it readable.',
  },
  {
    q: 'Do I need to create an account?',
    a: 'Not to search. You can find and read trial matches without signing up for anything. An account will eventually let you save trials and get alerts for new matches, but that\'s optional.',
  },
  {
    q: 'What if I don\'t know my exact diagnosis or stage?',
    a: 'That\'s fine. Describe your situation as best you can — your symptoms, what treatments you\'ve tried, how long you\'ve had the condition. FindMyTrial is built to handle plain, imprecise language.',
  },
  {
    q: 'Will this actually find trials near me?',
    a: 'We filter for location where the trial data includes it. Some trials are remote or have travel stipends. We surface both and tell you clearly what\'s required.',
  },
  {
    q: 'How is this different from searching ClinicalTrials.gov directly?',
    a: 'ClinicalTrials.gov was built for researchers, not patients. It requires clinical terminology, manual filtering, and the ability to parse dense protocol language. FindMyTrial accepts plain english, filters for you, and rewrites every result so a non-expert can understand it in under a minute.',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] as [number, number, number, number] },
  },
};

export default function FAQ() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 });
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 md:py-32 bg-ivory" ref={sectionRef}>
      <div className="max-w-3xl mx-auto px-6">
        {/* Section Header with label treatment */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] as [number, number, number, number] }}
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="block w-8 h-[1.5px] bg-amber/40 rounded-full" />
            <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-amber font-sans">
              FAQ
            </span>
            <span className="block w-8 h-[1.5px] bg-amber/40 rounded-full" />
          </div>
          <h2 className="font-serif text-3xl md:text-[40px] font-bold text-navy leading-[1.15]">
            Questions we hear a lot.
          </h2>
        </motion.div>

        <motion.div
          className="mt-16 space-y-0 divide-y divide-warm-gray/40"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {faqs.map((faq, i) => (
            <motion.div key={i} variants={itemVariants}>
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between py-6 text-left group hover:bg-[#F5EFE6]/80 transition-colors duration-300 ease-out px-3 -mx-3 rounded-lg focus-ring-amber"
                aria-expanded={openIndex === i}
                aria-controls={`faq-answer-${i}`}
              >
                <span className="text-base text-navy font-medium pr-4">
                  {faq.q}
                </span>
                <motion.div
                  animate={{ rotate: openIndex === i ? 180 : 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className="shrink-0"
                >
                  <ChevronDown size={18} className="text-amber" />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {openIndex === i && (
                  <motion.div
                    id={`faq-answer-${i}`}
                    key={`answer-${i}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{
                      height: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] as [number, number, number, number] },
                      opacity: { duration: 0.25, delay: 0.05 },
                    }}
                    className="overflow-hidden"
                  >
                    <p className="pb-6 px-3 text-sm text-slate leading-relaxed">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
