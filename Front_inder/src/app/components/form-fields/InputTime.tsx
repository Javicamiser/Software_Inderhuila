import React from 'react';
import { Clock } from 'lucide-react';

interface InputTimeProps {
  label?: string;
  value: string;
  onChange: (value: string) => void; // ← Recibe STRING
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  min?: string;
  max?: string;
}

export function InputTime({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  disabled = false,
  min,
  max,
}: InputTimeProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          type="time"
          value={value}
          onChange={(e) => onChange(e.target.value)} 
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          min={min}
          max={max}
          className={`
            w-full pl-10 pr-4 py-2 border rounded-lg
            focus:ring-2 focus:ring-blue-500 focus:border-transparent
            disabled:bg-gray-100 disabled:cursor-not-allowed
            transition
            ${
              error
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300'
            }
          `}
        />
        <Clock className="w-5 h-5 text-gray-400 absolute left-3 top-3 pointer-events-none" />
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}

export default InputTime;