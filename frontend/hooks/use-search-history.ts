'use client';

import { useState, useEffect, useCallback } from 'react';

const HISTORY_KEY = 'findmytrial_history';
const MAX_HISTORY = 10;

export interface SearchHistoryEntry {
  query: string;
  timestamp: string;
}

function readHistory(): SearchHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useSearchHistory() {
  const [history, setHistory] = useState<SearchHistoryEntry[]>([]);

  useEffect(() => {
    setHistory(readHistory());
  }, []);

  const addToHistory = useCallback((query: string) => {
    if (!query.trim() || query.trim().length < 3) return;
    const current = readHistory().filter(
      e => e.query.toLowerCase() !== query.toLowerCase()
    );
    const updated = [
      { query: query.trim(), timestamp: new Date().toISOString() },
      ...current,
    ].slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    setHistory(updated);
  }, []);

  const clearHistory = useCallback(() => {
    localStorage.removeItem(HISTORY_KEY);
    setHistory([]);
  }, []);

  return { history, addToHistory, clearHistory };
}
