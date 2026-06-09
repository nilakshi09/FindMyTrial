'use client';

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Sample Results', href: '#sample-results' },
  { label: 'FAQ', href: '#faq' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-ivory/80 backdrop-blur-lg shadow-[0_1px_3px_rgba(0,0,0,0.05)]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#" className="flex items-center gap-1 group">
          <span className="font-serif text-xl font-bold text-navy tracking-tight">
            FindMyTrial
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-amber mt-1" />
        </a>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="nav-link-underline text-sm text-slate hover:text-navy transition-colors tracking-wide"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#hero"
            className="bg-amber text-white text-sm font-medium px-5 py-2 rounded-full hover:shadow-[0_0_20px_4px_rgba(200,146,42,0.2)] hover:scale-[1.02] transition-all duration-200"
          >
            Try It Free
          </a>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-navy"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-ivory/95 backdrop-blur-lg border-t border-warm-gray px-6 py-4 space-y-3">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block text-sm text-slate hover:text-navy transition-colors"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#hero"
            onClick={() => setMobileOpen(false)}
            className="block bg-amber text-white text-sm font-medium px-5 py-2 rounded-full text-center"
          >
            Try It Free
          </a>
        </div>
      )}
    </nav>
  );
}
