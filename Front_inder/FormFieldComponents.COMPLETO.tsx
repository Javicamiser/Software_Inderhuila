/**
 * Componentes reutilizables para formularios médicos
 * Estos componentes encapsulan la lógica de validación y UI repetida
 * Diseño: Adaptado de Figma, implementación: React Puro
 */

import React from 'react';
import { FieldError, UseFormRegisterReturn } from 'react-hook-form';
import { AlertCircle } from 'lucide-react';

// ============================================================================
// 1. COMPONENTES BASE DE FORMULARIO
// ============================================================================

interface FormFieldWrapperProps {
  label: string;
  required?: boolean;
  error?: FieldError;
  helperText?: string;
  children: React.ReactNode;
}

/**
 * Wrapper para campos de formulario
 * Centraliza: label, error message, helper text
 */
export const FormFieldWrapper: React.FC<FormFieldWrapperProps> = ({
  label,
  required,
  error,
  helperText,
  children,
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-900">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error.message}</span>
        </div>
      )}
      {helperText && !error && (
        <p className="text-gray-500 text-sm">{helperText}</p>
      )}
    </div>
  );
};

// ============================================================================
// 2. INPUT TEXT
// ============================================================================

interface InputTextProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
  error?: FieldError;
  helperText?: string;
  registration?: UseFormRegisterReturn;
}

export const InputText: React.FC<InputTextProps> = ({
  label,
  required,
  error,
  helperText,
  registration,
  className,
  ...inputProps
}) => {
  const baseClasses = `
    w-full px-4 py-2 border rounded-lg
    focus:outline-none focus:ring-2 focus:ring-offset-1
    transition-colors duration-200
    ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}
  `;

  return (
    <FormFieldWrapper label={label} required={required} error={error} helperText={helperText}>
      <input
        className={`${baseClasses} ${className || ''}`}
        {...inputProps}
        {...registration}
      />
    </FormFieldWrapper>
  );
};

// Alias para compatibilidad con código existente
export const InputField = InputText;

// ============================================================================
// 3. INPUT FECHA
// ============================================================================

interface InputDateProps {
  label: string;
  required?: boolean;
  error?: FieldError;
  registration?: UseFormRegisterReturn;
  maxDate?: Date;
  minDate?: Date;
}

export const InputDate: React.FC<InputDateProps> = ({
  label,
  required,
  error,
  registration,
  maxDate,
  minDate,
}) => {
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  return (
    <FormFieldWrapper label={label} required={required} error={error}>
      <input
        type="date"
        className={`
          w-full px-4 py-2 border rounded-lg
          focus:outline-none focus:ring-2 focus:ring-offset-1
          transition-colors duration-200
          ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}
        `}
        max={maxDate ? formatDate(maxDate) : undefined}
        min={minDate ? formatDate(minDate) : undefined}
        {...registration}
      />
    </FormFieldWrapper>
  );
};

// ============================================================================
// 4. SELECT / DROPDOWN
// ============================================================================

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label: string;
  required?: boolean;
  error?: FieldError;
  options?: SelectOption[];
  placeholder?: string;
  registration?: UseFormRegisterReturn;
  children?: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({
  label,
  required,
  error,
  options,
  placeholder = 'Seleccione...',
  registration,
  children,
}) => {
  return (
    <FormFieldWrapper label={label} required={required} error={error}>
      <select
        className={`
          w-full px-4 py-2 border rounded-lg
          focus:outline-none focus:ring-2 focus:ring-offset-1
          transition-colors duration-200
          ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}
          bg-white cursor-pointer
        `}
        {...registration}
      >
        <option value="">{placeholder}</option>
        {children || (options && options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        )))}
      </select>
    </FormFieldWrapper>
  );
};

// Alias para compatibilidad
export const SelectField = Select;

// ============================================================================
// 5. TEXTAREA / ÁREA DE TEXTO
// ============================================================================

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  required?: boolean;
  error?: FieldError;
  helperText?: string;
  registration?: UseFormRegisterReturn;
  rows?: number;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  required,
  error,
  helperText,
  registration,
  rows = 4,
  className,
  ...textareaProps
}) => {
  return (
    <FormFieldWrapper label={label} required={required} error={error} helperText={helperText}>
      <textarea
        rows={rows}
        className={`
          w-full px-4 py-2 border rounded-lg
          focus:outline-none focus:ring-2 focus:ring-offset-1
          transition-colors duration-200
          resize-vertical
          ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}
          ${className || ''}
        `}
        {...textareaProps}
        {...registration}
      />
    </FormFieldWrapper>
  );
};

// Alias para compatibilidad
export const TextAreaField = TextArea;

// ============================================================================
// 6. CHECKBOX
// ============================================================================

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  registration?: UseFormRegisterReturn;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  registration,
  ...props
}) => {
  return (
    <div className="flex items-center gap-3">
      <input
        type="checkbox"
        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
        {...props}
        {...registration}
      />
      <label className="text-sm font-medium text-gray-900 cursor-pointer">
        {label}
      </label>
    </div>
  );
};

// Alias para compatibilidad
export const CheckboxField = Checkbox;

