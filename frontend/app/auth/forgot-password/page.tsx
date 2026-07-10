import AuthCard from '@/components/AuthCard';

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      bottomLinkText="Remember your password?"
      bottomLinkActionText="Sign in"
      bottomLinkHref="/auth/signin"
    >
      <div className="text-center mb-8">
        <h2 className="font-serif text-2xl font-bold text-navy tracking-tight">Reset Password</h2>
        <p className="mt-2 text-sm text-slate-500">
          We are currently working on this feature.
        </p>
      </div>

      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber/10 text-amber mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-navy">Coming Soon</h3>
          <p className="mt-1 text-sm text-slate-500 max-w-[250px] mx-auto">
            The password reset flow will be available in a future update.
          </p>
        </div>
      </div>
    </AuthCard>
  );
}
