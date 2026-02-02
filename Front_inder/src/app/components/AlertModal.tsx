import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, XCircle, Info } from 'lucide-react';

type AlertType = 'error' | 'success' | 'warning' | 'info';

interface AlertModalProps {
  type: AlertType;
  title: string;
  message: string;
  isOpen: boolean;
  onClose: () => void;
  duration?: number; // Auto-close después de ms (0 = manual)
  showIcon?: boolean;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
  }>;
}

const alertConfig = {
  error: {
    icon: XCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    titleColor: 'text-red-900',
    messageColor: 'text-red-800',
    buttonColor: 'bg-red-600 hover:bg-red-700',
    accentColor: 'text-red-600',
  },
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    titleColor: 'text-green-900',
    messageColor: 'text-green-800',
    buttonColor: 'bg-green-600 hover:bg-green-700',
    accentColor: 'text-green-600',
  },
  warning: {
    icon: AlertCircle,
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    titleColor: 'text-amber-900',
    messageColor: 'text-amber-800',
    buttonColor: 'bg-amber-600 hover:bg-amber-700',
    accentColor: 'text-amber-600',
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    titleColor: 'text-blue-900',
    messageColor: 'text-blue-800',
    buttonColor: 'bg-blue-600 hover:bg-blue-700',
    accentColor: 'text-blue-600',
  },
};

export const AlertModal: React.FC<AlertModalProps> = ({
  type,
  title,
  message,
  isOpen,
  onClose,
  duration = 0,
  showIcon = true,
  actions,
}) => {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  const config = alertConfig[type];
  const IconComponent = config.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`relative ${config.bgColor} border ${config.borderColor} rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-300`}>
        {/* Decorative top bar */}
        <div className={`h-1 bg-gradient-to-r ${
          type === 'error' ? 'from-red-500 to-red-600' :
          type === 'success' ? 'from-green-500 to-green-600' :
          type === 'warning' ? 'from-amber-500 to-amber-600' :
          'from-blue-500 to-blue-600'
        }`} />

        {/* Content */}
        <div className="p-8">
          {/* Icon + Title */}
          <div className="flex items-start gap-4 mb-4">
            {showIcon && (
              <div className={`flex-shrink-0 ${config.accentColor}`}>
                <IconComponent className="w-6 h-6 mt-0.5" />
              </div>
            )}
            <div className="flex-1">
              <h3 className={`text-lg font-bold ${config.titleColor} leading-tight`}>
                {title}
              </h3>
            </div>
          </div>

          {/* Message */}
          <p className={`${config.messageColor} text-sm leading-relaxed ml-10`}>
            {message}
          </p>

          {/* Actions */}
          <div className={`flex gap-3 mt-8 ${actions && actions.length > 1 ? 'flex-row' : 'flex-col'}`}>
            {actions && actions.length > 0 ? (
              <>
                {actions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      action.onClick();
                      onClose();
                    }}
                    className={`
                      px-4 py-2.5 rounded-lg font-medium text-sm transition-all
                      ${action.variant === 'danger'
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : action.variant === 'secondary'
                        ? 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                        : `${config.buttonColor} text-white`
                      }
                    `}
                  >
                    {action.label}
                  </button>
                ))}
              </>
            ) : (
              <button
                onClick={onClose}
                className={`${config.buttonColor} text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-all`}
              >
                Entendido
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook para usar alertas fácilmente
export const useAlert = () => {
  const [alertState, setAlertState] = React.useState<{
    type: AlertType;
    title: string;
    message: string;
    isOpen: boolean;
    duration?: number;
    actions?: Array<{
      label: string;
      onClick: () => void;
      variant?: 'primary' | 'secondary' | 'danger';
    }>;
  }>({
    type: 'info',
    title: '',
    message: '',
    isOpen: false,
  });

  const showAlert = (
    type: AlertType,
    title: string,
    message: string,
    options?: {
      duration?: number;
      actions?: Array<{
        label: string;
        onClick: () => void;
        variant?: 'primary' | 'secondary' | 'danger';
      }>;
    }
  ) => {
    setAlertState({
      type,
      title,
      message,
      isOpen: true,
      duration: options?.duration,
      actions: options?.actions,
    });
  };

  const closeAlert = () => {
    setAlertState((prev) => ({ ...prev, isOpen: false }));
  };

  return {
    AlertModal: (
      <AlertModal
        type={alertState.type}
        title={alertState.title}
        message={alertState.message}
        isOpen={alertState.isOpen}
        onClose={closeAlert}
        duration={alertState.duration}
        actions={alertState.actions}
      />
    ),
    showAlert,
    closeAlert,
  };
};

export default AlertModal;