import Link from 'next/link';

interface AuthCardProps {
  children: React.ReactNode;
  bottomLinkText?: string;
  bottomLinkActionText?: string;
  bottomLinkHref?: string;
}

export default function AuthCard({ 
  children, 
  bottomLinkText,
  bottomLinkActionText,
  bottomLinkHref
}: AuthCardProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-ivory font-sans">
      
      {/* Logo */}
      <Link href="/" className="flex items-center justify-center gap-1.5 group mb-8" aria-label="FindMyTrial Home">
        <span className="font-serif text-[24px] font-bold text-navy tracking-tight group-hover:opacity-80 transition-opacity duration-300">
          FindMyTrial
        </span>
        <span className="w-2 h-2 rounded-full bg-amber mt-0.5 group-hover:scale-125 transition-transform duration-300" />
      </Link>

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.05)] border border-warm-gray p-8 md:p-10 hover:shadow-md transition-shadow duration-300 ease-out card-hover-glow">
        {children}
      </div>

      {/* Bottom Links */}
      <div className="mt-8 space-y-6 w-full max-w-md">
        {bottomLinkText && bottomLinkActionText && bottomLinkHref && (
          <div className="text-center text-sm text-slate-500">
            {bottomLinkText}{' '}
            <Link href={bottomLinkHref} className="text-navy font-semibold hover:underline transition-colors focus-ring-amber">
              {bottomLinkActionText}
            </Link>
          </div>
        )}
        
        <div className="text-center">
          <Link href="/" className="text-sm font-medium text-slate-500 hover:text-navy transition-colors focus-ring-amber">
            &larr; Back to home
          </Link>
        </div>
      </div>

    </div>
  );
}
