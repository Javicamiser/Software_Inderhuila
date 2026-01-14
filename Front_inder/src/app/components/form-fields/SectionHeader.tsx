/**
 * Section Header para separar secciones en formularios largos
 */

import React from 'react';

export interface SectionHeaderProps {
  title: string;
  icon?: React.ReactNode;
  description?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  icon,
  description,
}) => {
  return (
    <div className="space-y-2 pb-4 border-b-2 border-blue-500">
      <div className="flex items-center gap-2">
        {icon && <div className="text-blue-600">{icon}</div>}
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>
      {description && <p className="text-sm text-gray-600">{description}</p>}
    </div>
  );
};
