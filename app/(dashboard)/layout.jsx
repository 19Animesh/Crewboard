'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import { PageLoader } from '@/components/ui/Spinner';

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) return <PageLoader />;

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-64">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-gray-900/80 backdrop-blur border-b border-gray-800 flex items-center px-4 gap-4 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg"
          >
            ☰
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="hidden sm:block">Welcome back,</span>
            <span className="font-medium text-gray-200">{user?.name}</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
