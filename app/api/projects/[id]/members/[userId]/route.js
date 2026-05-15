import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/apiMiddleware';

// DELETE /api/projects/[id]/members/[userId] - Remove a member (Admin only)
export async function DELETE(request, { params }) {
  const { user, error } = await requireAuth(request);
  if (error) return error;

  if (user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Only admins can remove members.' }, { status: 403 });
  }

  try {
    const { id, userId } = await params;

    // Verify project belongs to admin
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
    if (project.createdById !== user.id) {
      return NextResponse.json({ error: 'You can only manage your own projects.' }, { status: 403 });
    }

    // Prevent removing the project creator
    if (userId === project.createdById) {
      return NextResponse.json({ error: 'Cannot remove the project creator.' }, { status: 400 });
    }

    // Delete membership
    await prisma.projectMember.deleteMany({
      where: { projectId: id, userId },
    });

    return NextResponse.json({ message: 'Member removed successfully.' });
  } catch (err) {
    console.error('[REMOVE MEMBER ERROR]', err);
    return NextResponse.json({ error: 'Failed to remove member.' }, { status: 500 });
  }
}
