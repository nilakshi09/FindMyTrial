'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { copyToClipboard } from '@/lib/share-helpers';
import { downloadPageAsPDF } from '@/lib/generate-pdf';

interface SharedSummary {
  trials: any[];
  patientNote?: string;
  createdAt: string;
  expiresAt: string;
}

export default function SharePage() {
  const { shareId } = useParams<{ shareId: string }>();
  const [summary, setSummary] = useState<SharedSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const res = await fetch(`/api/share?id=${shareId}`);
        if (res.status === 410) {
          setIsExpired(true);
          return;
        }
        if (!res.ok) {
          setError('This share link was not found.');
          return;
        }
        const data = await res.json();
        setSummary(data);
      } catch {
        setError('Could not load this summary. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
    if (shareId) fetchSummary();
  }, [shareId]);

  // --- Loading state ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading summary...</p>
      </div>
    );
  }

  // --- Expired state ---
  if (isExpired) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="text-4xl mb-4">⏱</div>
          <h1 className="text-xl font-semibold text-gray-800 mb-2">
            This summary has expired
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            Share links are valid for 30 days. Please ask the patient 
            to generate a new summary link.
          </p>
          <Link
            href="/"
            className="text-sm text-blue-600 hover:underline"
          >
            Go to FindMyTrial
          </Link>
        </div>
      </div>
    );
  }

  // --- Error state ---
  if (error || !summary) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="text-4xl mb-4">🔍</div>
          <h1 className="text-xl font-semibold text-gray-800 mb-2">
            Summary not found
          </h1>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // --- Main render ---
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* Header — doctor-facing branding */}
        <div className="border-b border-gray-200 pb-6 mb-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🔬</span>
            <span className="font-semibold text-gray-800">FindMyTrial</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Clinical Trial Summary
          </h1>
          <p className="text-sm text-gray-500">
            {summary.trials.length} trial{summary.trials.length !== 1 ? 's' : ''} · 
            Generated {new Date(summary.createdAt).toLocaleDateString('en-US', {
              month: 'long', day: 'numeric', year: 'numeric'
            })} · 
            Expires {new Date(summary.expiresAt).toLocaleDateString('en-US', {
              month: 'long', day: 'numeric', year: 'numeric'
            })}
          </p>
        </div>

        {/* Patient note */}
        {summary.patientNote && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <p className="text-xs font-semibold text-blue-600 uppercase 
                          tracking-wide mb-1">
              💬 Patient's Note
            </p>
            <p className="text-gray-700 text-sm leading-relaxed">
              {summary.patientNote}
            </p>
          </div>
        )}

        {/* Trials */}
        <div className="space-y-10">
          {summary.trials.map((trial: any, index: number) => (
            <div 
              key={trial.nctId || index} 
              className="trial-section border-t border-gray-200 pt-8"
            >
              {/* Trial header */}
              <div className="mb-4">
                <p className="text-xs text-gray-400 font-mono mb-1">
                  TRIAL {index + 1} OF {summary.trials.length} — {trial.nctId}
                </p>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                  {trial.title}
                </h2>
                <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                  {trial.phase && <span>{trial.phase}</span>}
                  {trial.status && (
                    <span className="text-green-600 font-medium">
                      ● {trial.status}
                    </span>
                  )}
                </div>
              </div>

              {/* Trial details grid */}
              <div className="space-y-3 text-sm">
                {trial.summary && (
                  <div>
                    <span className="font-medium text-gray-700">
                      What's being tested:{' '}
                    </span>
                    <span className="text-gray-600">{trial.summary}</span>
                  </div>
                )}
                {trial.ages && (
                  <div>
                    <span className="font-medium text-gray-700">
                      Eligibility:{' '}
                    </span>
                    <span className="text-gray-600">Ages {trial.ages}</span>
                    {trial.conditions?.length > 0 && (
                      <span className="text-gray-600">
                        {' '}· Conditions: {trial.conditions.join(', ')}
                      </span>
                    )}
                  </div>
                )}
                {trial.location && (
                  <div>
                    <span className="font-medium text-gray-700">
                      Location:{' '}
                    </span>
                    <span className="text-gray-600">{trial.location}</span>
                  </div>
                )}
                <div className="flex flex-wrap gap-4">
                  {trial.duration && (
                    <span className="text-gray-600">
                      ⏱ Duration: {trial.duration}
                    </span>
                  )}
                  {trial.compensation && (
                    <span className="text-gray-600">
                      💰 {trial.compensation}
                    </span>
                  )}
                </div>
                {trial.nctId && (
                  <div>
                    <span className="font-medium text-gray-700">
                      Official listing:{' '}
                    </span>
                    <a
                      href={`https://clinicaltrials.gov/study/${trial.nctId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      clinicaltrials.gov/study/{trial.nctId}
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="border-t border-gray-200 mt-10 pt-6">
          <p className="text-xs text-gray-400 leading-relaxed mb-4">
            ⚠️ <strong>Disclaimer:</strong> FindMyTrial is not a medical 
            provider and does not offer medical advice. All trial data is 
            sourced directly from ClinicalTrials.gov. Clinical trial 
            eligibility must be confirmed by the trial team. Always discuss 
            participation with your physician before enrolling.
          </p>

          {/* Action buttons — hidden on print */}
          <div className="flex gap-3 no-print">
            <button
              onClick={() => window.print()}
              className="text-sm px-4 py-2 border border-gray-300 rounded-lg 
                         text-gray-600 hover:bg-gray-50 transition-colors"
            >
              🖨 Print this page
            </button>
            <button
              onClick={async () => {
                const success = await copyToClipboard(window.location.href);
                if (success) {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }
              }}
              className="text-sm px-4 py-2 border border-gray-300 rounded-lg 
                         text-gray-600 hover:bg-gray-50 transition-colors"
            >
              {copied ? '✓ Copied!' : '🔗 Copy Link'}
            </button>
            <button
              onClick={async () => {
                setIsGeneratingPDF(true);
                try {
                  await downloadPageAsPDF(`findmytrial-${shareId}.pdf`);
                } finally {
                  setIsGeneratingPDF(false);
                }
              }}
              disabled={isGeneratingPDF}
              className="text-sm px-4 py-2 border border-gray-300 rounded-lg 
                         text-gray-600 hover:bg-gray-50 transition-colors 
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingPDF ? 'Generating...' : '⬇ Download PDF'}
            </button>
            <Link
              href="/"
              className="text-sm px-4 py-2 border border-gray-300 rounded-lg 
                         text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Find more trials →
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
