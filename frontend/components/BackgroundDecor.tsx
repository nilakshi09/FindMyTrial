'use client';

/**
 * BackgroundDecor — Subtle animated ambient texture for the main page.
 *
 * Renders a few large, soft, blurred amber/navy gradient orbs that float
 * behind all content. Reuses the existing float-orb keyframes defined in
 * globals.css. Fully pointer-events-none so nothing is ever blocked.
 */
export default function BackgroundDecor() {
  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none z-0"
      aria-hidden="true"
    >
      {/* Top-left amber orb */}
      <div
        className="absolute -top-[10%] -left-[5%] w-[600px] h-[600px] rounded-full animate-float-orb"
        style={{
          background:
            'radial-gradient(circle, rgba(200,146,42,0.06) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      {/* Center-right navy orb */}
      <div
        className="absolute top-[30%] -right-[8%] w-[500px] h-[500px] rounded-full animate-float-orb-delayed"
        style={{
          background:
            'radial-gradient(circle, rgba(10,22,40,0.05) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      {/* Bottom-center amber orb */}
      <div
        className="absolute bottom-[5%] left-[20%] w-[550px] h-[550px] rounded-full animate-float-orb-slow"
        style={{
          background:
            'radial-gradient(circle, rgba(200,146,42,0.05) 0%, transparent 65%)',
          filter: 'blur(70px)',
        }}
      />

      {/* Mid-left small amber accent */}
      <div
        className="absolute top-[55%] -left-[3%] w-[350px] h-[350px] rounded-full animate-float-orb-delayed"
        style={{
          background:
            'radial-gradient(circle, rgba(200,146,42,0.04) 0%, transparent 60%)',
          filter: 'blur(50px)',
        }}
      />
    </div>
  );
}
