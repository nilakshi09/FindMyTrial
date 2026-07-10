import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';
import {
  parseNaturalLanguage,
  buildApiQuery,
  humanizePhase,
  calculateDuration,
  detectCompensation,
} from '@findmytrial/shared';

export const dynamic = 'force-dynamic';

const resend = new Resend(process.env.RESEND_API_KEY);

// Protect this endpoint — only callable with the correct secret
function isAuthorized(request: NextRequest): boolean {
  const secret = request.headers.get('x-cron-secret');
  return secret === process.env.CRON_SECRET;
}

async function fetchTrialsForQuery(
  query: string,
  location?: string
): Promise<any[]> {
  try {
    const intent = parseNaturalLanguage(query);
    if (location) intent.location = location;
    const params = buildApiQuery(intent);

    const response = await fetch(
      `https://clinicaltrials.gov/api/v2/studies?${params.toString()}`,
      { signal: AbortSignal.timeout(15000) }
    );

    if (!response.ok) return [];

    const data = await response.json();
    return (data.studies ?? [])
      .map((study: any) => {
        const p = study.protocolSection;
        return {
          nctId: p?.identificationModule?.nctId ?? '',
          title: p?.identificationModule?.briefTitle ?? '',
          phase: humanizePhase(p?.designModule?.phases),
          status: p?.statusModule?.overallStatus ?? '',
          summary: (p?.descriptionModule?.briefSummary ?? '').slice(0, 300),
          location: (() => {
            const locs = p?.contactsLocationsModule?.locations ?? [];
            if (locs.length === 0) return 'Location not specified';
            return `${locs[0].city ?? ''}, ${locs[0].state ?? ''}`.trim();
          })(),
          duration: calculateDuration(
            p?.statusModule?.startDateStruct,
            p?.statusModule?.completionDateStruct
          ),
        };
      })
      .filter((t: any) => t.nctId);
  } catch {
    return [];
  }
}

function buildAlertEmailHtml(
  query: string,
  newTrials: any[],
  alertId: string
): string {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || 'https://findmytrial.vercel.app';
  const unsubscribeUrl = `${baseUrl}/api/alerts/${alertId}?action=unsubscribe`;

  const trialsHtml = newTrials
    .map(
      (trial) => `
    <div style="border-top:1px solid #e5e7eb; padding:16px 0; margin-top:16px;">
      <p style="color:#9ca3af;font-size:11px;font-family:monospace;margin:0 0 4px;">
        ${trial.nctId}
      </p>
      <h3 style="color:#111827;font-size:15px;margin:0 0 6px;">
        ${trial.title}
      </h3>
      <p style="color:#6b7280;font-size:12px;margin:0 0 8px;">
        ${trial.phase} · 📍 ${trial.location} · ⏱ ${trial.duration}
      </p>
      ${
        trial.summary
          ? `
        <p style="color:#374151;font-size:13px;line-height:1.6;margin:0 0 8px;">
          ${trial.summary}${trial.summary.length >= 300 ? '...' : ''}
        </p>
      `
          : ''
      }
      <a href="https://clinicaltrials.gov/study/${trial.nctId}"
         style="color:#2563eb;font-size:13px;">
        View on ClinicalTrials.gov →
      </a>
    </div>
  `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <body style="font-family:-apple-system,sans-serif;max-width:600px;
                 margin:0 auto;padding:24px;color:#111827;">
      <div style="border-bottom:2px solid #f3f4f6;padding-bottom:16px;margin-bottom:20px;">
        <p style="color:#6b7280;font-size:12px;margin:0 0 4px;">🔬 FindMyTrial Alert</p>
        <h1 style="font-size:20px;margin:0;">
          ${newTrials.length} new trial${newTrials.length !== 1 ? 's' : ''} 
          matching "${query}"
        </h1>
      </div>
      ${trialsHtml}
      <div style="border-top:1px solid #e5e7eb;margin-top:24px;padding-top:16px;">
        <a href="${baseUrl}" 
           style="display:inline-block;background:#C8922A;color:white;
                  padding:10px 20px;border-radius:20px;font-size:13px;
                  text-decoration:none;margin-bottom:16px;">
          View All Matching Trials →
        </a>
        <p style="font-size:11px;color:#9ca3af;margin:0;">
          You're receiving this because you created a trial alert on FindMyTrial.
          <a href="${unsubscribeUrl}" style="color:#9ca3af;">Unsubscribe</a>
        </p>
      </div>
    </body>
    </html>
  `;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const dayOfWeek = now.getUTCDay(); // 0 = Sunday, 1 = Monday

  // Get active alerts that should run now
  const alerts = await prisma.alert.findMany({
    where: {
      isActive: true,
      OR: [
        { frequency: 'daily' },
        // Only fetch weekly alerts on Monday
        ...(dayOfWeek === 1 ? [{ frequency: 'weekly' }] : []),
      ],
    },
    include: {
      results: { select: { nctId: true } },
    },
  });

  // Filter alerts based on frequency and day
  const alertsToProcess = alerts.filter((alert) => {
    if (alert.frequency === 'daily') return true;
    if (alert.frequency === 'weekly') return dayOfWeek === 1;
    return false;
  });

  let processed = 0;
  let emailsSent = 0;

  for (const alert of alertsToProcess) {
    try {
      // Fetch current trials
      const trials = await fetchTrialsForQuery(
        alert.query,
        alert.location ?? undefined
      );

      // Find new trials (not in alert_results)
      const knownNctIds = new Set(alert.results.map((r) => r.nctId));
      const newTrials = trials.filter((t) => !knownNctIds.has(t.nctId));

      // Store all current nctIds (for future deduplication)
      if (trials.length > 0) {
        await prisma.alertResult.createMany({
          data: trials.map((t) => ({
            alertId: alert.id,
            nctId: t.nctId,
          })),
          skipDuplicates: true,
        });
      }

      // Update lastCheckedAt
      await prisma.alert.update({
        where: { id: alert.id },
        data: { lastCheckedAt: now },
      });

      // Send email if new trials found
      if (newTrials.length > 0) {
        const html = buildAlertEmailHtml(alert.query, newTrials, alert.id);
        await resend.emails.send({
          from: 'FindMyTrial <onboarding@resend.dev>',
          to: [alert.email],
          subject: `${newTrials.length} new trial${newTrials.length !== 1 ? 's' : ''} matching "${alert.query}"`,
          html,
        });
        emailsSent++;
      }

      processed++;
      // Small delay between alerts to avoid rate limiting
      await new Promise((r) => setTimeout(r, 500));
    } catch (error) {
      console.error(`[Cron] Failed to process alert ${alert.id}:`, error);
    }
  }

  return NextResponse.json({
    success: true,
    processed,
    emailsSent,
    timestamp: now.toISOString(),
  });
}
