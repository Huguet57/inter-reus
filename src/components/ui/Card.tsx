import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'ornate';
  onClick?: (e: React.MouseEvent) => void;
}

export const Card = ({ children, className = '', variant = 'default', onClick }: CardProps) => {
  const baseStyles = "bg-[var(--card-bg)] text-[var(--foreground)] overflow-hidden";
  
  const variants = {
    default: "rounded-xl border border-[var(--card-border)] shadow-sm",
    ornate: "rounded-sm border-4 border-double border-[var(--card-border)] shadow-md relative", // Double border for plaque look
  };

  return (
    <div className={`${baseStyles} ${variants[variant]} ${className}`} onClick={onClick}>
      {variant === 'ornate' && (
        <>
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[var(--accent)] z-10"></div>
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[var(--accent)] z-10"></div>
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[var(--accent)] z-10"></div>
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[var(--accent)] z-10"></div>
        </>
      )}
      
      <div className={variant === 'ornate' ? 'p-6 border border-[var(--card-border)]/20 h-full' : 'p-6'}>
        {children}
      </div>
    </div>
  );
};
