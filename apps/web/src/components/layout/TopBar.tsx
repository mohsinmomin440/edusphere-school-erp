import React, { useState } from 'react';
import {
  Search,
  Bell,
  Mail,
  ChevronDown,
  Menu,
  LogOut,
  User as UserIcon,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';

export interface TopBarProps {
  currentTab: string;
  onOpenMobileMenu?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentTab: _currentTab,
  onOpenMobileMenu,
}) => {
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [hasNotifications] = useState(true);

  return (
    <header className="h-16 border-b border-border bg-white px-4 lg:px-8 flex items-center justify-between z-20 flex-shrink-0">
      {/* Left: Mobile hamburger & Global Search */}
      <div className="flex items-center space-x-3 w-full max-w-md">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 text-muted hover:text-text rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Global Search Bar */}
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search anything..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-text placeholder-muted focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Right: Quick Actions & Profile Dropdown */}
      <div className="flex items-center space-x-3 sm:space-x-4 pl-4">
        {/* Messages Icon */}
        <button
          className="relative p-2 text-muted hover:text-text rounded-lg hover:bg-slate-100 transition-colors"
          title="Messages"
        >
          <Mail className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500" />
        </button>

        {/* Notifications Bell */}
        <button
          className="relative p-2 text-muted hover:text-text rounded-lg hover:bg-slate-100 transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          {hasNotifications && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
          )}
        </button>

        <div className="h-6 w-px bg-slate-200" />

        {/* User Profile Button */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-2.5 p-1.5 rounded-lg hover:bg-slate-50 transition-colors focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs ring-2 ring-blue-100 shadow-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-text leading-tight">
                {user?.name || 'Admin'}
              </p>
              <p className="text-[10px] text-muted">
                {user?.role || 'Super Administrator'}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-muted hidden sm:block" />
          </button>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-border shadow-lg py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b border-border">
                <p className="text-sm font-semibold text-text truncate">
                  {user?.name || 'Admin'}
                </p>
                <p className="text-xs text-muted truncate">
                  {user?.email || 'admin@edusphere.com'}
                </p>
                <span className="inline-block mt-1 text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-medium">
                  {user?.role || 'Super Administrator'}
                </span>
              </div>

              <div className="py-1">
                <button
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-xs text-text hover:bg-slate-50"
                >
                  <UserIcon className="w-4 h-4 text-muted" />
                  <span>My Profile</span>
                </button>
                <button
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-xs text-text hover:bg-slate-50"
                >
                  <ShieldCheck className="w-4 h-4 text-muted" />
                  <span>Role & Permissions</span>
                </button>
              </div>

              <div className="border-t border-border pt-1">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                  }}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
