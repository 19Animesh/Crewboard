import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signToken, setAuthCookie } from '@/lib/auth';

export async function POST(request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid OTP or email.' }, { status: 400 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ error: 'Email is already verified. Please log in.' }, { status: 400 });
    }

    if (!user.otpCode || user.otpCode !== otp.trim()) {
      return NextResponse.json({ error: 'Invalid OTP. Please try again.' }, { status: 400 });
    }

    if (!user.otpExpiresAt || new Date() > user.otpExpiresAt) {
      return NextResponse.json({ error: 'OTP has expired. Please sign up again to get a new code.' }, { status: 400 });
    }

    // Mark verified, clear OTP
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        otpCode: null,
        otpExpiresAt: null,
      },
    });

    // Auto-login after verification
    const token = await signToken({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    });

    const response = NextResponse.json({
      message: 'Email verified successfully!',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });

    setAuthCookie(response, token);
    return response;
  } catch (error) {
    console.error('[VERIFY OTP ERROR]', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
