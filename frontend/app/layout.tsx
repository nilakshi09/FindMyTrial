import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://findmytrial.com'),
  title: 'FindMyTrial — Clinical Trial Matching in Plain English',
  description:
    'Find actively recruiting clinical trials that match your condition. No jargon, no expertise required. Powered by ClinicalTrials.gov.',
  openGraph: {
    title: 'FindMyTrial — Clinical Trial Matching in Plain English',
    description:
      'Find actively recruiting clinical trials that match your condition. No jargon, no expertise required.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
