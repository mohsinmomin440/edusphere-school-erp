import React, { useState } from 'react';
import { Breadcrumb } from './Breadcrumb';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import Dashboard from '@/features/dashboard/Dashboard';
import { StudentManagement } from '@/features/students/StudentManagement';

interface AppShellProps {
  children?: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderContent = () => {
    switch (currentTab) {
      case 'students':
        return <StudentManagement />;
      case 'dashboard':
        return <Dashboard />;
      default:
        return children || <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <TopBar
          currentTab={currentTab}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <Breadcrumb currentTab={currentTab} />
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};
