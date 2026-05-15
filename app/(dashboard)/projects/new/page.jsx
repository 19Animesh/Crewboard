'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AlertMessage } from '@/components/ui/Spinner';

export default function NewProjectPage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: '', description: '', deadline: '', status: 'ACTIVE' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.title.trim()) {
      setError('Project title is required.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create project.');
        setLoading(false);
      } else {
        router.push(`/projects/${data.project.id}`);
        // Do not set loading to false here, so the spinner stays until navigation completes
      }
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link href="/projects" className="hover:text-gray-300">Projects</Link>
          <span>/</span>
          <span className="text-gray-300">New Project</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Create Project</h1>
        <p className="text-sm text-gray-500 mt-1">Set up a new project for your team</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <AlertMessage type="error" message={error} />

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <Input
            id="title"
            label="Project Title"
            placeholder="e.g. Website Redesign"
            value={form.title}
            onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            required
          />
          <Textarea
            id="description"
            label="Description"
            placeholder="What is this project about?"
            value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            rows={4}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="deadline"
              label="Deadline"
              type="date"
              value={form.deadline}
              onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))}
            />
            <Select
              id="status"
              label="Status"
              value={form.status}
              onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
            >
              <option value="ACTIVE">Active</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="COMPLETED">Completed</option>
            </Select>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={loading} size="lg">
              Create Project
            </Button>
            <Link href="/projects">
              <Button variant="secondary" size="lg">Cancel</Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
