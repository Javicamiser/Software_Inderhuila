import React from 'react';
import { ChevronDown } from 'lucide-react';
import { CatalogoItem } from '../../services/apiClient';

interface SelectCatalogoProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: CatalogoItem[];
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}

export function SelectCatalogo({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Selecciona una opción',
  required = false,
  error,
  disabled = false,
}: SelectCatalogoProps) {
  // Validar que options sea un array
  const safeOptions = Array.isArray(options) ? options : [];

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          disabled={disabled}
          className={`
            w-full px-4 py-2.5 border rounded-lg appearance-none
            focus:outline-none focus:ring-2 focus:ring-blue-500
            disabled:bg-gray-100 disabled:cursor-not-allowed
            transition-colors
            ${error ? 'border-red-500' : 'border-gray-300'}
            ${disabled ? 'bg-gray-100' : 'bg-white'}
          `}
        >
          <option value="">{placeholder}</option>
          {safeOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.nombre}
            </option>
          ))}
        </select>

        <ChevronDown className="w-5 h-5 text-gray-400 absolute right-3 top-3 pointer-events-none" />
      </div>

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}

export default SelectCatalogo;