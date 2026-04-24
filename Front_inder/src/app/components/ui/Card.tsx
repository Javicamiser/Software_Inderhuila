// ============================================================
// CARD - Contenedor de superficie
// ============================================================
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg' | 'none';
}

const paddingMap = { none: '', sm: 'p-3', md: 'p-5', lg: 'p-6' };

export function Card({ children, className = '', padding = 'md' }: CardProps) {
  return (
    <div className={`
      bg-[var(--color-surface)] border border-[var(--color-border)]
      rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)]
      ${paddingMap[padding]} ${className}
    `}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children }: { children: ReactNode }) {
  return <h3 className="text-[15px] font-medium text-[var(--color-text-primary)]">{children}</h3>;
}

export default Card;