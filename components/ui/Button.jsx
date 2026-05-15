'use client';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  onClick,
  ...props
}) {
  const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500';

  const variants = {
    primary:   'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm hover:shadow-indigo-500/25',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600',
    danger:    'bg-red-600 hover:bg-red-500 text-white shadow-sm',
    ghost:     'hover:bg-gray-800 text-gray-400 hover:text-gray-200',
    success:   'bg-green-600 hover:bg-green-500 text-white shadow-sm',
    outline:   'border border-indigo-500 text-indigo-400 hover:bg-indigo-500/10',
  };

  const sizes = {
    sm:  'px-3 py-1.5 text-sm gap-1.5',
    md:  'px-4 py-2 text-sm gap-2',
    lg:  'px-6 py-3 text-base gap-2',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
