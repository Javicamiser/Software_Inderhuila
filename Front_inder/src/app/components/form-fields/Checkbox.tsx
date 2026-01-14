/**
 * Checkbox reutilizable
 */

import React from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
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
