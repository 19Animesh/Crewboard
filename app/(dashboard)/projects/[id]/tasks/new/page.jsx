'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AlertMessage, PageLoader } from '@/components/ui/Spinner';

export default function NewTaskPage() {
  const { id: projectId } = useParams();
  const router = useRouter();
  const [form, setForm] = useState({
    title: '', description: '', assignedToId: '',
    status: 'PENDING', priority: 'MEDIUM', dueDate: '',
  });
  const [members, setMembers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(true);

  useEffect(() => {
    fetch(`/api/projects/${projectId}/members`)
      .then(r => r.json())
      .then(d => setMembers(d.members || []))
      .finally(() => setLoadingMembers(false));
  }, [projectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.title.trim()) { setError('Task title is required.'); return; }
    if (!form.dueDate) { setError('Due date is required.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, projectId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create task.');
        setLoading(false);
      } else {
        router.push(`/projects/${projectId}`);
      }
    } catch { 
      setError('Network error.'); 
      setLoading(false);
    }
  };

  if (loadingMembers) return <PageLoader />;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link href="/projects" className="hover:text-gray-300">Projects</Link>
          <span>/</span>
          <Link href={`/projects/${projectId}`} className="hover:text-gray-300">Project</Link>
          <span>/</span>
          <span className="text-gray-300">New Task</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Create Task</h1>
        <p className="text-sm text-gray-500 mt-1">Add a new task to this project</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <AlertMessage type="error" message={error} />
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <Input id="title" label="Task Title" placeholder="e.g. Design homepage mockup"
            value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
          <Textarea id="description" label="Description" placeholder="Describe the task..."
            value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          <div className="grid grid-cols-2 gap-4">
            <Select id="priority" label="Priority" value={form.priority}
              onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </Select>
            <Select id="status" label="Status" value={form.status}
              onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input id="dueDate" label="Due Date" type="date" value={form.dueDate}
              onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} required />
            <Select id="assignedToId" label="Assign To" value={form.assignedToId}
              onChange={e => setForm(p => ({ ...p, assignedToId: e.target.value }))}>
              <option value="">Unassigned</option>
              {members.map(m => (
                <option key={m.id} value={m.userId}>{m.user.name} ({m.user.email})</option>
              ))}
            </Select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={loading} size="lg">Create Task</Button>
            <Link href={`/projects/${projectId}`}>
              <Button variant="secondary" size="lg">Cancel</Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
