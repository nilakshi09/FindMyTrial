'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Eye, EyeOff } from 'lucide-react';
import AuthCard from '@/components/AuthCard';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 mr-3" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name || !email || !password) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 409 || data?.message?.toLowerCase().includes('already registered')) {
          throw new Error('This email is already registered.');
        }
        throw new Error(data.message || 'Something went wrong during sign up.');
      }

      // Automatically sign in after successful sign up
      const signInResult = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        setErrorMsg('Account created, but failed to sign in automatically.');
        setLoading(false);
      } else {
        window.location.href = '/';
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error. Please try again later.');
      setLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    signIn('google', { callbackUrl: '/' });
  };

  return (
    <AuthCard
      bottomLinkText="Already have an account?"
      bottomLinkActionText="Sign in"
      bottomLinkHref="/auth/signin"
    >
      <div className="text-center mb-8">
        <h2 className="font-serif text-2xl font-bold text-navy tracking-tight">Create your account</h2>
        <p className="mt-2 text-sm text-slate-500">
          Find clinical trials that match your situation
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm text-center font-medium">
          {errorMsg}
        </div>
      )}

      <button
        type="button"
        onClick={handleGoogleSignUp}
        className="w-full flex items-center justify-center bg-white border border-warm-gray text-navy text-sm font-semibold px-6 py-3.5 rounded-xl transition-all duration-300 ease-out hover:bg-amber/5 hover:border-amber/30 active:scale-[0.98] focus-ring-amber"
      >
        <GoogleIcon />
        Sign up with Google
      </button>

      <div className="my-6 flex items-center before:mt-0.5 before:flex-1 before:border-t before:border-warm-gray after:mt-0.5 after:flex-1 after:border-t after:border-warm-gray">
        <p className="mx-4 mb-0 text-center text-sm text-slate-500 font-medium whitespace-nowrap">or sign up with email</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-navy mb-1.5">
            Full Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            placeholder="Jane Doe"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errorMsg) setErrorMsg('');
            }}
            className="w-full border border-warm-gray rounded-xl px-4 py-3 text-sm text-navy placeholder:text-slate-400 focus:outline-none focus:border-amber focus-visible:ring-2 focus-visible:ring-amber/40 bg-transparent transition-colors"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-navy mb-1.5">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errorMsg) setErrorMsg('');
            }}
            className="w-full border border-warm-gray rounded-xl px-4 py-3 text-sm text-navy placeholder:text-slate-400 focus:outline-none focus:border-amber focus-visible:ring-2 focus-visible:ring-amber/40 bg-transparent transition-colors"
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-navy mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              className="w-full border border-warm-gray rounded-xl pl-4 pr-11 py-3 text-sm text-navy placeholder:text-slate-400 focus:outline-none focus:border-amber focus-visible:ring-2 focus-visible:ring-amber/40 bg-transparent transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus-ring-amber rounded-md p-0.5"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
        
        <button 
          type="submit" 
          className="w-full relative overflow-hidden bg-amber text-white text-sm font-semibold px-6 py-3.5 rounded-xl transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 hover:scale-[1.02] hover:shadow-glow-amber active:scale-[0.98] mt-2 focus-ring-amber"
          disabled={loading}
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

    </AuthCard>
  );
}
