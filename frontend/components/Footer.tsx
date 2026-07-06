export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-ivory relative py-12">
      {/* Subtle top gradient border */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(200,146,42,0.3) 30%, rgba(200,146,42,0.5) 50%, rgba(200,146,42,0.3) 70%, transparent 100%)',
        }}
      />

      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo with hover effect */}
          <a
            href="#"
            className="flex items-center gap-1 transition-opacity duration-300 hover:opacity-75"
          >
            <span className="font-serif text-lg font-bold text-navy">
              FindMyTrial
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber mt-0.5" />
          </a>

          {/* Links with animated underline */}
          <div className="flex gap-8 text-xs text-slate-500">
            <a
              href="#"
              className="nav-link-underline hover:text-navy transition-colors duration-300"
            >
              Privacy
            </a>
            <a
              href="#"
              className="nav-link-underline hover:text-navy transition-colors duration-300"
            >
              Terms
            </a>
            <a
              href="#"
              className="nav-link-underline hover:text-navy transition-colors duration-300"
            >
              Contact
            </a>
          </div>
        </div>

        {/* Disclaimer — slightly more visible */}
        <p className="mt-6 text-[11px] text-slate-500 opacity-70 text-center md:text-left leading-relaxed">
          FindMyTrial is not a medical provider. Always discuss clinical trial
          participation with your physician.
        </p>

        {/* Copyright */}
        <p className="mt-3 text-[11px] text-slate-500 opacity-50 text-center md:text-left">
          &copy; {currentYear} FindMyTrial. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
