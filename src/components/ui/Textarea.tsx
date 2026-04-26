import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export default function Textarea({ label, error, className = '', id, ...props }: TextareaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={`
          w-full px-4 py-2.5 rounded-xl border text-sm
          text-gray-900 dark:text-white bg-white dark:bg-gray-800
          placeholder:text-gray-400 dark:placeholder:text-gray-500 resize-none
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
          transition-all duration-200
          ${error ? 'border-red-400 dark:border-red-500' : 'border-gray-200 dark:border-gray-700'}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
