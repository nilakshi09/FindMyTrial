import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { doctorEmail, patientNote, trials, shareUrl } = body;

    // Validate
    if (!doctorEmail || !doctorEmail.includes('@')) {
      return NextResponse.json(
        { error: 'Valid doctor email is required', code: 'INVALID_EMAIL' },
        { status: 400 }
      );
    }

    if (!trials || trials.length === 0) {
      return NextResponse.json(
        { error: 'At least one trial is required', code: 'NO_TRIALS' },
        { status: 400 }
      );
    }

    // Build email HTML
    const trialsHtml = trials.map((trial: any, i: number) => `
      <div style="border-top: 1px solid #e5e7eb; padding: 20px 0; margin-top: 20px;">
        <p style="color: #9ca3af; font-size: 11px; font-family: monospace; margin: 0 0 4px;">
          TRIAL ${i + 1} OF ${trials.length} — ${trial.nctId}
        </p>
        <h3 style="color: #111827; font-size: 16px; margin: 0 0 8px;">
          ${trial.title}
        </h3>
        <p style="color: #6b7280; font-size: 13px; margin: 0 0 4px;">
          ${trial.phase} · ${trial.status}
        </p>
        ${trial.summary ? `
          <p style="color: #374151; font-size: 14px; line-height: 1.6; margin: 12px 0 8px;">
            ${trial.summary.slice(0, 400)}${trial.summary.length > 400 ? '...' : ''}
          </p>
        ` : ''}
        <p style="font-size: 13px; color: #6b7280; margin: 4px 0;">
          📍 ${trial.location || 'Location not specified'} 
          &nbsp;·&nbsp; ⏱ ${trial.duration || 'Duration not specified'}
        </p>
        ${trial.nctId ? `
          <p style="margin: 8px 0 0;">
            <a href="https://clinicaltrials.gov/study/${trial.nctId}" 
               style="color: #2563eb; font-size: 13px;">
              View on ClinicalTrials.gov →
            </a>
          </p>
        ` : ''}
      </div>
    `).join('');

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: -apple-system, sans-serif; max-width: 600px; 
                   margin: 0 auto; padding: 24px; color: #111827;">
        
        <div style="border-bottom: 2px solid #f3f4f6; padding-bottom: 20px; margin-bottom: 20px;">
          <p style="color: #6b7280; font-size: 12px; margin: 0 0 4px;">
            🔬 FindMyTrial — Clinical Trial Summary
          </p>
          <h1 style="font-size: 22px; color: #111827; margin: 0;">
            Your patient found ${trials.length} matching clinical trial${trials.length !== 1 ? 's' : ''}
          </h1>
        </div>

        ${patientNote ? `
          <div style="background: #eff6ff; border: 1px solid #bfdbfe; 
                      border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <p style="font-size: 12px; font-weight: 600; color: #2563eb; 
                      text-transform: uppercase; margin: 0 0 6px;">
              Patient's Note
            </p>
            <p style="color: #374151; font-size: 14px; margin: 0; line-height: 1.6;">
              ${patientNote}
            </p>
          </div>
        ` : ''}

        ${trialsHtml}

        ${shareUrl ? `
          <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin-top: 24px;">
            <p style="font-size: 13px; color: #6b7280; margin: 0 0 8px;">
              View the full formatted summary:
            </p>
            <a href="${shareUrl}" 
               style="color: #2563eb; font-size: 14px; font-weight: 500;">
              ${shareUrl}
            </a>
          </div>
        ` : ''}

        <div style="border-top: 1px solid #e5e7eb; margin-top: 32px; padding-top: 16px;">
          <p style="font-size: 11px; color: #9ca3af; line-height: 1.6; margin: 0;">
            ⚠️ FindMyTrial is not a medical provider. All data sourced from 
            ClinicalTrials.gov. Clinical trial eligibility must be confirmed 
            by the study team. This email was sent on behalf of a patient 
            using FindMyTrial.
          </p>
        </div>

      </body>
      </html>
    `;

    await resend.emails.send({
      from: 'FindMyTrial <onboarding@resend.dev>',
      to: [doctorEmail],
      subject: `Clinical Trial Summary — ${trials.length} trial${trials.length !== 1 ? 's' : ''} for review`,
      html: emailHtml,
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[FindMyTrial] Email error:', error);
    return NextResponse.json(
      { error: 'Failed to send email', code: 'EMAIL_ERROR' },
      { status: 500 }
    );
  }
}
