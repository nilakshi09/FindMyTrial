'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, DollarSign, User, Bookmark, BookmarkCheck } from 'lucide-react';
import { useSavedTrials } from '@/hooks/use-saved-trials';
import { useToast } from '@/hooks/use-toast';
import { createShareLink, copyToClipboard } from '@/lib/share-helpers';
import { downloadPageAsPDF } from '@/lib/generate-pdf';
import { trackEvent } from '@/lib/analytics';

export interface TrialData {
  nctId: string;
  title: string;
  status: string;
  conditions: string[];
  phase: string;
  summary: string;
  location: string;
  duration: string;
  compensation: string;
  ages: string;
  studyType?: string;
}

export default function TrialCard({ trial }: { trial: TrialData }) {
  const { save, remove, isSaved } = useSavedTrials();
  const { toast } = useToast();
  const saved = isSaved(trial.nctId);

  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [doctorEmail, setDoctorEmail] = useState('');
  const [patientNote, setPatientNote] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const emailModalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (showEmailModal) emailModalRef.current?.focus();
  }, [showEmailModal]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (shareMenuRef.current && 
          !shareMenuRef.current.contains(e.target as Node)) {
        setShowShareMenu(false);
      }
    }
    if (showShareMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showShareMenu]);

  async function sendEmail() {
    if (!doctorEmail || !doctorEmail.includes('@')) return;
    setIsSendingEmail(true);
    try {
      // First create a share link
      const shareResult = await createShareLink({ trials: [trial] });
      
      const res = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorEmail,
          patientNote,
          trials: [trial],
          shareUrl: shareResult?.shareUrl,
        }),
      });
      
      if (res.ok) {
        toast({ 
          title: 'Email sent!', 
          description: `Summary sent to ${doctorEmail}` 
        });
        setShowEmailModal(false);
        setDoctorEmail('');
        setPatientNote('');
      } else {
        toast({ 
          title: 'Could not send email', 
          description: 'Please try again.',
          variant: 'destructive' 
        });
      }
    } finally {
      setIsSendingEmail(false);
    }
  }

  async function handleCopyLink() {
    setIsSharing(true);
    try {
      const result = await createShareLink({ trials: [trial] });
      if (result) {
        const success = await copyToClipboard(result.shareUrl);
        if (success) {
          toast({ title: 'Link copied!', description: 'Share this link with your doctor.' });
        }
      } else {
        toast({ 
          title: 'Could not create link', 
          description: 'Please try again.',
          variant: 'destructive'
        });
      }
    } finally {
      setIsSharing(false);
      setShowShareMenu(false);
    }
  }

  function handleSaveToggle() {
    if (saved) {
      remove(trial.nctId);
      toast({
        title: 'Trial removed',
        description: 'Removed from your saved trials.',
      });
    } else {
      const success = save(trial.nctId, trial);
      if (success) {
        trackEvent('Save Trial');
        toast({
          title: 'Trial saved!',
          description: 'Find it anytime in Saved Trials.',
        });
      } else {
        toast({
          title: 'Could not save',
          description: 'You may have reached the 50 trial limit.',
          variant: 'destructive',
        });
      }
    }
  }

  return (
    <motion.div
      className="group relative flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.05)] border border-warm-gray transition-colors duration-300 hover:border-amber/30"
      whileHover={{
        y: -6,
        scale: 1.01,
        boxShadow: '0 12px 40px rgba(0,0,0,0.10), 0 0 0 1px rgba(200,146,42,0.08)',
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
    >
      {/* Animated amber accent bar */}
      <div
        className="h-0 group-hover:h-[3px] w-full bg-gradient-to-r from-amber/70 via-amber to-amber/70 transition-all duration-400 ease-out"
        aria-hidden="true"
      />

      <div className="flex flex-col h-full p-6 md:p-8">
        {/* 1. Status badge */}
        <span className="text-xs font-semibold tracking-wide uppercase bg-amber/10 text-amber px-3.5 py-1.5 rounded-full self-start shrink-0">
          {trial.status || 'Actively Recruiting'}
        </span>

        {/* 2–4. Card body — grows to fill space */}
        <div className="flex-1 flex flex-col mt-5">
          {/* 2. Title */}
          <h3 className="font-serif text-lg md:text-xl font-bold text-navy leading-snug line-clamp-3">
            {trial.title}
          </h3>

          {/* 3. Condition + Phase tags */}
          <div className="mt-4 flex flex-wrap gap-2 shrink-0">
            {trial.conditions.slice(0, 3).map((c) => (
              <span
                key={c}
                className="text-[11px] text-slate-500 bg-secondary rounded-full px-3 py-1"
              >
                {c}
              </span>
            ))}
            {trial.phase && (
              <span className="text-[11px] text-slate-500 bg-secondary rounded-full px-3 py-1">
                {trial.phase}
              </span>
            )}
          </div>

          {/* 4. Summary */}
          <p className="mt-5 text-sm text-slate-500 leading-relaxed line-clamp-4 flex-1">
            {trial.summary}
          </p>
        </div>

        {/* 5. Details row — 2x2 grid */}
        <div className="mt-6 grid grid-cols-2 gap-y-3 gap-x-4 text-xs text-slate-500 shrink-0">
          {trial.location && (
            <div className="flex items-center gap-1.5">
              <MapPin size={13} className="text-amber shrink-0" />
              <span className="truncate">{trial.location}</span>
            </div>
          )}
          {trial.duration && (
            <div className="flex items-center gap-1.5">
              <Clock size={13} className="text-amber shrink-0" />
              <span>{trial.duration}</span>
            </div>
          )}
          {trial.compensation && (
            <div className="flex items-center gap-1.5">
              <DollarSign size={13} className="text-amber shrink-0" />
              <span>{trial.compensation}</span>
            </div>
          )}
          {trial.ages && (
            <div className="flex items-center gap-1.5">
              <User size={13} className="text-amber shrink-0" />
              <span>{trial.ages}</span>
            </div>
          )}
        </div>

        {/* 6. Buttons — always pinned to bottom */}
        <div className="mt-auto pt-7 flex gap-3 shrink-0">
          <a
            href={`https://clinicaltrials.gov/study/${trial.nctId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-sm font-medium text-navy border border-navy/80 rounded-xl px-4 py-2.5 hover:bg-navy/5 hover:border-navy transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber/50 text-center"
          >
            Learn More
          </a>
          <button
            onClick={handleSaveToggle}
            className={`flex flex-1 justify-center items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border transition-colors ${
              saved
                ? 'border-amber bg-amber/10 text-amber font-medium'
                : 'border-warm-gray text-slate-500 hover:border-amber hover:text-amber'
            }`}
            aria-label={saved ? 'Remove from saved trials' : 'Save this trial'}
          >
            {saved ? (
              <>
                <BookmarkCheck size={16} />
                <span>Saved</span>
              </>
            ) : (
              <>
                <Bookmark size={16} />
                <span>Save Trial</span>
              </>
            )}
          </button>

          <div className="relative" ref={shareMenuRef} onKeyDown={e => { if (e.key === 'Escape') setShowShareMenu(false); }}>
            <button
              onClick={() => setShowShareMenu(p => !p)}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-warm-gray text-slate-500 hover:border-amber hover:text-amber transition-colors"
              aria-label="Share this trial"
            >
              <span>↗</span>
              <span>Share</span>
            </button>

            {/* Email Modal */}
            {showEmailModal && (
              <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
                   onClick={() => setShowEmailModal(false)}>
                <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm"
                     onClick={e => e.stopPropagation()}
                     ref={emailModalRef}
                     tabIndex={-1}>
                  
                  <h3 className="text-navy font-semibold mb-4">
                    Email to Doctor
                  </h3>
                  
                  <div className="space-y-3 mb-4">
                    <div>
                      <label htmlFor="doctorEmail" className="text-xs text-slate-500 font-medium block mb-1">
                        Doctor's email address *
                      </label>
                      <input
                        id="doctorEmail"
                        type="email"
                        value={doctorEmail}
                        onChange={e => setDoctorEmail(e.target.value)}
                        placeholder="doctor@hospital.com"
                        className="w-full border border-warm-gray rounded-lg px-3 py-2 text-sm text-navy placeholder:text-slate-500 placeholder:opacity-50 focus:outline-none focus:border-amber bg-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="patientNote" className="text-xs text-slate-500 font-medium block mb-1">
                        Your note (optional)
                      </label>
                      <textarea
                        id="patientNote"
                        value={patientNote}
                        onChange={e => setPatientNote(e.target.value)}
                        placeholder="Hi Dr. Smith, I found this trial for my condition. Could we discuss it?"
                        rows={3}
                        className="w-full border border-warm-gray rounded-lg px-3 py-2 text-sm text-navy placeholder:text-slate-500 placeholder:opacity-50 focus:outline-none focus:border-amber resize-none bg-transparent"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={sendEmail}
                      disabled={!doctorEmail.includes('@') || isSendingEmail}
                      className="flex-1 bg-amber text-white rounded-lg py-2 text-sm font-medium hover:bg-amber/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSendingEmail ? 'Sending...' : 'Send Email'}
                    </button>
                    <button
                      onClick={() => setShowEmailModal(false)}
                      className="px-4 py-2 border border-warm-gray rounded-lg text-sm text-slate-500 hover:border-navy hover:text-navy transition-colors"
                    >
                      Cancel
                    </button>
                  </div>

                </div>
              </div>
            )}

            {/* Share popover */}
            {showShareMenu && (
              <div className="absolute bottom-full mb-2 right-0 bg-white border border-warm-gray rounded-xl shadow-lg z-50 w-48 overflow-hidden">
                
                {/* Copy Link */}
                <button
                  onClick={handleCopyLink}
                  disabled={isSharing}
                  className="w-full text-left px-4 py-3 text-sm text-navy hover:bg-ivory transition-colors flex items-center gap-2 border-b border-warm-gray disabled:opacity-50"
                >
                  🔗 Copy Link
                </button>

                {/* Download PDF — opens share page in new tab for PDF download */}
                <button
                  onClick={async () => {
                    setIsSharing(true);
                    const result = await createShareLink({ trials: [trial] });
                    setIsSharing(false);
                    setShowShareMenu(false);
                    if (result) {
                      window.open(result.shareUrl, '_blank');
                      toast({ 
                        title: 'Share page opened',
                        description: 'Use "Download PDF" on that page.' 
                      });
                    }
                  }}
                  disabled={isSharing}
                  className="w-full text-left px-4 py-3 text-sm text-navy hover:bg-ivory transition-colors flex items-center gap-2 border-b border-warm-gray disabled:opacity-50"
                >
                  ⬇ Download PDF
                </button>

                {/* Email to Doctor */}
                <button
                  onClick={() => { setShowShareMenu(false); setShowEmailModal(true); }}
                  className="w-full text-left px-4 py-3 text-sm text-navy hover:bg-ivory transition-colors flex items-center gap-2"
                >
                  ✉ Email to Doctor
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
