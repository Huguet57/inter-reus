'use client';

import { getBadgeIcon } from '@/lib/badge-icons';

interface BadgeDisplayProps {
  badgeIcon: string | null | undefined;
  badgeImageUrl: string | null | undefined;
  size?: number;
  className?: string;
}

export function BadgeDisplay({ badgeIcon, badgeImageUrl, size = 20, className = '' }: BadgeDisplayProps) {
  if (badgeImageUrl) {
    return (
      <img
        src={badgeImageUrl}
        alt="Badge"
        width={size}
        height={size}
        className={`badge-display-image object-contain ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  const BadgeIcon = getBadgeIcon(badgeIcon);
  return <BadgeIcon size={size} className={className} />;
}