// ============================================================================
// 7. RADIO GROUP / BOTONES DE RADIO
// ============================================================================

interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupProps {
  label: string;
  required?: boolean;
  options: RadioOption[];
  error?: FieldError;
  registration?: UseFormRegisterReturn;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  required,
  options,
  error,
  registration,
}) => {
  return (
    <FormFieldWrapper label={label} required={required} error={error}>
      <div className="space-y-3">
        {options.map((option) => (
          <div key={option.value} className="flex items-center gap-3">
            <input
              type="radio"
              value={option.value}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
              {...registration}
            />
            <label className="text-sm font-medium text-gray-900 cursor-pointer">
              {option.label}
            </label>
          </div>
        ))}
      </div>
    </FormFieldWrapper>
  );
};

// ============================================================================
// 8. READ-ONLY FIELD (para mostrar datos calculados)
// ============================================================================

interface ReadOnlyFieldProps {
  label: string;
  value: string | number | null;
  suffix?: string;
}

export const ReadOnlyField: React.FC<ReadOnlyFieldProps> = ({
  label,
  value,
  suffix,
}) => {
  return (
    <FormFieldWrapper label={label}>
      <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600">
        {value !== null ? `${value}${suffix ? ` ${suffix}` : ''}` : '-'}
      </div>
    </FormFieldWrapper>
  );
};

// ============================================================================
// 9. BUTTON / BOTÓN
// ============================================================================

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading,
  children,
  disabled,
  className,
  ...props
}) => {
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        rounded-lg font-medium
        focus:outline-none focus:ring-2 focus:ring-offset-1
        transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className || ''}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="animate-spin">⏳</span>
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
};

// Alias para compatibilidad
export const FormButton = Button;

// ============================================================================
// 10. SECTION HEADER / ENCABEZADO DE SECCIÓN
// ============================================================================

interface SectionHeaderProps {
  title: string;
  icon?: React.ReactNode;
  description?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  icon,
  description,
}) => {
  return (
    <div className="space-y-2 pb-4 border-b-2 border-blue-500">
      <div className="flex items-center gap-2">
        {icon && <div className="text-blue-600">{icon}</div>}
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>
      {description && <p className="text-sm text-gray-600">{description}</p>}
    </div>
  );
};

// ============================================================================
// 11. FORM SECTION / CONTENEDOR DE SECCIÓN
// ============================================================================

interface FormSectionProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  collapsible?: boolean;
}

export const FormSection: React.FC<FormSectionProps> = ({
  children,
  className,
  title,
  description,
  collapsible = false,
}) => {
  const [isOpen, setIsOpen] = React.useState(true);

  return (
    <div className={`space-y-5 p-6 bg-white rounded-lg border border-gray-200 ${className || ''}`}>
      {title && (
        <div
          onClick={() => collapsible && setIsOpen(!isOpen)}
          className={collapsible ? 'cursor-pointer' : ''}
        >
          <SectionHeader title={title} description={description} />
          {collapsible && (
            <span className="text-sm text-gray-500">
              {isOpen ? '−' : '+'}
            </span>
          )}
        </div>
      )}
      {(!collapsible || isOpen) && children}
    </div>
  );
};

// ============================================================================
// 12. FORM GRID / CUADRÍCULA DE FORMULARIO
// ============================================================================

interface FormGridProps {
  columns?: 1 | 2 | 3 | 4;
  children: React.ReactNode;
  gap?: 'sm' | 'md' | 'lg';
}

export const FormGrid: React.FC<FormGridProps> = ({
  columns = 2,
  children,
  gap = 'md',
}) => {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-4',
  };

  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  };

  return (
    <div className={`grid ${gridClasses[columns]} ${gapClasses[gap]}`}>
      {children}
    </div>
  );
};

// ============================================================================
// 13. FORM ALERT / ALERTA
// ============================================================================

interface FormAlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  onClose?: () => void;
}

export const FormAlert: React.FC<FormAlertProps> = ({
  type,
  title,
  message,
  onClose,
}) => {
  const typeClasses = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: 'text-green-600',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: 'text-red-600',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: 'text-yellow-600',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: 'text-blue-600',
    },
  };

  const config = typeClasses[type];

  return (
    <div
      className={`
        p-4 ${config.bg} border border-solid ${config.border} rounded-lg
        flex items-start gap-3 mb-4
      `}
    >
      <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.icon}`} />
      <div className="flex-1">
        {title && <h3 className={`font-semibold ${config.text} mb-1`}>{title}</h3>}
        <p className={config.text}>{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={`flex-shrink-0 text-lg leading-none ${config.icon} hover:opacity-70`}
        >
          ×
        </button>
      )}
    </div>
  );
};

// ============================================================================
// EXPORT DEFAULT (para importar como: import * from '...')
// ============================================================================

export default {
  FormFieldWrapper,
  InputText,
  InputField,
  InputDate,
  Select,
  SelectField,
  TextArea,
  TextAreaField,
  Checkbox,
  CheckboxField,
  RadioGroup,
  ReadOnlyField,
  Button,
  FormButton,
  SectionHeader,
  FormSection,
  FormGrid,
  FormAlert,
};
