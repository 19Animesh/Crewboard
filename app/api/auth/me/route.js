import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const tokenUser = await getCurrentUser(request);
    if (!tokenUser) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    }

    // Fetch fresh user data from DB
    const user = await prisma.user.findUnique({
      where: { id: tokenUser.id },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('[ME ERROR]', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
