import React from 'react';

interface WidgetProps {
  title: string;
  count?: number;
  children: React.ReactNode;
  className?: string;
}

const Widget: React.FC<WidgetProps> = ({ title, count, children, className = '' }) => {
  return (
    <div className={`bg-base-100 dark:bg-dark-base-200 rounded-xl shadow-md p-4 md:p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-base-content dark:text-dark-base-content">{title}</h2>
        {count !== undefined && (
          <span className="text-sm font-semibold bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20 dark:text-dark-base-content px-2.5 py-1 rounded-full">{count}</span>
        )}
      </div>
      <div className="max-h-64 overflow-y-auto pr-2">
        {children}
      </div>
    </div>
  );
};

export default Widget;