'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import type { TrialData } from '@/components/TrialCard';

const STORAGE_KEY = 'findmytrial_saved';
const MAX_SAVED = 50;

export interface SavedTrial {
  nctId: string;
  trial: TrialData;
  savedAt: string;
  notes: string;
}

function readFromStorage(): SavedTrial[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeToStorage(trials: SavedTrial[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trials));
  } catch {
    console.warn('[FindMyTrial] Could not save to localStorage');
  }
}

export function useSavedTrials() {
  const { data: session } = useSession();
  const [savedTrials, setSavedTrials] = useState<SavedTrial[]>([]);

  // Load on mount
  useEffect(() => {
    if (session?.user) {
      fetch('/api/user/saved')
        .then(r => r.json())
        .then(data => setSavedTrials(
          data.map((d: any) => ({ 
            nctId: d.nctId, 
            trial: d.trialData, 
            savedAt: d.savedAt, 
            notes: d.notes 
          }))
        ));
    } else {
      setSavedTrials(readFromStorage());
    }
  }, [session]);

  // Sync across browser tabs
  useEffect(() => {
    function handleStorageEvent(e: StorageEvent) {
      if (e.key === STORAGE_KEY && !session?.user) {
        setSavedTrials(readFromStorage());
      }
    }
    window.addEventListener('storage', handleStorageEvent);
    return () => window.removeEventListener('storage', handleStorageEvent);
  }, [session]);

  const save = useCallback((nctId: string, trial: TrialData) => {
    const current = session?.user ? savedTrials : readFromStorage();
    if (current.some(s => s.nctId === nctId)) return false; // already saved
    if (!session?.user && current.length >= MAX_SAVED) return false;           // limit reached
    
    const updated = [
      { nctId, trial, savedAt: new Date().toISOString(), notes: '' },
      ...current,
    ];
    
    if (session?.user) {
      setSavedTrials(updated);
      fetch('/api/user/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nctId, trialData: trial })
      }).catch(console.error);
    } else {
      writeToStorage(updated);
      setSavedTrials(updated);
    }
    return true;
  }, [session, savedTrials]);

  const remove = useCallback((nctId: string) => {
    if (session?.user) {
      setSavedTrials(prev => prev.filter(s => s.nctId !== nctId));
      fetch(`/api/user/saved?nctId=${nctId}`, { method: 'DELETE' }).catch(console.error);
    } else {
      const updated = readFromStorage().filter(s => s.nctId !== nctId);
      writeToStorage(updated);
      setSavedTrials(updated);
    }
  }, [session]);

  const isSaved = useCallback(
    (nctId: string) => savedTrials.some(s => s.nctId === nctId),
    [savedTrials]
  );

  return { savedTrials, save, remove, isSaved };
}
