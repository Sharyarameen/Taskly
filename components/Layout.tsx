

import React, { useState } from 'react';
import { User, Notification, RolePermission } from '../types';
import Header from './Header';
import Sidebar from './Sidebar';
import Chatbot from './Chatbot';
import type { View, ChatMessage } from '../App';

interface LayoutProps {
  currentUser: User;
  onLogout: () => void;
  navigateTo: (view: View) => void;
  currentView: View;
  children: React.ReactNode;
  isChatbotOpen: boolean;
  setIsChatbotOpen: (isOpen: boolean) => void;
  chatHistory: ChatMessage[];
  onSendMessage: (message: string) => void;
  isBotTyping: boolean;
  notifications: Notification[];
  onMarkNotificationsAsRead: () => void;
  rolePermissions: RolePermission[];
  appName: string;
  logoUrl: string;
}

const Layout: React.FC<LayoutProps> = ({ 
    currentUser, 
    onLogout, 
    navigateTo, 
    currentView, 
    children,
    isChatbotOpen,
    setIsChatbotOpen,
    chatHistory,
    onSendMessage,
    isBotTyping,
    notifications,
    onMarkNotificationsAsRead,
    rolePermissions,
    appName,
    logoUrl
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="h-screen flex overflow-hidden bg-base-200 dark:bg-dark-base-100">
      <Sidebar 
        currentUser={currentUser} 
        navigateTo={navigateTo} 
        currentView={currentView} 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        rolePermissions={rolePermissions} 
        onLogout={onLogout}
        appName={appName}
        logoUrl={logoUrl}
      />
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <Header 
          currentUser={currentUser} 
          onLogout={onLogout} 
          setSidebarOpen={setSidebarOpen}
          notifications={notifications}
          onMarkNotificationsAsRead={onMarkNotificationsAsRead}
        />
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          {children}
        </main>
      </div>
       <Chatbot 
          isOpen={isChatbotOpen}
          onToggle={() => setIsChatbotOpen(!isChatbotOpen)}
          messages={chatHistory}
          onSendMessage={onSendMessage}
          // FIX: Pass the `isBotTyping` prop to the `isTyping` prop of the Chatbot component.
          isTyping={isBotTyping}
        />
    </div>
  );
};

export default Layout;