import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signToken, setAuthCookie } from '@/lib/auth';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    // Check if email is verified (bypass for demo users)
    const isDemoUser = user.email === 'admin@example.com' || user.email === 'member@example.com';
    if (!user.emailVerified && !isDemoUser) {
      return NextResponse.json({ error: 'Please verify your email before logging in.' }, { status: 403 });
    }

    // Compare password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    // Sign JWT
    const token = await signToken({ id: user.id, name: user.name, email: user.email, role: user.role });

    // Create response with cookie
    const response = NextResponse.json({
      message: 'Logged in successfully.',
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
    setAuthCookie(response, token);

    return response;
  } catch (error) {
    console.error('[LOGIN ERROR]', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
