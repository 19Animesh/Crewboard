import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { sendOtpEmail } from '@/lib/mail';

// Generate a 6-digit OTP
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request) {
  try {
    const { name, email, password, role } = await request.json();

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required.' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    // Check if user already exists and is verified
    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existingUser && existingUser.emailVerified) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate OTP (6 digits) and expiry (10 minutes)
    const otp = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const userRole = role === 'ADMIN' ? 'ADMIN' : 'MEMBER';

    // Upsert: update if unverified account exists, create if new
    if (existingUser) {
      await prisma.user.update({
        where: { email: email.toLowerCase() },
        data: {
          name: name.trim(),
          password: hashedPassword,
          role: userRole,
          otpCode: otp,
          otpExpiresAt,
        },
      });
    } else {
      await prisma.user.create({
        data: {
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          role: userRole,
          otpCode: otp,
          otpExpiresAt,
        },
      });
    }

    // Send OTP email
    try {
      await sendOtpEmail(email.toLowerCase().trim(), otp, name.trim());
    } catch (mailError) {
      console.error('[SIGNUP EMAIL ERROR]', mailError);
      return NextResponse.json(
        { error: 'Failed to send verification email. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'OTP sent to your email. Please verify to complete signup.',
        email: email.toLowerCase().trim(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[SIGNUP ERROR]', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
