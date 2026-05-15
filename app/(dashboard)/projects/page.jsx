'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageLoader, EmptyState } from '@/components/ui/Spinner';

function formatDate(date) {
  if (!date) return 'No deadline';
  try {
    return new Date(date).toISOString().split('T')[0];
  } catch {
    return 'No deadline';
  }
}

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/projects')
      .then(r => r.json())
      .then(data => setProjects(data.projects || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {user?.role === 'ADMIN' ? `${projects.length} project${projects.length !== 1 ? 's' : ''} created` : `${projects.length} project${projects.length !== 1 ? 's' : ''} you're part of`}
          </p>
        </div>
        {user?.role === 'ADMIN' && (
          <Link href="/projects/new"><Button>+ New Project</Button></Link>
        )}
      </div>

      {/* Projects grid */}
      {projects.length === 0 ? (
        <EmptyState
          icon="📁"
          title="No projects yet"
          description={user?.role === 'ADMIN' ? 'Create your first project to get started.' : 'You haven\'t been added to any projects yet.'}
          action={user?.role === 'ADMIN' && <Link href="/projects/new"><Button>Create Project</Button></Link>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {projects.map(project => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <div className="bg-gray-900 border border-gray-800 hover:border-gray-700 hover:shadow-lg hover:shadow-black/20 rounded-xl p-5 transition-all hover:-translate-y-0.5 cursor-pointer h-full flex flex-col">
                {/* Status */}
                <div className="flex items-start justify-between mb-3">
                  <StatusBadge status={project.status} />
                  <span className="text-xs text-gray-500">{formatDate(project.createdAt)}</span>
                </div>

                {/* Title */}
                <h3 className="text-base font-semibold text-white mb-1.5">{project.title}</h3>
                {project.description && (
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3 flex-1">{project.description}</p>
                )}

                {/* Meta */}
                <div className="mt-auto pt-3 border-t border-gray-800 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-3">
                    <span>👥 {project.members?.length || 0} member{(project.members?.length || 0) !== 1 ? 's' : ''}</span>
                    <span>📋 {project._count?.tasks || 0} task{(project._count?.tasks || 0) !== 1 ? 's' : ''}</span>
                  </div>
                  {project.deadline && (
                    <span className={new Date(project.deadline) < new Date() ? 'text-red-400' : ''}>
                      📅 {formatDate(project.deadline)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
