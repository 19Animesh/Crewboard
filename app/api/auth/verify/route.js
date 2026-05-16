import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signToken, setAuthCookie } from '@/lib/auth';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(new URL('/login?error=Invalid verification link', request.url));
    }

    const user = await prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) {
      return NextResponse.redirect(new URL('/login?error=Invalid or expired verification link', request.url));
    }

    // Verify user and clear token
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
      },
    });

    // Automatically log them in after verification
    const authToken = await signToken({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    });

    const response = NextResponse.redirect(new URL('/dashboard?verified=true', request.url));
    setAuthCookie(response, authToken);

    return response;
  } catch (error) {
    console.error('[VERIFY ERROR]', error);
    return NextResponse.redirect(new URL('/login?error=Verification failed', request.url));
  }
}
