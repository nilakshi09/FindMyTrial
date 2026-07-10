import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/alerts/:id?action=unsubscribe — Unsubscribe from email link
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'unsubscribe') {
    try {
      await prisma.alert.update({
        where: { id: params.id },
        data: { isActive: false },
      });
      return NextResponse.redirect(
        new URL('/alerts?unsubscribed=true', request.url)
      );
    } catch {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}

// DELETE /api/alerts/:id — Remove an alert
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    await prisma.alert.update({
      where: { id },
      data: { isActive: false },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Alert not found', code: 'NOT_FOUND' },
      { status: 404 }
    );
  }
}

// PATCH /api/alerts/:id — Update frequency
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const body = await request.json();
  const { frequency } = body;

  if (!['daily', 'weekly'].includes(frequency)) {
    return NextResponse.json(
      { error: 'Frequency must be daily or weekly' },
      { status: 400 }
    );
  }

  try {
    const updated = await prisma.alert.update({
      where: { id },
      data: { frequency },
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: 'Alert not found', code: 'NOT_FOUND' },
      { status: 404 }
    );
  }
}
