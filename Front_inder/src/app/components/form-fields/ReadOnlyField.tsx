/**
 * Read-Only Field para mostrar datos calculados
 */

import React from 'react';

import { FormFieldWrapper } from './FormFieldWrapper';

export interface ReadOnlyFieldProps {
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
