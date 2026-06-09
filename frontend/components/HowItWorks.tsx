'use client';

import { useState } from 'react';
import { FileText, Search, BookOpen } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';

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

function StepNode({
  step,
  index,
  isVisible,
}: {
  step: (typeof steps)[0];
  index: number;
  isVisible: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`flex flex-col items-center text-center transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-amber font-sans mb-3">
        Step {step.number}
      </span>

      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 cursor-default ${
          hovered ? 'scale-[1.08] animate-amber-ring-pulse' : ''
        }`}
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
      </div>

      <h3 className="font-serif text-[22px] font-bold text-navy mt-5">
        {step.title}
      </h3>
      <p className="mt-2 text-[15px] text-slate leading-relaxed max-w-[240px]">
        {step.description}
      </p>
    </div>
  );
}

export default function HowItWorks() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section
      id="how-it-works"
      className="py-24 md:py-32 bg-[#F5EFE6]"
      ref={ref}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div
          className={`text-center transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-amber font-sans">
            How It Works
          </span>
          <h2 className="font-serif text-3xl md:text-[40px] font-bold text-navy mt-3 leading-[1.15]">
            From your words to your match — in three steps.
          </h2>
          <p className="mt-4 text-base text-slate max-w-md mx-auto">
            No forms. No clinical jargon. No dead ends.
          </p>
        </div>

        {/* Desktop: horizontal with connecting line */}
        <div className="hidden md:flex items-start justify-between mt-16 relative">
          {/* Connecting dashed line */}
          <div className="absolute top-[70px] left-[16.67%] right-[16.67%] h-[2px]">
            <div
              className={`h-full border-t-2 border-dashed border-amber/40 ${
                isVisible ? 'animate-line-grow' : 'w-0'
              }`}
            />
          </div>

          {steps.map((step, i) => (
            <div key={step.number} className="flex-1 flex justify-center">
              <StepNode step={step} index={i} isVisible={isVisible} />
            </div>
          ))}
        </div>

        {/* Mobile: vertical timeline */}
        <div className="md:hidden mt-16 relative pl-10">
          {/* Vertical connecting line */}
          <div className="absolute left-[39px] top-0 bottom-0 w-[2px]">
            <div
              className={`w-full border-l-2 border-dashed border-amber/40 ${
                isVisible ? 'animate-line-grow-vertical' : 'h-0'
              }`}
            />
          </div>

          <div className="space-y-12">
            {steps.map((step, i) => (
              <div
                key={step.number}
                className={`flex items-start gap-5 transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                {/* Circle on the line */}
                <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-[#F5E6C8] to-[#EDD9B4]">
                  <step.icon size={18} className="text-amber" strokeWidth={1.5} />
                </div>
                <div className="pt-0.5">
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
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
