import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/apiMiddleware';

// GET /api/projects/[id]
export async function GET(request, { params }) {
  const { user, error } = await requireAuth(request);
  if (error) return error;

  try {
    const { id } = await params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        members: { include: { user: { select: { id: true, name: true, email: true, role: true } } } },
        tasks: {
          include: {
            assignedTo: { select: { id: true, name: true, email: true } },
            createdBy: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
    }

    // Check access: admin must be owner, member must be in project
    const isMember = project.members.some(m => m.userId === user.id);
    const isOwner = project.createdById === user.id;

    if (!isOwner && !isMember) {
      return NextResponse.json({ error: 'You do not have access to this project.' }, { status: 403 });
    }

    return NextResponse.json({ project });
  } catch (err) {
    console.error('[PROJECT GET ERROR]', err);
    return NextResponse.json({ error: 'Failed to fetch project.' }, { status: 500 });
  }
}

// PUT /api/projects/[id] - Admin only
export async function PUT(request, { params }) {
  const { user, error } = await requireAuth(request);
  if (error) return error;

  if (user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Only admins can update projects.' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const { title, description, deadline, status } = await request.json();

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
    if (project.createdById !== user.id) {
      return NextResponse.json({ error: 'You can only update your own projects.' }, { status: 403 });
    }

    if (!title || title.trim().length === 0) {
      return NextResponse.json({ error: 'Project title is required.' }, { status: 400 });
    }

    const updated = await prisma.project.update({
      where: { id },
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        deadline: deadline ? new Date(deadline) : null,
        status: status || project.status,
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
        _count: { select: { tasks: true } },
      },
    });

    return NextResponse.json({ message: 'Project updated successfully.', project: updated });
  } catch (err) {
    console.error('[PROJECT PUT ERROR]', err);
    return NextResponse.json({ error: 'Failed to update project.' }, { status: 500 });
  }
}

// DELETE /api/projects/[id] - Admin only
export async function DELETE(request, { params }) {
  const { user, error } = await requireAuth(request);
  if (error) return error;

  if (user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Only admins can delete projects.' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
    if (project.createdById !== user.id) {
      return NextResponse.json({ error: 'You can only delete your own projects.' }, { status: 403 });
    }

    await prisma.project.delete({ where: { id } });
    return NextResponse.json({ message: 'Project deleted successfully.' });
  } catch (err) {
    console.error('[PROJECT DELETE ERROR]', err);
    return NextResponse.json({ error: 'Failed to delete project.' }, { status: 500 });
  }
}
