'use client';

export function Input({ label, error, id, className = '', required, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-300">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      <input
        id={id}
        className={`
          w-full bg-gray-800 border rounded-lg px-3.5 py-2.5 text-sm text-gray-100 placeholder-gray-500
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 hover:border-gray-600'}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-xs text-red-400 mt-0.5">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, id, className = '', required, rows = 3, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-300">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      <textarea
        id={id}
        rows={rows}
        className={`
          w-full bg-gray-800 border rounded-lg px-3.5 py-2.5 text-sm text-gray-100 placeholder-gray-500 resize-none
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
          ${error ? 'border-red-500' : 'border-gray-700 hover:border-gray-600'}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-xs text-red-400 mt-0.5">{error}</p>}
    </div>
  );
}

export function Select({ label, error, id, className = '', required, children, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-300">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      <select
        id={id}
        className={`
          w-full bg-gray-800 border rounded-lg px-3.5 py-2.5 text-sm text-gray-100
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
          ${error ? 'border-red-500' : 'border-gray-700 hover:border-gray-600'}
          ${className}
        `}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-400 mt-0.5">{error}</p>}
    </div>
  );
}
