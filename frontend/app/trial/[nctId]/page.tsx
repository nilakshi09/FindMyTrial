'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { TrialCardSkeleton } from '@/components/TrialCardSkeleton';
import { useSavedTrials } from '@/hooks/use-saved-trials';
import { useToast } from '@/hooks/use-toast';

export default function TrialDetailPage() {
  const params = useParams<{ nctId: string }>();
  const nctId = params?.nctId;
  const router = useRouter();
  const { save, remove, isSaved } = useSavedTrials();
  const { toast } = useToast();

  const [trial, setTrial] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullEligibility, setShowFullEligibility] = useState(false);

  const saved = trial ? isSaved(nctId) : false;

  useEffect(() => {
    async function fetchTrial() {
      try {
        const res = await fetch(`/api/trial/${nctId}`);
        if (!res.ok) throw new Error('Trial not found');
        const data = await res.json();
        setTrial(data);
      } catch {
        setError('Could not load trial details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
    if (nctId) fetchTrial();
  }, [nctId]);

  useEffect(() => {
    if (trial?.title) {
      document.title = `${trial.title} — FindMyTrial`;
    }
  }, [trial]);

  function handleSaveToggle() {
    if (!trial) return;
    if (saved) {
      remove(nctId);
      toast({ title: 'Trial removed', description: 'Removed from saved trials.' });
    } else {
      save(nctId, {
        nctId,
        title: trial.title,
        status: trial.status,
        conditions: trial.conditions,
        phase: trial.phase,
        summary: trial.briefSummary,
        location: trial.locations?.[0]
          ? `${trial.locations[0].city}, ${trial.locations[0].state}`
          : 'Location not specified',
        duration: trial.duration,
        compensation: trial.compensation,
        ages: `${trial.minimumAge} – ${trial.maximumAge}`,
      });
      toast({ title: 'Trial saved!', description: 'Find it in Saved Trials.' });
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ivory">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 pt-28 pb-16">
          <TrialCardSkeleton />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !trial) {
    return (
      <div className="min-h-screen bg-ivory">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 pt-28 pb-16 text-center">
          <p className="text-slate-500">{error ?? 'Trial not found.'}</p>
          <Link href="/" className="text-amber underline mt-4 inline-block">
            Return to search
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory">
      <Navbar />

      {trial && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'MedicalTrial',
              name: trial.title,
              identifier: nctId,
              status: trial.status,
              phase: trial.phase,
              healthCondition: trial.conditions?.map((c: string) => ({
                '@type': 'MedicalCondition',
                name: c,
              })),
              sponsor: {
                '@type': 'Organization',
                name: trial.sponsor,
              },
              url: `https://clinicaltrials.gov/study/${nctId}`,
            }),
          }}
        />
      )}

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">

        {/* Back + Save */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="text-sm text-slate-500 hover:text-navy transition-colors"
          >
            ← Back to results
          </button>
          <button
            onClick={handleSaveToggle}
            className={`text-sm px-4 py-2 rounded-full border transition-colors ${
              saved
                ? 'border-amber bg-amber/10 text-amber'
                : 'border-warm-gray text-slate-500 hover:border-amber hover:text-amber'
            }`}
          >
            {saved ? '🔖 Saved' : '🔖 Save Trial'}
          </button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs text-slate-400 font-mono mb-1">{nctId}</p>
          <h1 className="text-2xl font-bold text-navy mb-3"
              style={{ fontFamily: 'Playfair Display, serif' }}>
            {trial.title}
          </h1>
          <div className="flex flex-wrap gap-2 text-sm text-slate-500">
            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
              ● {trial.status}
            </span>
            <span>{trial.phase}</span>
            {trial.sponsor && <span>· Sponsor: {trial.sponsor}</span>}
          </div>
        </div>

        {/* What's Being Tested */}
        <section className="bg-white rounded-xl border border-warm-gray p-6 mb-4">
          <h2 className="text-xs font-semibold text-slate-400 uppercase 
                         tracking-wide mb-3">
            What's Being Tested
          </h2>
          <p className="text-navy text-sm leading-relaxed whitespace-pre-wrap">
            {trial.briefSummary || 'No summary available.'}
          </p>
          {trial.interventions?.length > 0 && (
            <div className="mt-4 space-y-2">
              {trial.interventions.map((i: any, idx: number) => (
                <div key={idx} className="text-sm">
                  <span className="font-medium text-navy">{i.name}</span>
                  {i.type && (
                    <span className="text-slate-400 ml-1">({i.type})</span>
                  )}
                  {i.description && (
                    <p className="text-slate-500 mt-0.5">{i.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Who Can Participate */}
        <section className="bg-white rounded-xl border border-warm-gray p-6 mb-4">
          <h2 className="text-xs font-semibold text-slate-400 uppercase 
                         tracking-wide mb-3">
            Who Can Participate
          </h2>
          <ul className="space-y-2 text-sm text-navy mb-4">
            {trial.minimumAge && trial.maximumAge && (
              <li>• Ages {trial.minimumAge} – {trial.maximumAge}</li>
            )}
            {trial.sex && (
              <li>• {trial.sex === 'ALL' ? 'All sexes eligible' : `${trial.sex} only`}</li>
            )}
          </ul>
          {trial.eligibilityCriteria && (
            <div>
              <p className="text-sm text-slate-500 line-clamp-3 whitespace-pre-wrap">
                {showFullEligibility
                  ? trial.eligibilityCriteria
                  : trial.eligibilityCriteria?.slice(0, 300) + '...'}
              </p>
              <button
                onClick={() => setShowFullEligibility(p => !p)}
                className="text-xs text-amber mt-2 hover:underline"
              >
                {showFullEligibility ? 'Show less ▲' : 'Full eligibility criteria ▼'}
              </button>
            </div>
          )}
        </section>

        {/* Locations */}
        {trial.locations?.length > 0 && (
          <section className="bg-white rounded-xl border border-warm-gray p-6 mb-4">
            <h2 className="text-xs font-semibold text-slate-400 uppercase 
                           tracking-wide mb-3">
              Locations ({trial.locations.length} site{trial.locations.length !== 1 ? 's' : ''} recruiting)
            </h2>
            <div className="space-y-2">
              {trial.locations.map((loc: any, idx: number) => (
                <div key={idx} className="text-sm text-navy flex items-start gap-2">
                  <span>📍</span>
                  <span>
                    {loc.facility && <span className="font-medium">{loc.facility} — </span>}
                    {loc.city}{loc.state ? `, ${loc.state}` : ''}{loc.country ? `, ${loc.country}` : ''}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Meta grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { icon: '⏱', label: 'Duration', value: trial.duration },
            { icon: '👥', label: 'Enrolling', value: trial.enrollmentCount ? `${trial.enrollmentCount} people` : 'Not specified' },
            { icon: '💰', label: 'Compensation', value: trial.compensation },
            { icon: '🏥', label: 'Study Type', value: trial.studyType || 'Not specified' },
          ].map(({ icon, label, value }) => (
            <div key={label} className="bg-white rounded-xl border border-warm-gray p-4">
              <p className="text-lg mb-1">{icon}</p>
              <p className="text-xs text-slate-400 font-medium uppercase 
                           tracking-wide mb-1">
                {label}
              </p>
              <p className="text-sm text-navy font-medium">{value}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <a
            href={`https://clinicaltrials.gov/study/${nctId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-amber text-white rounded-full text-sm 
                       font-medium hover:bg-amber/90 transition-colors"
          >
            View on ClinicalTrials.gov
          </a>
          <button
            className="px-5 py-2.5 border border-warm-gray text-slate-500 
                       rounded-full text-sm hover:border-amber hover:text-amber 
                       transition-colors"
            onClick={() => toast({ 
              title: 'Coming soon', 
              description: 'Share with Doctor is available in Phase 4.' 
            })}
          >
            Share with Doctor
          </button>
        </div>

      </main>

      <Footer />
    </div>
  );
}
