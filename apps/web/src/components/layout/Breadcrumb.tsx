import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbProps {
  currentTab?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ currentTab = 'Dashboard' }) => {
  const formattedTab = currentTab.charAt(0).toUpperCase() + currentTab.slice(1);

  return (
    <nav className="flex items-center space-x-2 text-xs text-muted" aria-label="Breadcrumb">
      <div className="flex items-center space-x-1 hover:text-text cursor-pointer transition-colors">
        <Home className="w-3.5 h-3.5" />
        <span>Home</span>
      </div>
      <ChevronRight className="w-3 h-3 text-slate-400" />
      <span className="font-semibold text-text">{formattedTab}</span>
    </nav>
  );
};
