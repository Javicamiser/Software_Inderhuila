import React from 'react';
import { FieldError } from 'react-hook-form';
import { AlertCircle } from 'lucide-react';

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

export default FormFieldWrapper;
