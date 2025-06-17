import React from 'react';

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
}

interface TabsContainerProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
  variant?: 'default' | 'pills' | 'underline';
  orientation?: 'horizontal' | 'vertical';
  responsive?: boolean;
}

const TabsContainer: React.FC<TabsContainerProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = '',
  variant = 'default',
  orientation = 'horizontal',
  responsive = true
}) => {
  const getTabButtonClasses = (tab: Tab) => {
    const baseClasses = 'font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900';
    const isActive = activeTab === tab.id;
    const isDisabled = tab.disabled;

    if (variant === 'pills') {
      return `${baseClasses} px-4 py-2 rounded-lg ${
        isActive 
          ? 'bg-blue-600 text-white' 
          : 'text-slate-400 hover:text-white hover:bg-slate-700'
      } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`;
    }

    if (variant === 'underline') {
      return `${baseClasses} px-4 py-3 border-b-2 ${
        isActive 
          ? 'border-blue-500 text-blue-400' 
          : 'border-transparent text-slate-400 hover:text-white hover:border-slate-600'
      } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`;
    }

    // Default variant
    return `${baseClasses} px-4 py-2 rounded-lg border ${
      isActive 
        ? 'bg-slate-700 border-slate-600 text-white' 
        : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800'
    } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`;
  };

  const getTabsContainerClasses = () => {
    const baseClasses = 'flex';
    
    if (orientation === 'vertical') {
      return `${baseClasses} flex-col space-y-1`;
    }

    // Horizontal orientation
    if (responsive) {
      return `${baseClasses} flex-col sm:flex-row gap-1 sm:gap-2`;
    }

    return `${baseClasses} flex-row gap-2`;
  };

  const getContentClasses = () => {
    if (orientation === 'vertical') {
      return 'flex-1 ml-4';
    }
    return 'mt-6';
  };

  const currentTab = tabs.find(tab => tab.id === activeTab);

  const tabsLayout = (
    <div className={getTabsContainerClasses()}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => !tab.disabled && onTabChange(tab.id)}
          className={getTabButtonClasses(tab)}
          disabled={tab.disabled}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );

  if (orientation === 'vertical') {
    return (
      <div className={`flex ${className}`}>
        {tabsLayout}
        <div className={getContentClasses()}>
          {currentTab?.content}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {tabsLayout}
      <div className={getContentClasses()}>
        {currentTab?.content}
      </div>
    </div>
  );
};

export default TabsContainer; 