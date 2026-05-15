'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { StatCard } from '@/components/ui/Card';
import { StatusBadge, PriorityBadge, Badge } from '@/components/ui/Badge';
import { PageLoader, EmptyState } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';

function formatDate(date) {
  if (!date) return '—';
  try {
    return new Date(date).toISOString().split('T')[0];
  } catch {
    return '—';
  }
}

function isOverdue(task) {
  return task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED';
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/stats?t=' + Date.now(), { cache: 'no-store' })
      .then(r => r.json())
      .then(data => setStats(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {user?.role === 'ADMIN' ? 'Overview of all your projects and tasks' : 'Your assigned tasks overview'}
          </p>
        </div>
        {user?.role === 'ADMIN' && (
          <Link href="/projects/new">
            <Button>+ New Project</Button>
          </Link>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard icon="📁" label="Projects"    value={stats?.totalProjects}   color="indigo" />
        <StatCard icon="📋" label="Total Tasks" value={stats?.totalTasks}      color="blue" />
        <StatCard icon="🕐" label="Pending"     value={stats?.pendingTasks}    color="yellow" />
        <StatCard icon="⚡" label="In Progress" value={stats?.inProgressTasks} color="purple" />
        <StatCard icon="✅" label="Completed"   value={stats?.completedTasks}  color="green" />
        <StatCard icon="🔥" label="Overdue"     value={stats?.overdueTasks}    color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl">
          <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
            <h2 className="font-semibold text-white">Recent Tasks</h2>
            <Link href="/tasks" className="text-sm text-indigo-400 hover:text-indigo-300">View all →</Link>
          </div>
          <div className="divide-y divide-gray-800">
            {stats?.recentTasks?.length === 0 && (
              <EmptyState icon="📭" title="No tasks yet" description="Tasks will appear here." />
            )}
            {stats?.recentTasks?.map(task => (
              <div key={task.id} className="px-6 py-3.5 flex items-start justify-between gap-4 hover:bg-gray-800/40 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-gray-200 truncate">{task.title}</p>
                    {isOverdue(task) && <Badge variant="overdue">Overdue</Badge>}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {task.project?.title} · Due {formatDate(task.dueDate)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <StatusBadge status={task.status} />
                  <PriorityBadge priority={task.priority} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Projects (admin only) or Task summary */}
        {user?.role === 'ADMIN' ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl">
            <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
              <h2 className="font-semibold text-white">Recent Projects</h2>
              <Link href="/projects" className="text-sm text-indigo-400 hover:text-indigo-300">View all →</Link>
            </div>
            <div className="divide-y divide-gray-800">
              {stats?.recentProjects?.length === 0 && (
                <EmptyState icon="📁" title="No projects yet" description="Create your first project." />
              )}
              {stats?.recentProjects?.map(project => (
                <Link key={project.id} href={`/projects/${project.id}`}
                  className="px-6 py-3.5 flex items-center justify-between gap-4 hover:bg-gray-800/40 transition-colors block">
                  <div>
                    <p className="text-sm font-medium text-gray-200">{project.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {project._count?.members} members · {project._count?.tasks} tasks
                    </p>
                  </div>
                  <StatusBadge status={project.status} />
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="font-semibold text-white mb-4">Your Progress</h2>
            <div className="space-y-3">
              {[
                { label: 'Completion rate', value: stats?.totalTasks ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0, color: 'bg-green-500' },
                { label: 'In progress', value: stats?.totalTasks ? Math.round((stats.inProgressTasks / stats.totalTasks) * 100) : 0, color: 'bg-blue-500' },
                { label: 'Overdue rate', value: stats?.totalTasks ? Math.round((stats.overdueTasks / stats.totalTasks) * 100) : 0, color: 'bg-red-500' },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">{item.label}</span>
                    <span className="text-gray-300 font-medium">{item.value}%</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
