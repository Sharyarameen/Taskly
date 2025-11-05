import React, { useCallback } from 'react';
import { User, Role, RolePermission, Permission } from '../types';
import { LogoIcon } from './icons/LogoIcon';
import { ChartBarIcon, BriefcaseIcon, CogIcon, XIcon, ShieldCheckIcon, UsersIcon, BookmarkIcon, DocumentReportIcon, CalendarIcon, LogoutIcon, ChatBubbleLeftRightIcon } from './icons/OutlineIcons';
import type { View } from '../App';

interface SidebarProps {
  currentUser: User;
  navigateTo: (view: View) => void;
  currentView: View;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  rolePermissions: RolePermission[];
  onLogout: () => void;
  appName: string;
  logoUrl: string;
}

const Sidebar: React.FC<SidebarProps> = ({ currentUser, navigateTo, currentView, sidebarOpen, setSidebarOpen, rolePermissions, onLogout, appName, logoUrl }) => {
  
  const hasPermission = useCallback((permission: Permission): boolean => {
    // Super Admins (now Administrators) always have all permissions implicitly
    if (currentUser.role === Role.Administrator) return true;
    
    const userRolePerms = rolePermissions.find(rp => rp.role === currentUser.role);
    return userRolePerms?.permissions.includes(permission) ?? false;
  }, [currentUser.role, rolePermissions]);

  const navigation = [
    { name: 'Dashboard', href: 'dashboard', icon: ChartBarIcon, requiredPermission: null },
    { name: 'Tasks', href: 'tasks', icon: BriefcaseIcon, requiredPermission: null },
    { name: 'Calendar', href: 'calendar', icon: CalendarIcon, requiredPermission: null },
    { name: 'Chat', href: 'chat', icon: ChatBubbleLeftRightIcon, requiredPermission: null },
    { name: 'Organization', href: 'organization', icon: UsersIcon, requiredPermission: Permission.CanManageUsers },
    { name: 'Resources', href: 'resources', icon: BookmarkIcon, requiredPermission: null },
    { name: 'Reports', href: 'reports', icon: DocumentReportIcon, requiredPermission: Permission.CanViewReports },
    { name: 'Settings', href: 'settings', icon: CogIcon, requiredPermission: null },
  ];
  
  const appShortName = appName.replace(' Task Manager', '');

  const getNavItemClass = (view: View | 'logout') =>
    `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
      currentView === view
        ? 'bg-base-200 dark:bg-dark-base-200 text-base-content dark:text-dark-base-content'
        : 'text-base-content-secondary dark:text-dark-base-content-secondary hover:bg-base-200 dark:hover:bg-dark-base-300 hover:text-base-content dark:hover:text-dark-base-content'
    }`;
    
  const getNavIconClass = (view: View | 'logout') => 
    `mr-3 flex-shrink-0 h-6 w-6 ${
      currentView === view
        ? 'text-brand-primary'
        : 'text-base-content-secondary group-hover:text-brand-primary'
    }`;
  
  const sidebarContent = (
    <div className="flex flex-col flex-grow border-r border-base-300 dark:border-dark-base-300 pt-5 pb-4 bg-base-100 dark:bg-dark-base-200 overflow-y-auto">
      <div className="flex items-center flex-shrink-0 px-4">
        <div className="h-8 w-auto text-brand-primary">
            {logoUrl ? <img src={logoUrl} alt={`${appShortName} Logo`} className="h-8 w-auto" /> : <LogoIcon />}
        </div>
        <span className="ml-2 text-xl font-bold">{appShortName}</span>
      </div>
      <div className="mt-5 flex-grow flex flex-col">
        <nav className="flex-1 px-2 space-y-1">
          {navigation.map((item) => {
            if (item.requiredPermission && !hasPermission(item.requiredPermission)) {
              return null;
            }
            return (
              <a
                key={item.name}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo(item.href as View);
                  setSidebarOpen(false);
                }}
                className={getNavItemClass(item.href as View)}
              >
                <item.icon className={getNavIconClass(item.href as View)} aria-hidden="true" />
                {item.name}
              </a>
            );
          })}
           <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onLogout();
              }}
              className={getNavItemClass('logout')}
            >
              <LogoutIcon className={getNavIconClass('logout')} aria-hidden="true" />
              Logout
            </a>
        </nav>
      </div>
      <div className="flex-shrink-0 px-4">
        <div className="p-4 rounded-lg bg-slate-800 dark:bg-dark-base-100 text-center text-white dark:text-dark-base-content" style={{
            background: 'linear-gradient(135deg, #059669, #065f46)',
        }}>
          <h4 className="font-bold">Download our Mobile App</h4>
          <p className="text-xs text-emerald-100 mt-1">Get another way to connect</p>
          <button className="mt-4 w-full bg-emerald-500 hover:bg-emerald-400 text-white font-semibold py-2 px-4 rounded-lg text-sm">
            Download
          </button>
        </div>
      </div>
      <div className="flex-shrink-0 flex border-t border-base-300 dark:border-dark-base-300 p-4 mt-4">
          <div className="flex-shrink-0 group block">
              <div className="flex items-center">
                  <div>
                      <img className="inline-block h-10 w-10 rounded-full" src={currentUser.avatar} alt="" />
                  </div>
                  <div className="ml-3">
                      <p className="text-sm font-medium text-base-content dark:text-dark-base-content">{currentUser.name}</p>
                      <p className="text-xs font-medium text-base-content-secondary dark:text-dark-base-content-secondary group-hover:text-base-content dark:group-hover:text-dark-base-content flex items-center">
                         <ShieldCheckIcon className="w-4 h-4 mr-1"/> {currentUser.role}
                      </p>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          {sidebarContent}
        </div>
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 flex z-40 md:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-base-100 dark:bg-dark-base-200">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <XIcon className="h-6 w-6 text-white" />
              </button>
            </div>
            {sidebarContent}
          </div>
          <div className="flex-shrink-0 w-14" aria-hidden="true"></div>
        </div>
      )}
    </>
  );
};

export default Sidebar;