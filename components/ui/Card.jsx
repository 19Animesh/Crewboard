'use client';

export function Card({ children, className = '', hover = false }) {
  return (
    <div className={`bg-gray-900 border border-gray-800 rounded-xl ${hover ? 'hover:border-gray-700 hover:shadow-lg hover:shadow-black/20 cursor-pointer' : ''} ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return <div className={`px-6 py-4 border-b border-gray-800 ${className}`}>{children}</div>;
}

export function CardBody({ children, className = '' }) {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }) {
  return <div className={`px-6 py-4 border-t border-gray-800 ${className}`}>{children}</div>;
}

// Stat card for dashboard
export function StatCard({ icon, label, value, color = 'indigo', sub }) {
  const colors = {
    indigo:  'from-indigo-600/20 to-indigo-600/5 border-indigo-500/30 text-indigo-400',
    blue:    'from-blue-600/20 to-blue-600/5 border-blue-500/30 text-blue-400',
    green:   'from-green-600/20 to-green-600/5 border-green-500/30 text-green-400',
    yellow:  'from-yellow-600/20 to-yellow-600/5 border-yellow-500/30 text-yellow-400',
    red:     'from-red-600/20 to-red-600/5 border-red-500/30 text-red-400',
    purple:  'from-purple-600/20 to-purple-600/5 border-purple-500/30 text-purple-400',
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-xl p-5 animate-fade-in`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">{label}</p>
          <p className="text-3xl font-bold text-white">{value ?? '—'}</p>
          {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
        </div>
        <div className="text-2xl">{icon}</div>
      </div>
    </div>
  );
}
