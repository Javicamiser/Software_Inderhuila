/**
 * Form Section - container para secciones
 */

import React from 'react';

export interface FormSectionProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

/**
 * Sección de un formulario
 * Agrupa campos relacionados con título y descripción opcional
 */
export const FormSection: React.FC<FormSectionProps> = ({
  children,
  title,
  description,
  className = '',
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {title && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  );
};

export default FormSection;
