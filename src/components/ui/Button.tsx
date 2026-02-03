import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}: ButtonProps) => {
  const baseStyles = "font-serif font-semibold transition-all duration-300 ease-out active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";
  
  const variants = {
    primary: "bg-[var(--primary)] text-white border-2 border-[var(--primary)] hover:bg-[var(--primary-dark)] hover:border-[var(--primary-dark)] shadow-md hover:shadow-lg hover:-translate-y-0.5",
    secondary: "bg-[var(--secondary)] text-white border-2 border-[var(--secondary)] hover:bg-[#234a4a] hover:border-[#234a4a] shadow-md hover:shadow-lg hover:-translate-y-0.5",
    outline: "bg-transparent text-[var(--primary)] border-2 border-[var(--primary)] hover:bg-[var(--primary)]/5 hover:border-[var(--primary)]",
    ghost: "bg-transparent text-[var(--foreground)] hover:bg-[var(--primary)]/5 hover:text-[var(--primary)]",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm rounded-lg",
    md: "px-6 py-3 text-base rounded-xl",
    lg: "px-8 py-4 text-lg rounded-xl",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
