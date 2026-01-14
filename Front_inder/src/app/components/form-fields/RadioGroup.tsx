/**
 * Radio Group reutilizable
 */

import React from 'react';
import { FieldError, UseFormRegisterReturn } from 'react-hook-form';

import { FormFieldWrapper } from './FormFieldWrapper';

export interface RadioOption {
  value: string;
  label: string;
}

export interface RadioGroupProps {
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
