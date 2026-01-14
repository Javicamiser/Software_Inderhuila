import React from 'react';

interface FormGridProps {
  columns?: 1 | 2 | 3 | 4;
  children: React.ReactNode;
  gap?: 'sm' | 'md' | 'lg';
}

export const FormGrid: React.FC<FormGridProps> = ({
  columns = 2,
  children,
  gap = 'md',
}) => {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-4',
  };

  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  };

  return (
    <div className={`grid ${gridClasses[columns]} ${gapClasses[gap]}`}>
      {children}
    </div>
  );
};

export default FormGrid;