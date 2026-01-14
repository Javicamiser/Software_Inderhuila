import React from 'react';
import { AlertCircle } from 'lucide-react';

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

export default FormAlert;