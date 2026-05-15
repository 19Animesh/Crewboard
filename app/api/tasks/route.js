import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/apiMiddleware';

// GET /api/tasks
export async function GET(request) {
  const { user, error } = await requireAuth(request);
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    let tasks;

    if (user.role === 'ADMIN') {
      // Admin sees all tasks in their projects
      tasks = await prisma.task.findMany({
        where: {
          project: { createdById: user.id },
          ...(projectId ? { projectId } : {}),
        },
        include: {
          project: { select: { id: true, title: true } },
          assignedTo: { select: { id: true, name: true, email: true } },
          createdBy: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      // Member sees only tasks assigned to them
      tasks = await prisma.task.findMany({
        where: {
          assignedToId: user.id,
          ...(projectId ? { projectId } : {}),
        },
        include: {
          project: { select: { id: true, title: true } },
          assignedTo: { select: { id: true, name: true, email: true } },
          createdBy: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return NextResponse.json({ tasks });
  } catch (err) {
    console.error('[TASKS GET ERROR]', err);
    return NextResponse.json({ error: 'Failed to fetch tasks.' }, { status: 500 });
  }
}

// POST /api/tasks - Admin only
export async function POST(request) {
  const { user, error } = await requireAuth(request);
  if (error) return error;

  if (user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Only admins can create tasks.' }, { status: 403 });
  }

  try {
    const { title, description, projectId, assignedToId, status, priority, dueDate } = await request.json();

    // Validations
    if (!title || title.trim().length === 0) {
      return NextResponse.json({ error: 'Task title is required.' }, { status: 400 });
    }
    if (!projectId) {
      return NextResponse.json({ error: 'Project is required.' }, { status: 400 });
    }
    if (!dueDate) {
      return NextResponse.json({ error: 'Due date is required.' }, { status: 400 });
    }

    // Verify project belongs to this admin
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
    if (project.createdById !== user.id) {
      return NextResponse.json({ error: 'You can only create tasks in your own projects.' }, { status: 403 });
    }

    // Verify assigned user is a member of the project
    if (assignedToId) {
      const membership = await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId, userId: assignedToId } },
      });
      if (!membership) {
        return NextResponse.json({ error: 'Assigned user must be a member of this project.' }, { status: 400 });
      }
    }

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        status: status || 'PENDING',
        priority: priority || 'MEDIUM',
        dueDate: new Date(dueDate),
        projectId,
        assignedToId: assignedToId || null,
        createdById: user.id,
      },
      include: {
        project: { select: { id: true, title: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ message: 'Task created successfully.', task }, { status: 201 });
  } catch (err) {
    console.error('[TASKS POST ERROR]', err);
    return NextResponse.json({ error: 'Failed to create task.' }, { status: 500 });
  }
}
