/**
 * Input de texto reutilizable
 */



interface InputTextProps {
  label?: string;
  value: string;
  onChange: (value: string) => void; // ← Recibe STRING, no evento
  placeholder?: string;
  type?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}

export function InputText({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
  error,
  disabled = false,
}: InputTextProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`
          w-full px-4 py-2 border rounded-lg 
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

      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}

export default InputText;
