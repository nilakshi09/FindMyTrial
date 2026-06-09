'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';

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
    a: 'ClinicalTrials.gov was built for researchers, not patients. It requires clinical terminology, manual filtering, and the ability to parse dense protocol language. FindMyTrial accepts plain English, filters for you, and rewrites every result so a non-expert can understand it in under a minute.',
  },
];

export default function FAQ() {
  const { ref, isVisible } = useScrollAnimation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 md:py-32 bg-ivory" ref={ref}>
      <div className="max-w-3xl mx-auto px-6">
        <h2
          className={`font-serif text-3xl md:text-[40px] font-bold text-navy text-center leading-[1.15] transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          Questions we hear a lot.
        </h2>

        <div className="mt-16 space-y-0 divide-y divide-warm-gray">
          {faqs.map((faq, i) => (
            <div key={i}>
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between py-5 text-left group hover:bg-[#F5EFE6] transition-colors duration-200 px-2 -mx-2 rounded-lg"
              >
                <span className="text-base text-navy font-medium pr-4">
                  {faq.q}
                </span>
                <ChevronDown
                  size={18}
                  className={`text-amber shrink-0 transition-transform duration-300 ${
                    openIndex === i ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div
                className={`grid transition-all duration-300 ${
                  openIndex === i
                    ? 'grid-rows-[1fr] opacity-100'
                    : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <p
                    className={`pb-5 px-2 text-sm text-slate leading-relaxed transition-all duration-300 ${
                      openIndex === i
                        ? 'translate-y-0 opacity-100'
                        : 'translate-y-2 opacity-0'
                    }`}
                  >
                    {faq.a}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
