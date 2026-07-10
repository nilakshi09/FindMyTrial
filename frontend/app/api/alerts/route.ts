import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// POST /api/alerts — Create a new alert
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, query, location, frequency } = body;

    // Validate
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required', code: 'INVALID_EMAIL' },
        { status: 400 }
      );
    }
    if (!query || query.trim().length < 3) {
      return NextResponse.json(
        { error: 'Query must be at least 3 characters', code: 'INVALID_QUERY' },
        { status: 400 }
      );
    }
    if (frequency && !['daily', 'weekly'].includes(frequency)) {
      return NextResponse.json(
        { error: 'Frequency must be daily or weekly', code: 'INVALID_FREQUENCY' },
        { status: 400 }
      );
    }

    // Check duplicate (same email + query)
    const existing = await prisma.alert.findFirst({
      where: { 
        email: email.toLowerCase(), 
        query: query.trim(),
        isActive: true 
      },
    });
    if (existing) {
      return NextResponse.json(
        { error: 'You already have an alert for this search', code: 'DUPLICATE' },
        { status: 409 }
      );
    }

    // Check limit (max 10 alerts per email)
    const count = await prisma.alert.count({
      where: { email: email.toLowerCase(), isActive: true },
    });
    if (count >= 10) {
      return NextResponse.json(
        { error: 'Maximum 10 active alerts per email', code: 'LIMIT_REACHED' },
        { status: 429 }
      );
    }

    const alert = await prisma.alert.create({
      data: {
        email: email.toLowerCase(),
        query: query.trim(),
        location: location?.trim() || null,
        frequency: frequency || 'weekly',
      },
    });

    return NextResponse.json(alert, { status: 201 });
  } catch (error) {
    console.error('[FindMyTrial] Create alert error:', error);
    return NextResponse.json(
      { error: 'Failed to create alert', code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}

// GET /api/alerts?email= — List alerts for an email
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email || !email.includes('@')) {
    return NextResponse.json(
      { error: 'Valid email is required', code: 'INVALID_EMAIL' },
      { status: 400 }
    );
  }

  const alerts = await prisma.alert.findMany({
    where: { email: email.toLowerCase(), isActive: true },
    orderBy: { createdAt: 'desc' },
    include: {
      results: { select: { nctId: true }, take: 1 },
    },
  });

  return NextResponse.json(alerts);
}
