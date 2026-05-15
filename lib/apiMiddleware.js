import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

/**
 * Helper to require authentication in API routes
 * Returns { user, error } - if error is set, return the error response
 */
export async function requireAuth(request) {
  const user = await getCurrentUser(request);
  if (!user) {
    return {
      user: null,
      error: NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      ),
    };
  }
  return { user, error: null };
}

/**
 * Helper to require Admin role in API routes
 */
export async function requireAdmin(request) {
  const { user, error } = await requireAuth(request);
  if (error) return { user: null, error };

  if (user.role !== 'ADMIN') {
    return {
      user: null,
      error: NextResponse.json(
        { error: 'Forbidden. Admin access required.' },
        { status: 403 }
      ),
    };
  }
  return { user, error: null };
}
