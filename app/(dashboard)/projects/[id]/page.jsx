'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { StatusBadge, PriorityBadge, Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PageLoader, EmptyState, AlertMessage } from '@/components/ui/Spinner';

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

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberError, setMemberError] = useState('');
  const [memberSuccess, setMemberSuccess] = useState('');
  const [addingMember, setAddingMember] = useState(false);
  const [deletingProject, setDeletingProject] = useState(false);

  const fetchProject = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${id}`);
      const data = await res.json();
      if (res.ok) setProject(data.project);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchProject(); }, [fetchProject]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    setMemberError(''); setMemberSuccess('');
    if (!memberEmail.trim()) { setMemberError('Email is required.'); return; }
    setAddingMember(true);
    try {
      const res = await fetch(`/api/projects/${id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: memberEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMemberError(data.error || 'Failed to add member.');
      } else {
        setMemberSuccess(data.message);
        setMemberEmail('');
        await fetchProject();
      }
    } catch {
      setMemberError('Network error. Please try again.');
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm('Remove this member from the project?')) return;
    await fetch(`/api/projects/${id}/members/${userId}`, { method: 'DELETE' });
    fetchProject();
  };

  const handleDeleteProject = async () => {
    if (!confirm('Delete this project and all its tasks? This cannot be undone.')) return;
    setDeletingProject(true);
    const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    if (res.ok) router.push('/projects');
    else setDeletingProject(false);
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
    fetchProject();
  };

  const handleTaskStatusChange = async (taskId, newStatus) => {
    await fetch(`/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchProject();
  };

  if (loading) return <PageLoader />;
  if (!project) return (
    <div className="text-center py-20 text-gray-500">
      Project not found. <Link href="/projects" className="text-indigo-400">Back to projects</Link>
    </div>
  );

  const isOwner = project.createdById === user?.id;
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/projects" className="hover:text-gray-300">Projects</Link>
        <span>/</span>
        <span className="text-gray-300 truncate">{project.title}</span>
      </div>

      {/* Project Header */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-2xl font-bold text-white">{project.title}</h1>
              <StatusBadge status={project.status} />
            </div>
            {project.description && <p className="text-gray-400 text-sm mb-3 max-w-2xl">{project.description}</p>}
            <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
              <span>👤 Created by {project.createdBy?.name}</span>
              {project.deadline && (
                <span className={new Date(project.deadline) < new Date() ? 'text-red-400' : ''}>
                  📅 Deadline: {formatDate(project.deadline)}
                </span>
              )}
              <span>📅 Created: {formatDate(project.createdAt)}</span>
            </div>
          </div>
          {isAdmin && isOwner && (
            <div className="flex gap-2">
              <Link href={`/projects/${id}/tasks/new`}>
                <Button size="sm">+ Add Task</Button>
              </Link>
              <Button variant="danger" size="sm" loading={deletingProject} onClick={handleDeleteProject}>
                Delete
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tasks */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Tasks ({project.tasks?.length || 0})</h2>
            {isAdmin && isOwner && (
              <Link href={`/projects/${id}/tasks/new`}>
                <Button size="sm" variant="outline">+ New Task</Button>
              </Link>
            )}
          </div>

          {project.tasks?.length === 0 ? (
            <EmptyState icon="📋" title="No tasks yet" description="Add tasks to this project to track progress." />
          ) : (
            <div className="space-y-2">
              {project.tasks?.map(task => (
                <div key={task.id} className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-4 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-medium text-gray-200">{task.title}</span>
                        {isOverdue(task) && <Badge variant="overdue">Overdue</Badge>}
                      </div>
                      {task.description && <p className="text-xs text-gray-500 mb-2 line-clamp-1">{task.description}</p>}
                      <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                        {task.assignedTo && <span>👤 {task.assignedTo.name}</span>}
                        <span>📅 {formatDate(task.dueDate)}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-1.5">
                        <PriorityBadge priority={task.priority} />
                        <StatusBadge status={task.status} />
                      </div>
                      {/* Status changer for assignee (member) */}
                      {!isAdmin && task.assignedToId === user?.id && (
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
                      {isAdmin && isOwner && (
                        <div className="flex gap-1">
                          <select
                            value={task.status}
                            onChange={e => handleTaskStatusChange(task.id, e.target.value)}
                            className="text-xs bg-gray-800 border border-gray-700 rounded px-2 py-1 text-gray-300"
                          >
                            <option value="PENDING">Pending</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="COMPLETED">Completed</option>
                          </select>
                          <button onClick={() => handleDeleteTask(task.id)} className="p-1 text-gray-600 hover:text-red-400 transition-colors text-xs">✕</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: Members */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Members ({project.members?.length || 0})</h2>

          <div className="bg-gray-900 border border-gray-800 rounded-xl divide-y divide-gray-800">
            {project.members?.map(m => (
              <div key={m.id} className="flex items-center justify-between px-4 py-3 gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 bg-indigo-600/30 border border-indigo-500/40 rounded-full flex items-center justify-center text-indigo-400 text-xs font-semibold flex-shrink-0">
                    {m.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-200 truncate">{m.user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{m.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Badge variant={m.user.role}>{m.user.role}</Badge>
                  {isAdmin && isOwner && m.userId !== user?.id && (
                    <button onClick={() => handleRemoveMember(m.userId)} className="text-gray-600 hover:text-red-400 transition-colors text-sm ml-1">✕</button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add member form (admin only) */}
          {isAdmin && isOwner && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Add Member</h3>
              <AlertMessage type="error" message={memberError} />
              <AlertMessage type="success" message={memberSuccess} />
              <form onSubmit={handleAddMember} className="mt-3 flex gap-2">
                <input
                  type="email"
                  value={memberEmail}
                  onChange={e => setMemberEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-0"
                />
                <Button type="submit" size="sm" loading={addingMember}>Add</Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
