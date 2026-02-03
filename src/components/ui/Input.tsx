import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = ({ label, error, className = '', ...props }: InputProps) => {
  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="block text-sm font-serif font-medium text-[var(--foreground)] opacity-80">
          {label}
        </label>
      )}
      <input
        className={`w-full bg-transparent border-b-2 border-[var(--card-border)] px-2 py-3 text-[var(--foreground)] placeholder:text-[var(--foreground)]/40 focus:outline-none focus:border-[var(--primary)] transition-colors font-sans ${className} ${error ? 'border-[var(--error)]' : ''}`}
        {...props}
      />
      {error && (
        <p className="text-sm text-[var(--error)] mt-1">{error}</p>
      )}
    </div>
  );
};
