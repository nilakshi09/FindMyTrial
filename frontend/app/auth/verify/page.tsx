import Link from 'next/link';

export default function VerifyPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-ivory font-sans">
      
      {/* Logo */}
      <Link href="/" className="flex items-center justify-center gap-1.5 group mb-8" aria-label="FindMyTrial Home">
        <span className="font-serif text-[24px] font-bold text-navy tracking-tight group-hover:opacity-80 transition-opacity duration-300">
          FindMyTrial
        </span>
        <span className="w-2 h-2 rounded-full bg-amber mt-0.5 group-hover:scale-125 transition-transform duration-300" />
      </Link>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.05)] border border-warm-gray p-8 md:p-10 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-navy tracking-tight">Check your email</h2>
        <p className="text-slate-500 text-sm leading-relaxed">
          A sign-in link has been sent to your email address. Please check your inbox and click the link to sign in.
        </p>
      </div>

      <div className="mt-8">
        <Link href="/" className="text-sm font-medium text-slate-500 hover:text-navy transition-colors">
          &larr; Back to home
        </Link>
      </div>
    </div>
  );
}
