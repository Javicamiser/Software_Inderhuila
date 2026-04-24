// ============================================================
// INPUT - Componente base reutilizable
// ============================================================
import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, required, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-[13px] font-medium text-[var(--color-text-secondary)]">
            {label}
            {required && <span className="text-[var(--color-danger)] ml-0.5">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          required={required}
          className={`
            h-9 px-3 text-[14px] bg-white border rounded-[var(--radius-md)]
            text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]
            transition-colors duration-150 outline-none
            focus:border-[var(--color-border-focus)] focus:ring-2 focus:ring-[var(--color-primary-light)]
            disabled:bg-[var(--color-surface-secondary)] disabled:cursor-not-allowed
            ${error ? 'border-[var(--color-danger)]' : 'border-[var(--color-border)]'}
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-[12px] text-[var(--color-danger)]">{error}</p>}
        {helperText && !error && <p className="text-[12px] text-[var(--color-text-muted)]">{helperText}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export default Input;