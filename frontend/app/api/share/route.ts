import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@/lib/prisma';

function generateShortId(): string {
  // Generate an 8-character alphanumeric ID (friendlier than full UUID)
  return uuidv4().replace(/-/g, '').slice(0, 8).toUpperCase();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { trials, patientNote } = body;

    // Validate input
    if (!trials || !Array.isArray(trials) || trials.length === 0) {
      return NextResponse.json(
        { error: 'At least one trial is required', code: 'INVALID_INPUT' },
        { status: 400 }
      );
    }

    if (trials.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 trials per share', code: 'TOO_MANY_TRIALS' },
        { status: 400 }
      );
    }

    // Generate share ID
    const shareId = generateShortId();

    // Store in database with 30-day expiry
    await prisma.sharedSummary.create({
      data: {
        shareId,
        payload: { trials, patientNote: patientNote?.trim() || undefined },
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // Build the share URL
    const baseUrl = request.headers.get('origin')
      || process.env.NEXT_PUBLIC_BASE_URL
      || 'http://localhost:3000';
    const shareUrl = `${baseUrl}/share/${shareId}`;

    return NextResponse.json({ shareId, shareUrl });

  } catch (error) {
    console.error('[FindMyTrial] Share API error:', error);
    return NextResponse.json(
      { error: 'Failed to create share link', code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const shareId = searchParams.get('id');

  if (!shareId) {
    return NextResponse.json(
      { error: 'shareId is required', code: 'MISSING_ID' },
      { status: 400 }
    );
  }

  try {
    const record = await prisma.sharedSummary.findUnique({
      where: { shareId },
    });

    if (!record) {
      return NextResponse.json(
        { error: 'Share link not found or expired', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    if (record.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'This share link has expired', code: 'EXPIRED' },
        { status: 410 }
      );
    }

    const summary = record.payload as any;
    return NextResponse.json({
      trials: summary.trials,
      patientNote: summary.patientNote,
      createdAt: record.createdAt,
      expiresAt: record.expiresAt,
    });

  } catch (error) {
    console.error('[FindMyTrial] Share GET error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve share link', code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}
