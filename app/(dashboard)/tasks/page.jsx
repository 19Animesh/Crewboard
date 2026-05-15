'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { StatusBadge, PriorityBadge, Badge } from '@/components/ui/Badge';
import { PageLoader, EmptyState } from '@/components/ui/Spinner';

function formatDate(date) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function isOverdue(task) {
  return task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED';
}

export default function MyTasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tasks')
      .then(r => r.json())
      .then(data => setTasks(data.tasks || []))
      .finally(() => setLoading(false));
  }, []);

  const handleTaskStatusChange = async (taskId, newStatus) => {
    await fetch(`/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    // Optimistic update
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Tasks</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {user?.role === 'ADMIN' ? 'All tasks across your projects' : 'Tasks assigned to you'}
          </p>
        </div>
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          icon="✓"
          title="No tasks yet"
          description="When tasks are created, they will appear here."
        />
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl divide-y divide-gray-800">
          {tasks.map(task => (
            <div key={task.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-800/40 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-sm font-medium text-gray-200">{task.title}</span>
                  {isOverdue(task) && <Badge variant="overdue">Overdue</Badge>}
                </div>
                {task.description && (
                  <p className="text-xs text-gray-500 mb-2 line-clamp-1">{task.description}</p>
                )}
                <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                  <Link href={`/projects/${task.projectId}`} className="hover:text-indigo-400">
                    📁 {task.project?.title}
                  </Link>
                  {user?.role === 'ADMIN' && task.assignedTo && (
                    <span>👤 {task.assignedTo.name}</span>
                  )}
                  <span className={isOverdue(task) ? 'text-red-400' : ''}>
                    📅 Due {formatDate(task.dueDate)}
                  </span>
                </div>
              </div>

              <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:gap-2">
                <div className="flex items-center gap-1.5">
                  <PriorityBadge priority={task.priority} />
                  <StatusBadge status={task.status} />
                </div>
                {/* Status dropdown for user to update */}
                {(!user || user.role === 'MEMBER' || task.assignedToId === user?.id || user.role === 'ADMIN') && (
                   <select
                   value={task.status}
                   onChange={e => handleTaskStatusChange(task.id, e.target.value)}
                   className="text-xs bg-gray-800 border border-gray-700 rounded px-2 py-1 text-gray-300"
                 >
                   <option value="PENDING">Pending</option>
                   <option value="IN_PROGRESS">In Progress</option>
                   <option value="COMPLETED">Completed</option>
                 </select>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
