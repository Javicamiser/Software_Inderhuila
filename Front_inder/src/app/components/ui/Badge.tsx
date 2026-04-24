// ============================================================
// BADGE - Etiqueta de estado
// ============================================================
import type { ReactNode } from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary';

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)]',
  success: 'bg-[var(--color-success-light)] text-green-800',
  warning: 'bg-[var(--color-warning-light)] text-amber-800',
  danger:  'bg-[var(--color-danger-light)] text-red-800',
  info:    'bg-[var(--color-info-light)] text-blue-800',
  primary: 'bg-[var(--color-primary-light)] text-[var(--color-primary-dark)]',
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span className={`
      inline-flex items-center px-2 py-0.5
      text-[11px] font-medium rounded-[var(--radius-full)]
      ${variantStyles[variant]} ${className}
    `}>
      {children}
    </span>
  );
}

export default Badge;