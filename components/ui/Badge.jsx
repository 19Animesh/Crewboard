'use client';

// Reusable Badge component for status and priority labels
export function Badge({ variant = 'default', children, className = '' }) {
  const variants = {
    default:     'bg-gray-700 text-gray-300',
    // Task status
    PENDING:     'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    IN_PROGRESS: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    COMPLETED:   'bg-green-500/20 text-green-400 border border-green-500/30',
    // Priority
    LOW:         'bg-gray-500/20 text-gray-400 border border-gray-500/30',
    MEDIUM:      'bg-orange-500/20 text-orange-400 border border-orange-500/30',
    HIGH:        'bg-red-500/20 text-red-400 border border-red-500/30',
    // Project status
    ACTIVE:      'bg-green-500/20 text-green-400 border border-green-500/30',
    ON_HOLD:     'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    // Overdue
    overdue:     'bg-red-500/20 text-red-400 border border-red-500/30',
    // Role
    ADMIN:       'bg-purple-500/20 text-purple-400 border border-purple-500/30',
    MEMBER:      'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }) {
  const labels = { PENDING: 'Pending', IN_PROGRESS: 'In Progress', COMPLETED: 'Completed', ACTIVE: 'Active', ON_HOLD: 'On Hold' };
  return <Badge variant={status}>{labels[status] || status}</Badge>;
}

export function PriorityBadge({ priority }) {
  const icons = { LOW: '↓', MEDIUM: '→', HIGH: '↑' };
  return <Badge variant={priority}>{icons[priority]} {priority}</Badge>;
}
