'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';

interface Alert {
  id: string;
  email: string;
  query: string;
  location?: string;
  frequency: 'daily' | 'weekly';
  createdAt: string;
  lastCheckedAt?: string;
}


function AlertsContent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const unsubscribed = searchParams.get('unsubscribed');
  const [email, setEmail] = useState('');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  async function fetchAlerts() {
    if (!email.includes('@')) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/alerts?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      setAlerts(Array.isArray(data) ? data : []);
      setHasFetched(true);
    } catch {
      toast({ title: 'Could not load alerts', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }

  async function deleteAlert(id: string) {
    try {
      await fetch(`/api/alerts/${id}`, { method: 'DELETE' });
      setAlerts(prev => prev.filter(a => a.id !== id));
      toast({ title: 'Alert deleted' });
    } catch {
      toast({ title: 'Could not delete alert', variant: 'destructive' });
    }
  }

  async function updateFrequency(id: string, frequency: 'daily' | 'weekly') {
    try {
      await fetch(`/api/alerts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frequency }),
      });
      setAlerts(prev =>
        prev.map(a => a.id === id ? { ...a, frequency } : a)
      );
      toast({ title: 'Alert updated' });
    } catch {
      toast({ title: 'Could not update alert', variant: 'destructive' });
    }
  }

  return (
    <div className="min-h-screen bg-ivory">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">

        {unsubscribed === 'true' && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <p className="text-green-700 text-sm font-medium">
              ✓ You&apos;ve been unsubscribed from that alert.
            </p>
          </div>
        )}

        {/* Header */}
        <div className="mb-10">
          <Link href="/" className="text-sm text-slate-500 hover:text-navy 
                                    transition-colors">
            ← Back to search
          </Link>
          <h1 className="text-3xl font-bold text-navy mt-2"
              style={{ fontFamily: 'Playfair Display, serif' }}>
            My Trial Alerts
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Get notified when new trials match your search.
          </p>
        </div>

        {/* Email lookup */}
        <div className="bg-white rounded-xl border border-warm-gray p-6 mb-6">
          <p className="text-sm font-medium text-navy mb-3">
            Enter your email to view and manage your alerts
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchAlerts()}
              placeholder="your@email.com"
              className="flex-1 border border-warm-gray rounded-lg px-3 py-2 
                         text-sm text-navy placeholder:text-slate-300 
                         focus:outline-none focus:border-amber"
            />
            <button
              onClick={fetchAlerts}
              disabled={!email.includes('@') || isLoading}
              className="px-4 py-2 bg-amber text-white rounded-lg text-sm 
                         font-medium hover:bg-amber/90 transition-colors 
                         disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'View Alerts'}
            </button>
          </div>
        </div>

        {/* Alerts list */}
        {hasFetched && (
          <>
            {alerts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-3xl mb-3">🔔</div>
                <p className="text-navy font-medium mb-1">No active alerts</p>
                <p className="text-slate-500 text-sm mb-4">
                  Search for a condition and click &quot;Alert me for new matches&quot; 
                  to create your first alert.
                </p>
                <Link href="/" className="text-amber hover:underline text-sm">
                  Search for trials →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-slate-500">
                  {alerts.length} active alert{alerts.length !== 1 ? 's' : ''}
                </p>
                {alerts.map(alert => (
                  <div key={alert.id}
                    className="bg-white rounded-xl border border-warm-gray p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-navy truncate">
                          {alert.query}
                        </p>
                        {alert.location && (
                          <p className="text-sm text-slate-500 mt-0.5">
                            📍 {alert.location}
                          </p>
                        )}
                        <p className="text-xs text-slate-400 mt-1">
                          Created {new Date(alert.createdAt).toLocaleDateString()}
                          {alert.lastCheckedAt && (
                            <> · Last checked {new Date(alert.lastCheckedAt)
                              .toLocaleDateString()}</>
                          )}
                        </p>
                      </div>
                      
                      {/* Frequency toggle */}
                      <select
                        value={alert.frequency}
                        onChange={e => updateFrequency(
                          alert.id, 
                          e.target.value as 'daily' | 'weekly'
                        )}
                        className="text-xs border border-warm-gray rounded-lg 
                                   px-2 py-1 text-slate-600 focus:outline-none 
                                   focus:border-amber"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                      </select>

                      {/* Delete */}
                      <button
                        onClick={() => deleteAlert(alert.id)}
                        className="text-xs text-slate-400 hover:text-red-500 
                                   transition-colors px-2 py-1 rounded border 
                                   border-warm-gray hover:border-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

      </main>
      <Footer />
    </div>
  );
}

export default function AlertsPage() {
  return (
    <Suspense fallback={null}>
      <AlertsContent />
    </Suspense>
  );
}
