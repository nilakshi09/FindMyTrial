'use client';

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useSavedTrials } from '@/hooks/use-saved-trials';
import { useSession, signIn, signOut } from 'next-auth/react';

const navLinks = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Sample Results', href: '#sample-results' },
  { label: 'FAQ', href: '#faq' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { savedTrials } = useSavedTrials();
  const savedCount = savedTrials.length;
  const { data: session } = useSession();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-premium ${
        scrolled
          ? 'bg-ivory/75 backdrop-blur-xl shadow-[0_1px_3px_rgba(10,22,40,0.06),0_1px_2px_rgba(10,22,40,0.04)] border-b border-warm-gray'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-amber focus:text-white focus:px-4 focus:py-2 focus:rounded-full focus:text-sm"
      >
        Skip to main content
      </a>
      <div className="max-w-6xl mx-auto px-6 lg:px-8 h-[72px] flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-1.5 group" aria-label="FindMyTrial Home">
          <span className="font-serif text-[22px] font-bold text-navy tracking-tight group-hover:opacity-80 transition-opacity duration-300">
            FindMyTrial
          </span>
          <span className="w-2 h-2 rounded-full bg-amber mt-0.5 group-hover:scale-125 transition-transform duration-300" />
        </a>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="nav-link-underline text-[13px] font-medium text-slate-500 hover:text-navy transition-colors duration-300 tracking-[0.02em] uppercase focus-ring-amber"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/saved"
            className="relative flex items-center gap-1.5 nav-link-underline text-[13px] font-medium text-slate-500 hover:text-navy transition-colors duration-300 tracking-[0.02em] uppercase focus-ring-amber"
          >
            Saved Trials
            {savedCount > 0 && (
              <span className="absolute -top-2.5 -right-3 min-w-[18px] h-[18px] rounded-full bg-amber text-white text-[10px] font-semibold flex items-center justify-center px-1 shadow-sm">
                {savedCount > 99 ? '99+' : savedCount}
              </span>
            )}
          </Link>
          <Link
            href="/alerts"
            className="nav-link-underline text-[13px] font-medium text-slate-500 hover:text-navy transition-colors duration-300 tracking-[0.02em] uppercase focus-ring-amber"
          >
            Alerts
          </Link>
          {session ? (
            <div className="flex items-center gap-4">
              <span className="text-[13px] font-medium text-slate-500 truncate max-w-[150px]">
                {session.user?.email}
              </span>
              <button
                onClick={() => signOut()}
                className="relative overflow-hidden bg-ivory border border-warm-gray text-navy text-[13px] font-semibold px-6 py-2.5 rounded-full hover:bg-warm-gray hover:border-amber/40 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 ease-out tracking-wide focus-ring-amber"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn()}
              className="relative overflow-hidden bg-amber text-white text-[13px] font-semibold px-6 py-2.5 rounded-full hover:shadow-glow-amber hover:brightness-110 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 ease-out tracking-wide focus-ring-amber"
            >
              <span className="relative z-10">Sign In</span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
              />
            </button>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-navy p-2 -mr-2 rounded-lg hover:bg-warm-gray transition-colors duration-200"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          <AnimatePresence mode="wait" initial={false}>
            {mobileOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X size={22} />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Menu size={22} />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
            className="md:hidden overflow-hidden bg-ivory/95 backdrop-blur-xl border-t border-warm-gray"
          >
            <div className="px-6 py-6 space-y-1">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.08, duration: 0.3 }}
                  className="block text-[15px] text-slate-500 hover:text-navy hover:bg-warm-gray transition-colors duration-200 py-3 px-4 rounded-xl font-medium"
                >
                  {link.label}
                </motion.a>
              ))}
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 + navLinks.length * 0.08, duration: 0.3 }}
              >
                <Link
                  href="/saved"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 text-[15px] text-slate-500 hover:text-navy hover:bg-warm-gray transition-colors duration-200 py-3 px-4 rounded-xl font-medium"
                >
                  Saved Trials
                  {savedCount > 0 && (
                    <span className="min-w-[18px] h-[18px] rounded-full bg-amber text-white text-[10px] font-semibold flex items-center justify-center px-1 shadow-sm">
                      {savedCount > 99 ? '99+' : savedCount}
                    </span>
                  )}
                </Link>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 + (navLinks.length + 1) * 0.08, duration: 0.3 }}
              >
                <Link
                  href="/alerts"
                  onClick={() => setMobileOpen(false)}
                  className="block text-[15px] text-slate-500 hover:text-navy hover:bg-warm-gray transition-colors duration-200 py-3 px-4 rounded-xl font-medium"
                >
                  Alerts
                </Link>
              </motion.div>
              {session ? (
                <>
                  <div className="text-[15px] text-slate-500 py-2 px-4 truncate">
                    {session.user?.email}
                  </div>
                  <motion.button
                    onClick={() => {
                      setMobileOpen(false);
                      signOut();
                    }}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.3 }}
                    className="block w-full bg-ivory border border-warm-gray text-navy text-[15px] font-semibold px-6 py-3.5 rounded-full text-center mt-4 transition-all duration-300"
                  >
                    Sign Out
                  </motion.button>
                </>
              ) : (
                <motion.button
                  onClick={() => {
                    setMobileOpen(false);
                    signIn();
                  }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.3 }}
                  className="block w-full bg-amber text-white text-[15px] font-semibold px-6 py-3.5 rounded-full text-center mt-4 hover:shadow-glow-amber transition-all duration-300"
                >
                  Sign In
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
