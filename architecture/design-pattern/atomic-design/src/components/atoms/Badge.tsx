import type { ReactNode } from 'react';

type BadgeVariant = 'primary' | 'muted';

type BadgeProps = {
  variant?: BadgeVariant;
  children: ReactNode;
};

// Atom: 작고 의미 있는 시각적 토큰
export function Badge({ variant = 'primary', children }: BadgeProps) {
  const classes = [
    'badge',
    variant === 'primary' && 'badge--primary',
    variant === 'muted' && 'badge--muted'
  ]
    .filter(Boolean)
    .join(' ');

  return <span className={classes}>{children}</span>;
}

