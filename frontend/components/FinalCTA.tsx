'use client';

import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

const headlineWords = ["You", "deserve", "to", "know", "what's", "out", "there."];

export default function FinalCTA() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });
  const [hovering, setHovering] = useState(false);

  return (
    <section
      className="py-28 md:py-36 relative overflow-hidden"
      ref={sectionRef}
      style={{
        background: 'linear-gradient(180deg, #0A1628 0%, #060E1A 100%)',
      }}
    >
      {/* Decorative gradient orbs for depth */}
      <div
        className="absolute top-0 left-1/4 w-[500px] h-[400px] rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(200,146,42,0.06) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute bottom-0 right-1/4 w-[400px] h-[350px] rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(10,22,40,0.8) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute top-1/3 right-1/6 w-[300px] h-[300px] rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(200,146,42,0.04) 0%, transparent 60%)',
        }}
      />

      <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
        {/* Word-by-word headline reveal */}
        <h2 className="font-serif text-3xl md:text-[40px] lg:text-5xl font-bold text-ivory leading-[1.15]">
          {headlineWords.map((word, i) => (
            <motion.span
              key={i}
              className="inline-block mr-[0.3em]"
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              transition={{
                duration: 0.45,
                delay: i * 0.06,
                ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
              }}
            >
              {word}
            </motion.span>
          ))}
        </h2>

        {/* Subtitle fades up with delay */}
        <motion.p
          className="mt-5 text-base text-ivory/60 leading-relaxed max-w-lg mx-auto"
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.6, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
        >
          It takes 30 seconds. No signup. No jargon. Just answers.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          className="mt-10"
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.6, delay: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
        >
          <motion.a
            href="#hero"
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            animate={hovering ? { scale: 1.04 } : { scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="relative inline-block text-white text-base font-semibold px-10 py-4 rounded-full overflow-hidden shadow-[0_0_20px_4px_rgba(200,146,42,0.2)] hover:shadow-[0_0_36px_8px_rgba(200,146,42,0.35)] transition-shadow duration-300"
            style={{
              background: 'linear-gradient(135deg, #C8922A 0%, #E8B84A 50%, #C8922A 100%)',
            }}
          >
            {/* Shimmer overlay on hover */}
            <span
              className={`absolute inset-0 transition-opacity duration-500 ${
                hovering ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                background:
                  'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)',
                animation: hovering ? 'shimmer 1.5s ease-in-out infinite' : 'none',
              }}
            />
            <span className="relative z-[1]">Find My Trial Now</span>
          </motion.a>
        </motion.div>

        {/* Bottom caption fades in last */}
        <motion.p
          className="mt-6 text-xs text-ivory/40"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          Powered by ClinicalTrials.gov. Updated daily. Always free.
        </motion.p>
      </div>

      {/* Inline shimmer keyframes */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </section>
  );
}
