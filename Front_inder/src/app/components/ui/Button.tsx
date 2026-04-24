// ============================================================
// BUTTON - Componente base reutilizable
// Variantes: primary | secondary | danger | ghost
// ============================================================
import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:   'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] border-transparent',
  secondary: 'bg-white text-[var(--color-text-primary)] border-[var(--color-border)] hover:bg-[var(--color-surface-secondary)]',
  danger:    'bg-[var(--color-danger)] text-white hover:bg-red-600 border-transparent',
  ghost:     'bg-transparent text-[var(--color-text-secondary)] border-transparent hover:bg-[var(--color-surface-secondary)]',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px] gap-1.5',
  md: 'h-9 px-4 text-[14px] gap-2',
  lg: 'h-11 px-5 text-[15px] gap-2',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center font-medium border rounded-[var(--radius-md)]
        transition-colors duration-150 cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]} ${sizeClasses[size]} ${className}
      `}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}

export default Button;