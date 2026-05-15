import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/apiMiddleware';

// POST /api/projects/[id]/members - Add a member by email (Admin only)
export async function POST(request, { params }) {
  const { user, error } = await requireAuth(request);
  if (error) return error;

  if (user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Only admins can add members.' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'User email is required.' }, { status: 400 });
    }

    // Verify project exists and belongs to admin
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
    if (project.createdById !== user.id) {
      return NextResponse.json({ error: 'You can only manage your own projects.' }, { status: 403 });
    }

    // Find the user to add
    const userToAdd = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { id: true, name: true, email: true, role: true },
    });
    if (!userToAdd) {
      return NextResponse.json({ error: 'No user found with this email. They must sign up first.' }, { status: 404 });
    }

    // Check if already a member
    const existing = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: id, userId: userToAdd.id } },
    });
    if (existing) {
      return NextResponse.json({ error: 'This user is already a member of this project.' }, { status: 409 });
    }

    // Add member
    await prisma.projectMember.create({
      data: { projectId: id, userId: userToAdd.id },
    });

    return NextResponse.json({
      message: `${userToAdd.name} added to the project successfully.`,
      user: userToAdd,
    }, { status: 201 });
  } catch (err) {
    console.error('[ADD MEMBER ERROR]', err);
    return NextResponse.json({ error: 'Failed to add member.' }, { status: 500 });
  }
}

// GET /api/projects/[id]/members - List members
export async function GET(request, { params }) {
  const { user, error } = await requireAuth(request);
  if (error) return error;

  try {
    const { id } = await params;
    const members = await prisma.projectMember.findMany({
      where: { projectId: id },
      include: { user: { select: { id: true, name: true, email: true, role: true } } },
    });

    return NextResponse.json({ members });
  } catch (err) {
    console.error('[GET MEMBERS ERROR]', err);
    return NextResponse.json({ error: 'Failed to fetch members.' }, { status: 500 });
  }
}
