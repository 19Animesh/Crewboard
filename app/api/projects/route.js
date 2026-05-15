import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/apiMiddleware';

// GET /api/projects - list projects based on role
export async function GET(request) {
  const { user, error } = await requireAuth(request);
  if (error) return error;

  try {
    let projects;

    if (user.role === 'ADMIN') {
      // Admin sees all projects they created
      projects = await prisma.project.findMany({
        where: { createdById: user.id },
        include: {
          createdBy: { select: { id: true, name: true, email: true } },
          members: { include: { user: { select: { id: true, name: true, email: true, role: true } } } },
          _count: { select: { tasks: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      // Member sees projects they belong to
      projects = await prisma.project.findMany({
        where: {
          members: { some: { userId: user.id } },
        },
        include: {
          createdBy: { select: { id: true, name: true, email: true } },
          members: { include: { user: { select: { id: true, name: true, email: true, role: true } } } },
          _count: { select: { tasks: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return NextResponse.json({ projects });
  } catch (err) {
    console.error('[PROJECTS GET ERROR]', err);
    return NextResponse.json({ error: 'Failed to fetch projects.' }, { status: 500 });
  }
}

// POST /api/projects - create a project (Admin only)
export async function POST(request) {
  const { user, error } = await requireAuth(request);
  if (error) return error;

  if (user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Only admins can create projects.' }, { status: 403 });
  }

  try {
    const { title, description, deadline, status } = await request.json();

    if (!title || title.trim().length === 0) {
      return NextResponse.json({ error: 'Project title is required.' }, { status: 400 });
    }

    let validDeadline = null;
    if (deadline) {
      validDeadline = new Date(deadline);
      if (isNaN(validDeadline.getTime())) {
        return NextResponse.json({ error: 'Invalid date format for deadline.' }, { status: 400 });
      }
    }

    const project = await prisma.project.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        deadline: validDeadline,
        status: status || 'ACTIVE',
        createdById: user.id,
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
        _count: { select: { tasks: true } },
      },
    });

    // Auto-add creator as a member
    await prisma.projectMember.create({
      data: { projectId: project.id, userId: user.id },
    });

    return NextResponse.json({ message: 'Project created successfully.', project }, { status: 201 });
  } catch (err) {
    console.error('[PROJECTS POST ERROR]', err);
    return NextResponse.json({ error: 'Failed to create project.' }, { status: 500 });
  }
}
