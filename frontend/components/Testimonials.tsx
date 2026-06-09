'use client';

import { useScrollAnimation } from '@/hooks/use-scroll-animation';

const testimonials = [
  {
    quote:
      "I'd been on the same treatment for 4 years with no improvement. I typed two sentences and found a trial 40 miles away. I'm enrolling next month.",
    name: 'Sarah M.',
    condition: 'diagnosed with relapsing MS',
    direction: 'left',
  },
  {
    quote:
      "My doctor didn't know about this trial. I shared my FindMyTrial results at my next appointment. We're now looking at this together.",
    name: 'James T.',
    condition: 'stage 3 NSCLC',
    direction: 'up',
  },
  {
    quote:
      'I thought clinical trials were only for wealthy people or people near big research hospitals. This showed me three recruiting near me, one with a travel stipend.',
    name: 'Priya K.',
    condition: 'rare autoimmune condition',
    direction: 'right',
  },
];

export default function Testimonials() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section
      className="py-24 md:py-32 relative overflow-hidden"
      ref={ref}
      style={{
        background:
          'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(200,146,42,0.04) 0%, transparent 70%), #FAF7F2',
      }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <span
          className={`block text-center text-[11px] font-semibold tracking-[0.12em] uppercase text-amber font-sans transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          What Patients Are Saying
        </span>

        <h2
          className={`mt-3 font-serif text-3xl md:text-[40px] font-bold text-navy text-center leading-[1.15] transition-all duration-700 delay-100 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          For people who&apos;ve run out of options — and found one.
        </h2>

        <div className="mt-16 grid md:grid-cols-3 gap-7 items-stretch">
          {testimonials.map((t, i) => {
            const translateClass =
              t.direction === 'left'
                ? isVisible
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 -translate-x-10'
                : t.direction === 'right'
                ? isVisible
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 translate-x-10'
                : isVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-8';

            return (
              <div
                key={t.name}
                className={`testimonial-card flex flex-col bg-white border border-warm-gray/60 rounded-[20px] p-10 shadow-[0_4px_24px_rgba(15,31,61,0.06)] hover:-translate-y-1.5 hover:shadow-[0_16px_48px_rgba(15,31,61,0.12)] hover:border-amber/60 transition-all duration-[350ms] ${translateClass}`}
                style={{
                  transitionTimingFunction:
                    'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  transitionDelay: `${i * 150}ms`,
                }}
              >
                {/* Decorative quote mark */}
                <span
                  className="absolute top-4 left-6 font-serif text-[120px] text-amber/15 leading-none select-none pointer-events-none z-0 transition-opacity duration-[350ms] group-hover:text-amber/30"
                  style={{
                    transitionTimingFunction:
                      'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  }}
                  aria-hidden="true"
                >
                  &ldquo;
                </span>

                {/* Quote text */}
                <p className="relative z-[1] flex-1 text-base text-navy leading-[1.8] italic pt-8">
                  {t.quote}
                </p>

                {/* Attribution */}
                <p className="relative z-[1] mt-6 text-sm text-slate not-italic border-l-2 border-amber pl-3">
                  — {t.name}, {t.condition}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
