import React from 'react';
import InfoField from './InfoField';

interface DataGridField {
  key: string;
  label: string;
  value?: string | React.ReactNode;
  icon?: React.ReactNode;
  copyable?: boolean;
  href?: string;
  fullWidth?: boolean;
  placeholder?: string;
}

interface DataGridProps {
  fields: DataGridField[];
  columns?: 1 | 2 | 3 | 4;
  className?: string;
  variant?: 'default' | 'compact' | 'inline';
}

const DataGrid: React.FC<DataGridProps> = ({
  fields,
  columns = 3,
  className = '',
  variant = 'default'
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-6 ${className}`}>
      {fields.map((field) => (
        <InfoField
          key={field.key}
          label={field.label}
          value={field.value}
          icon={field.icon}
          variant={variant}
          copyable={field.copyable}
          href={field.href}
          placeholder={field.placeholder}
          fullWidth={field.fullWidth}
        />
      ))}
    </div>
  );
};

export default DataGrid; 