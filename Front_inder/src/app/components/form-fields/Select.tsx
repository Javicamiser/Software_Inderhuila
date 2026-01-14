/**
 * Select reutilizable
 */

import React from 'react';
import { FieldError, UseFormRegisterReturn } from 'react-hook-form';
import { AlertCircle } from 'lucide-react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  registration?: UseFormRegisterReturn;
  error?: FieldError | string;  // Cambiar aquí
  disabled?: boolean;
  placeholder?: string;
  children?: React.ReactNode;
  helperText?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  required,
  options,
  registration,
  error,
  disabled = false,
  placeholder = 'Seleccione...',
  children,
  helperText,
  className,
  ...selectProps
}) => {
  const errorMessage = typeof error === 'string' ? error : error?.message;
  
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <select
        {...registration}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
          disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'bg-white'
        } ${error ? 'border-red-500' : 'border-gray-300'} ${className || ''}`}
        {...selectProps}
      >
        {/* Si hay children (para pasar <option> directamente) */}
        {children ? (
          children
        ) : (
          <>
            {/* Si no hay children, usar options array */}
            <option value="">{placeholder}</option>
            {options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </>
        )}
      </select>

      {errorMessage && (
        <div className="flex items-center gap-2 text-red-500 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMessage}</span>
        </div>
      )}

      {helperText && !error && (
        <p className="text-gray-500 text-sm">{helperText}</p>
      )}
    </div>
  );
};

export default Select;
