'use client';

import { useState } from 'react';
import { useSavedTrials } from '@/hooks/use-saved-trials';
import { useToast } from '@/hooks/use-toast';
import { createShareLink, copyToClipboard } from '@/lib/share-helpers';
import TrialCard from '@/components/TrialCard';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function SavedTrialsPage() {
  const { savedTrials, remove } = useSavedTrials();
  const { toast } = useToast();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSharing, setIsSharing] = useState(false);

  function toggleSelect(nctId: string) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(nctId)) {
        next.delete(nctId);
      } else {
        next.add(nctId);
      }
      return next;
    });
  }

  function handleRemove(nctId: string) {
    remove(nctId);
    toast({ title: 'Trial removed', description: 'Removed from saved trials.' });
  }

  // Sort newest first (savedAt is ISO string — lexicographic sort works)
  const sorted = [...savedTrials].sort(
    (a, b) => b.savedAt.localeCompare(a.savedAt)
  );

  return (
    <div className="min-h-screen bg-ivory">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        
        {/* Page header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <Link
              href="/"
              className="text-sm text-slate-500 hover:text-navy transition-colors"
            >
              ← Back to search
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-navy" 
              style={{ fontFamily: 'Playfair Display, serif' }}>
            Saved Trials
          </h1>
          {sorted.length > 0 && (
            <p className="text-slate-500 mt-1">
              {sorted.length} trial{sorted.length !== 1 ? 's' : ''} saved
            </p>
          )}
        </div>

        {/* Empty state */}
        {sorted.length === 0 && (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">🔖</div>
            <h2 className="text-navy font-semibold text-lg mb-2">
              No saved trials yet
            </h2>
            <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
              You haven't saved any trials yet. Start searching to find 
              trials worth keeping.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-2.5 bg-amber text-white 
                         rounded-full text-sm font-medium hover:bg-amber/90 
                         transition-colors"
            >
              Search for trials
            </Link>
          </div>
        )}

        {/* Results grid */}
        {sorted.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sorted.map((saved) => (
              <div key={saved.nctId} className="relative">
                
                {/* Selection checkbox overlay */}
                <div className="absolute top-3 left-3 z-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(saved.nctId)}
                    onChange={() => toggleSelect(saved.nctId)}
                    className="w-4 h-4 accent-amber cursor-pointer"
                    aria-label={`Select ${saved.trial.title}`}
                  />
                </div>

                {/* Highlight border when selected */}
                <div className={`transition-all rounded-xl ${
                  selectedIds.has(saved.nctId) 
                    ? 'ring-2 ring-amber ring-offset-1' 
                    : ''
                }`}>
                  <TrialCard trial={saved.trial} />
                </div>

                {/* Remove button (existing) */}
                <button
                  onClick={() => handleRemove(saved.nctId)}
                  className="absolute top-3 right-3 text-xs text-slate-400 
                             hover:text-red-500 transition-colors bg-white/80 
                             backdrop-blur-sm px-2 py-1 rounded-full border 
                             border-warm-gray hover:border-red-200"
                >
                  Remove
                </button>

                <p className="text-xs text-slate-400 mt-2 px-1">
                  Saved {new Date(saved.savedAt).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric'
                  })}
                </p>

              </div>
            ))}
          </div>
        )}

        {selectedIds.size > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            <div className="bg-navy text-white rounded-full shadow-xl 
                            px-6 py-3 flex items-center gap-4">
              <span className="text-sm font-medium whitespace-nowrap">
                {selectedIds.size} trial{selectedIds.size !== 1 ? 's' : ''} selected
              </span>
              
              <div className="flex gap-2">
                {/* Copy combined share link */}
                <button
                  onClick={async () => {
                    setIsSharing(true);
                    const selectedTrials = sorted
                      .filter(s => selectedIds.has(s.nctId))
                      .map(s => s.trial);
                    
                    try {
                      const result = await createShareLink({ trials: selectedTrials });
                      if (result) {
                        const success = await copyToClipboard(result.shareUrl);
                        if (success) {
                          toast({ 
                            title: 'Link copied!', 
                            description: `Share link for ${selectedIds.size} trials copied.` 
                          });
                        }
                      }
                    } finally {
                      setIsSharing(false);
                    }
                  }}
                  disabled={isSharing}
                  className="text-xs px-3 py-1.5 bg-amber rounded-full 
                             font-medium hover:bg-amber/90 transition-colors
                             disabled:opacity-50 whitespace-nowrap"
                >
                  {isSharing ? 'Creating...' : '🔗 Copy Link'}
                </button>

                {/* Open share page */}
                <button
                  onClick={async () => {
                    setIsSharing(true);
                    const selectedTrials = sorted
                      .filter(s => selectedIds.has(s.nctId))
                      .map(s => s.trial);
                    try {
                      const result = await createShareLink({ trials: selectedTrials });
                      if (result) window.open(result.shareUrl, '_blank');
                    } finally {
                      setIsSharing(false);
                    }
                  }}
                  disabled={isSharing}
                  className="text-xs px-3 py-1.5 bg-white/20 rounded-full 
                             font-medium hover:bg-white/30 transition-colors
                             disabled:opacity-50 whitespace-nowrap"
                >
                  ⬇ Download PDF
                </button>

                {/* Deselect all */}
                <button
                  onClick={() => setSelectedIds(new Set())}
                  className="text-xs text-white/60 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
