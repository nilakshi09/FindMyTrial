export default function Footer() {
  return (
    <footer className="bg-ivory border-t border-warm-gray/60 py-10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <a href="#" className="flex items-center gap-1">
            <span className="font-serif text-lg font-bold text-navy">
              FindMyTrial
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber mt-0.5" />
          </a>

          <div className="flex gap-6 text-xs text-slate">
            <a href="#" className="hover:text-navy transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-navy transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-navy transition-colors">
              Contact
            </a>
          </div>
        </div>

        <p className="mt-6 text-[11px] text-slate/60 text-center md:text-left leading-relaxed">
          FindMyTrial is not a medical provider. Always discuss clinical trial
          participation with your physician.
        </p>
      </div>
    </footer>
  );
}
