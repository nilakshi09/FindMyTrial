import type { Metadata } from 'next';
import { Inter, DM_Serif_Display } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { NextAuthProvider } from '@/components/NextAuthProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const dmSerif = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-dm-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'FindMyTrial — Find Clinical Trials in Plain English',
  description: 'Search 470,000+ clinical trials in plain language. ' +
    'Find actively recruiting trials matched to your condition, ' +
    'location, and eligibility — no medical expertise required.',
  keywords: 'clinical trials, clinical trial search, medical trials, ' +
    'trial matching, ClinicalTrials.gov, patient trial finder',
  openGraph: {
    title: 'FindMyTrial — Clinical Trial Search in Plain English',
    description: 'Find clinical trials that match your condition. Free, ' +
      'instant, no jargon.',
    type: 'website',
    url: 'https://findmytrial.vercel.app',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FindMyTrial',
    description: 'Find clinical trials in plain English',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
      </head>
      <body className={`${inter.variable} ${dmSerif.variable} font-sans antialiased`}>
        <NextAuthProvider>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </NextAuthProvider>
        <Toaster />
      </body>
      <Script
        defer
        data-domain="findmytrial.vercel.app"
        src="https://plausible.io/js/script.js"
        strategy="afterInteractive"
      />
    </html>
  );
}

if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  const React = require('react');
  const ReactDOM = require('react-dom');
  const axe = require('@axe-core/react');
  axe.default(React, ReactDOM, 1000);
}
