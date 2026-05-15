'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/Badge';

const navItems = [
  { href: '/dashboard',      label: 'Dashboard',  icon: '⊞', roles: ['ADMIN', 'MEMBER'] },
  { href: '/projects',       label: 'Projects',   icon: '📁', roles: ['ADMIN', 'MEMBER'] },
  { href: '/projects/new',   label: 'New Project',icon: '＋', roles: ['ADMIN'] },
  { href: '/tasks',          label: 'My Tasks',   icon: '✓',  roles: ['ADMIN', 'MEMBER'] },
];

export default function Sidebar({ onClose }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const filtered = navItems.filter(item => !item.roles || item.roles.includes(user?.role));

  return (
    <div className="flex flex-col h-full bg-gray-900 border-r border-gray-800">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-800">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/30">
          CB
        </div>
        <span className="text-lg font-bold text-white">CrewBoard</span>
        {onClose && (
          <button onClick={onClose} className="ml-auto text-gray-500 hover:text-gray-300 lg:hidden">✕</button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {filtered.map(item => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href) && item.href !== '/projects/new');
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                ${isActive
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                }
              `}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User info & logout */}
      <div className="px-4 py-4 border-t border-gray-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-indigo-600/30 border border-indigo-500/40 rounded-full flex items-center justify-center text-indigo-400 font-semibold text-sm">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-200 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
          <Badge variant={user?.role}>{user?.role}</Badge>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
        >
          <span>⏻</span> Logout
        </button>
      </div>
    </div>
  );
}
