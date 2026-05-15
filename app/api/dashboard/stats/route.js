import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/apiMiddleware';

// GET /api/dashboard/stats
export async function GET(request) {
  const { user, error } = await requireAuth(request);
  if (error) return error;

  try {
    const now = new Date();

    if (user.role === 'ADMIN') {
      // Admin: stats for all their projects and tasks
      const [
        totalProjects,
        totalTasks,
        pendingTasks,
        inProgressTasks,
        completedTasks,
        overdueTasks,
        recentTasks,
        recentProjects,
      ] = await Promise.all([
        prisma.project.count({ where: { createdById: user.id } }),
        prisma.task.count({ where: { project: { createdById: user.id } } }),
        prisma.task.count({ where: { project: { createdById: user.id }, status: 'PENDING' } }),
        prisma.task.count({ where: { project: { createdById: user.id }, status: 'IN_PROGRESS' } }),
        prisma.task.count({ where: { project: { createdById: user.id }, status: 'COMPLETED' } }),
        prisma.task.count({
          where: {
            project: { createdById: user.id },
            status: { not: 'COMPLETED' },
            dueDate: { lt: now },
          },
        }),
        prisma.task.findMany({
          where: { project: { createdById: user.id } },
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            project: { select: { id: true, title: true } },
            assignedTo: { select: { id: true, name: true, email: true } },
          },
        }),
        prisma.project.findMany({
          where: { createdById: user.id },
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { _count: { select: { tasks: true, members: true } } },
        }),
      ]);

      return NextResponse.json({
        totalProjects,
        totalTasks,
        pendingTasks,
        inProgressTasks,
        completedTasks,
        overdueTasks,
        recentTasks,
        recentProjects,
      });
    } else {
      // Member: stats for their assigned tasks only
      const [
        totalProjects,
        totalTasks,
        pendingTasks,
        inProgressTasks,
        completedTasks,
        overdueTasks,
        recentTasks,
      ] = await Promise.all([
        prisma.projectMember.count({ where: { userId: user.id } }),
        prisma.task.count({ where: { assignedToId: user.id } }),
        prisma.task.count({ where: { assignedToId: user.id, status: 'PENDING' } }),
        prisma.task.count({ where: { assignedToId: user.id, status: 'IN_PROGRESS' } }),
        prisma.task.count({ where: { assignedToId: user.id, status: 'COMPLETED' } }),
        prisma.task.count({
          where: {
            assignedToId: user.id,
            status: { not: 'COMPLETED' },
            dueDate: { lt: now },
          },
        }),
        prisma.task.findMany({
          where: { assignedToId: user.id },
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            project: { select: { id: true, title: true } },
            assignedTo: { select: { id: true, name: true, email: true } },
          },
        }),
      ]);

      return NextResponse.json({
        totalProjects,
        totalTasks,
        pendingTasks,
        inProgressTasks,
        completedTasks,
        overdueTasks,
        recentTasks,
        recentProjects: [],
      });
    }
  } catch (err) {
    console.error('[DASHBOARD STATS ERROR]', err);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats.' }, { status: 500 });
  }
}
