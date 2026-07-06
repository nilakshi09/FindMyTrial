export default function VerifyPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-card p-8 shadow-lg text-center">
        <h2 className="text-2xl font-bold tracking-tight">Check your email</h2>
        <p className="text-muted-foreground">
          A sign-in link has been sent to your email address. Please check your inbox and click the link to sign in.
        </p>
      </div>
    </div>
  );
}
