'use client';

import { Users } from 'lucide-react';

interface MembersListProps {
  members: string[];
  variant?: 'inline' | 'list' | 'badge';
  className?: string;
}

export function MembersList({ members, variant = 'inline', className = '' }: MembersListProps) {
  if (!members || members.length === 0) return null;

  if (variant === 'badge') {
    return (
      <span className={`text-xs opacity-70 ${className}`}>
        ({members.join(', ')})
      </span>
    );
  }

  if (variant === 'list') {
    return (
      <div className={`space-y-1 ${className}`}>
        {members.map((member, i) => (
          <div key={i} className="flex items-center gap-2 text-sm text-[var(--foreground)]/70">
            <Users size={12} className="text-[var(--secondary)] shrink-0" />
            <span className="font-serif">{member}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <p className={`text-sm font-serif italic text-[var(--foreground)]/60 ${className}`}>
      {members.join(', ')}
    </p>
  );
}
