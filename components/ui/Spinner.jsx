'use client';

export function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' };
  return (
    <svg
      className={`animate-spin text-indigo-500 ${sizes[size]} ${className}`}
      fill="none" viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <Spinner size="lg" className="mx-auto mb-3" />
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    </div>
  );
}

export function EmptyState({ icon = '📭', title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-300 mb-2">{title}</h3>
      {description && <p className="text-sm text-gray-500 mb-6 max-w-sm">{description}</p>}
      {action}
    </div>
  );
}

export function AlertMessage({ type = 'error', message }) {
  if (!message) return null;
  const styles = {
    error:   'bg-red-500/10 border-red-500/30 text-red-400',
    success: 'bg-green-500/10 border-green-500/30 text-green-400',
    warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
    info:    'bg-blue-500/10 border-blue-500/30 text-blue-400',
  };
  const icons = { error: '✕', success: '✓', warning: '⚠', info: 'ℹ' };
  return (
    <div className={`flex items-start gap-2.5 p-3.5 rounded-lg border text-sm ${styles[type]}`}>
      <span className="font-bold mt-0.5">{icons[type]}</span>
      <span>{message}</span>
    </div>
  );
}
