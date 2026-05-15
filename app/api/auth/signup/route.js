import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signToken, setAuthCookie } from '@/lib/auth';

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

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user (only allow ADMIN role if explicitly passed; default is MEMBER)
    const userRole = role === 'ADMIN' ? 'ADMIN' : 'MEMBER';
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: userRole,
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    // Sign JWT
    const token = signToken({ id: user.id, name: user.name, email: user.email, role: user.role });

    // Create response and set cookie
    const response = NextResponse.json({ message: 'Account created successfully.', user }, { status: 201 });
    setAuthCookie(response, token);

    return response;
  } catch (error) {
    console.error('[SIGNUP ERROR]', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
