
import React, { useState, useMemo } from 'react';
import { User, Notification } from '../types';
import { BellIcon, MenuIcon } from './icons/OutlineIcons';

interface HeaderProps {
  currentUser: User;
  onLogout: () => void;
  setSidebarOpen: (open: boolean) => void;
  notifications: Notification[];
  onMarkNotificationsAsRead: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentUser, onLogout, setSidebarOpen, notifications, onMarkNotificationsAsRead }) => {
    const [profileOpen, setProfileOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);

    const unreadCount = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);

    const handleBellClick = () => {
        setNotificationsOpen(!notificationsOpen);
        if (!notificationsOpen) {
            // Optional: Mark as read when opening dropdown
            // onMarkNotificationsAsRead();
        }
    };

    return (
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-base-100 dark:bg-dark-base-200 shadow">
            <button
                className="px-4 border-r border-base-300 dark:border-dark-base-300 text-base-content-secondary focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-primary md:hidden"
                onClick={() => setSidebarOpen(true)}
            >
                <span className="sr-only">Open sidebar</span>
                <MenuIcon className="h-6 w-6" />
            </button>
            <div className="flex-1 px-4 flex justify-between">
                <div className="flex-1 flex">
                    {/* Search bar could go here */}
                </div>
                <div className="ml-4 flex items-center md:ml-6">
                    <div className="relative">
                        <button 
                            onClick={handleBellClick}
                            className="bg-base-100 dark:bg-dark-base-200 p-1 rounded-full text-base-content-secondary dark:text-dark-base-content-secondary hover:text-base-content dark:hover:text-dark-base-content focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
                        >
                            <span className="sr-only">View notifications</span>
                            <BellIcon className="h-6 w-6" />
                             {unreadCount > 0 && (
                                <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-dark-base-200"></span>
                            )}
                        </button>
                        {notificationsOpen && (
                            <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-base-100 dark:bg-dark-base-300 ring-1 ring-black ring-opacity-5 focus:outline-none">
                                <div className="p-2 border-b dark:border-dark-base-200 flex justify-between items-center">
                                    <h3 className="font-semibold text-sm">Notifications</h3>
                                    <button onClick={onMarkNotificationsAsRead} className="text-xs text-brand-primary hover:underline">Mark all as read</button>
                                </div>
                                <ul className="max-h-80 overflow-y-auto">
                                    {notifications.length > 0 ? (
                                        [...notifications].reverse().map(n => (
                                            <li key={n.id} className={`p-3 text-sm border-b dark:border-dark-base-200/50 ${n.isRead ? 'opacity-60' : ''}`}>
                                                <p>{n.message}</p>
                                                <p className="text-xs text-base-content-secondary dark:text-dark-base-content-secondary mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                                            </li>
                                        ))
                                    ) : (
                                        <li className="p-4 text-sm text-center text-base-content-secondary">No new notifications</li>
                                    )}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Profile dropdown */}
                    <div className="ml-3 relative">
                        <div>
                            <button
                                className="max-w-xs bg-base-100 dark:bg-dark-base-200 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
                                onClick={() => setProfileOpen(!profileOpen)}
                            >
                                <span className="sr-only">Open user menu</span>
                                <img className="h-8 w-8 rounded-full" src={currentUser.avatar} alt="" />
                            </button>
                        </div>
                        {profileOpen && (
                             <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-base-100 dark:bg-dark-base-300 ring-1 ring-black ring-opacity-5 focus:outline-none">
                                 <div className="block px-4 py-2 text-sm text-base-content dark:text-dark-base-content">
                                     Signed in as <br />
                                     <strong className="font-medium">{currentUser.name}</strong>
                                 </div>
                                <a href="#" onClick={(e) => { e.preventDefault(); onLogout(); }} className="block px-4 py-2 text-sm text-base-content dark:text-dark-base-content hover:bg-base-200 dark:hover:bg-dark-base-200">
                                    Sign out
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;
