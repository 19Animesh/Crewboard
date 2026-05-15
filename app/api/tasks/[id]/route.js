import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/apiMiddleware';

// GET /api/tasks/[id]
export async function GET(request, { params }) {
  const { user, error } = await requireAuth(request);
  if (error) return error;

  try {
    const { id } = await params;
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, title: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (!task) return NextResponse.json({ error: 'Task not found.' }, { status: 404 });

    // Access check
    const isAdmin = user.role === 'ADMIN';
    const isAssignee = task.assignedToId === user.id;
    if (!isAdmin && !isAssignee) {
      return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
    }

    return NextResponse.json({ task });
  } catch (err) {
    console.error('[TASK GET ERROR]', err);
    return NextResponse.json({ error: 'Failed to fetch task.' }, { status: 500 });
  }
}

// PUT /api/tasks/[id]
// Admin: can update everything
// Member: can only update status of their own task
export async function PUT(request, { params }) {
  const { user, error } = await requireAuth(request);
  if (error) return error;

  try {
    const { id } = await params;
    const body = await request.json();

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return NextResponse.json({ error: 'Task not found.' }, { status: 404 });

    if (user.role === 'MEMBER') {
      // Members can only update status of tasks assigned to them
      if (task.assignedToId !== user.id) {
        return NextResponse.json({ error: 'You can only update tasks assigned to you.' }, { status: 403 });
      }

      const updated = await prisma.task.update({
        where: { id },
        data: { status: body.status || task.status },
        include: {
          project: { select: { id: true, title: true } },
          assignedTo: { select: { id: true, name: true, email: true } },
          createdBy: { select: { id: true, name: true, email: true } },
        },
      });
      return NextResponse.json({ message: 'Task status updated.', task: updated });
    }

    // Admin full update
    const { title, description, status, priority, dueDate, assignedToId } = body;

    if (!title || title.trim().length === 0) {
      return NextResponse.json({ error: 'Task title is required.' }, { status: 400 });
    }

    // Verify assignee is a project member
    if (assignedToId) {
      const membership = await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId: task.projectId, userId: assignedToId } },
      });
      if (!membership) {
        return NextResponse.json({ error: 'Assigned user must be a member of this project.' }, { status: 400 });
      }
    }

    const updated = await prisma.task.update({
      where: { id },
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        status: status || task.status,
        priority: priority || task.priority,
        dueDate: dueDate ? new Date(dueDate) : task.dueDate,
        assignedToId: assignedToId || null,
      },
      include: {
        project: { select: { id: true, title: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ message: 'Task updated successfully.', task: updated });
  } catch (err) {
    console.error('[TASK PUT ERROR]', err);
    return NextResponse.json({ error: 'Failed to update task.' }, { status: 500 });
  }
}

// DELETE /api/tasks/[id] - Admin only
export async function DELETE(request, { params }) {
  const { user, error } = await requireAuth(request);
  if (error) return error;

  if (user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Only admins can delete tasks.' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return NextResponse.json({ error: 'Task not found.' }, { status: 404 });

    // Verify admin owns the project
    const project = await prisma.project.findUnique({ where: { id: task.projectId } });
    if (project.createdById !== user.id) {
      return NextResponse.json({ error: 'You can only delete tasks from your own projects.' }, { status: 403 });
    }

    await prisma.task.delete({ where: { id } });
    return NextResponse.json({ message: 'Task deleted successfully.' });
  } catch (err) {
    console.error('[TASK DELETE ERROR]', err);
    return NextResponse.json({ error: 'Failed to delete task.' }, { status: 500 });
  }
}
