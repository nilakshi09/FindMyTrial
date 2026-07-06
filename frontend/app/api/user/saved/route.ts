import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ 
    where: { email: session.user.email },
    include: { savedTrials: { orderBy: { savedAt: 'desc' } } }
  });
  return NextResponse.json(user?.savedTrials ?? []);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { nctId, trialData } = await request.json();
  const user = await prisma.user.findUnique({ 
    where: { email: session.user.email } 
  });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  
  const saved = await prisma.userSavedTrial.create({
    data: { userId: user.id, nctId, trialData, savedAt: new Date() }
  });
  return NextResponse.json(saved, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const nctId = searchParams.get('nctId');
  const user = await prisma.user.findUnique({ 
    where: { email: session.user.email } 
  });
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  
  await prisma.userSavedTrial.deleteMany({ 
    where: { userId: user.id, nctId: nctId ?? '' } 
  });
  return NextResponse.json({ success: true });
}
