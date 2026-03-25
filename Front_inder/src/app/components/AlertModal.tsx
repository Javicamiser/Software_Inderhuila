import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle, XCircle, Info } from 'lucide-react';

type AlertType = 'error' | 'success' | 'warning' | 'info';

interface AlertModalProps {
  type: AlertType;
  title: string;
  message: string;
  isOpen: boolean;
  onClose: () => void;
  duration?: number;
  showIcon?: boolean;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
  }>;
}

var alertConfig = {
  error: {
    icon: XCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    titleColor: 'text-red-900',
    messageColor: 'text-red-800',
    buttonColor: 'bg-red-600 hover:bg-red-700',
    accentColor: 'text-red-600',
    gradientBar: 'from-red-500 to-red-600',
  },
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    titleColor: 'text-green-900',
    messageColor: 'text-green-800',
    buttonColor: 'bg-green-600 hover:bg-green-700',
    accentColor: 'text-green-600',
    gradientBar: 'from-green-500 to-green-600',
  },
  warning: {
    icon: AlertCircle,
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    titleColor: 'text-amber-900',
    messageColor: 'text-amber-800',
    buttonColor: 'bg-amber-600 hover:bg-amber-700',
    accentColor: 'text-amber-600',
    gradientBar: 'from-amber-500 to-amber-600',
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    titleColor: 'text-blue-900',
    messageColor: 'text-blue-800',
    buttonColor: 'bg-blue-600 hover:bg-blue-700',
    accentColor: 'text-blue-600',
    gradientBar: 'from-blue-500 to-blue-600',
  },
};

function getButtonClass(variant: string | undefined, configButtonColor: string): string {
  if (variant === 'danger') {
    return 'px-4 py-2.5 rounded-lg font-medium text-sm transition-all bg-red-600 hover:bg-red-700 text-white';
  }
  if (variant === 'secondary') {
    return 'px-4 py-2.5 rounded-lg font-medium text-sm transition-all bg-gray-200 hover:bg-gray-300 text-gray-800';
  }
  return 'px-4 py-2.5 rounded-lg font-medium text-sm transition-all ' + configButtonColor + ' text-white';
}

export var AlertModal: React.FC<AlertModalProps> = function AlertModalComponent({
  type,
  title,
  message,
  isOpen,
  onClose,
  duration,
  showIcon,
  actions,
}) {
  var safeDuration = duration || 0;
  var safeShowIcon = showIcon !== false;

  useEffect(() => {
    if (isOpen && safeDuration > 0) {
      var timer = setTimeout(onClose, safeDuration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, safeDuration, onClose]);

  if (!isOpen) return null;

  var config = alertConfig[type];
  var IconComponent = config.icon;

  var modalClasses = 'relative ' + config.bgColor + ' border ' + config.borderColor + ' rounded-xl shadow-2xl max-w-md w-full overflow-hidden';
  var barClasses = 'h-1 bg-gradient-to-r ' + config.gradientBar;
  var titleClasses = 'text-lg font-bold ' + config.titleColor + ' leading-tight';
  var messageClasses = config.messageColor + ' text-sm leading-relaxed ml-10';
  var defaultBtnClasses = config.buttonColor + ' text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-all';
  var actionsWrapperClasses = 'flex gap-3 mt-8';
  if (actions && actions.length > 1) {
    actionsWrapperClasses = actionsWrapperClasses + ' flex-row';
  } else {
    actionsWrapperClasses = actionsWrapperClasses + ' flex-col';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className={modalClasses}>
        <div className={barClasses} />

        <div className="p-8">
          <div className="flex items-start gap-4 mb-4">
            {safeShowIcon && (
              <div className={'flex-shrink-0 ' + config.accentColor}>
                <IconComponent className="w-6 h-6 mt-0.5" />
              </div>
            )}
            <div className="flex-1">
              <h3 className={titleClasses}>
                {title}
              </h3>
            </div>
          </div>

          <p className={messageClasses}>
            {message}
          </p>

          <div className={actionsWrapperClasses}>
            {actions && actions.length > 0 ? (
              <React.Fragment>
                {actions.map(function(action, idx) {
                  return (
                    <button
                      key={idx}
                      onClick={function() {
                        action.onClick();
                        onClose();
                      }}
                      className={getButtonClass(action.variant, config.buttonColor)}
                    >
                      {action.label}
                    </button>
                  );
                })}
              </React.Fragment>
            ) : (
              <button
                onClick={onClose}
                className={defaultBtnClasses}
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

export function useAlert() {
  var initialState = {
    type: 'info' as AlertType,
    title: '',
    message: '',
    isOpen: false,
    duration: undefined as number | undefined,
    actions: undefined as Array<{
      label: string;
      onClick: () => void;
      variant?: 'primary' | 'secondary' | 'danger';
    }> | undefined,
  };

  var stateRef = React.useState(initialState);
  var alertState = stateRef[0];
  var setAlertState = stateRef[1];

  function showAlert(
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
  ) {
    setAlertState({
      type: type,
      title: title,
      message: message,
      isOpen: true,
      duration: options ? options.duration : undefined,
      actions: options ? options.actions : undefined,
    });
  }

  function closeAlert() {
    setAlertState(function(prev) {
      return {
        type: prev.type,
        title: prev.title,
        message: prev.message,
        isOpen: false,
        duration: prev.duration,
        actions: prev.actions,
      };
    });
  }

  var AlertModalElement = React.createElement(AlertModal, {
    type: alertState.type,
    title: alertState.title,
    message: alertState.message,
    isOpen: alertState.isOpen,
    onClose: closeAlert,
    duration: alertState.duration,
    actions: alertState.actions,
  });

  return {
    AlertModal: AlertModalElement,
    showAlert: showAlert,
    closeAlert: closeAlert,
  };
}

export default AlertModal;