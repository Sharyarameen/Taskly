import React, { useEffect } from 'react';
import { Notification } from '../types';
import { BriefcaseIcon, ChatBubbleLeftRightIcon, XIcon, InformationCircleIcon } from './icons/OutlineIcons';

interface ToastProps {
    notification: Notification;
    onRemove: (id: string) => void;
    onClick: (notification: Notification) => void;
}

const Toast: React.FC<ToastProps> = ({ notification, onRemove, onClick }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onRemove(notification.id);
        }, 5000); // Auto-remove after 5 seconds

        return () => clearTimeout(timer);
    }, [notification.id, onRemove]);

    const Icon = notification.link?.type === 'task' 
        ? BriefcaseIcon 
        : notification.link?.type === 'chat'
        ? ChatBubbleLeftRightIcon
        : InformationCircleIcon;
    
    return (
        <div 
            onClick={() => onClick(notification)}
            className="w-full max-w-sm bg-base-100 dark:bg-dark-base-300 shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden cursor-pointer transform transition-all animate-toast-in"
        >
            <div className="p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <Icon className="h-6 w-6 text-brand-primary" aria-hidden="true" />
                    </div>
                    <div className="ml-3 w-0 flex-1 pt-0.5">
                        <p className="text-sm font-medium text-base-content dark:text-dark-base-content">
                            {notification.link?.type === 'chat' ? 'New Message' : notification.link?.type === 'task' ? 'Task Update' : 'Notification'}
                        </p>
                        <p className="mt-1 text-sm text-base-content-secondary dark:text-dark-base-content-secondary">
                            {notification.message}
                        </p>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex">
                        <button
                            onClick={(e) => { e.stopPropagation(); onRemove(notification.id); }}
                            className="bg-transparent rounded-md inline-flex text-base-content-secondary hover:text-base-content focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
                        >
                            <span className="sr-only">Close</span>
                            <XIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface ToastContainerProps {
    toasts: Notification[];
    onRemove: (id: string) => void;
    onNotificationClick: (notification: Notification) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove, onNotificationClick }) => {
    return (
        <>
            <div
                aria-live="assertive"
                className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-[100]"
            >
                <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
                    {toasts.map((toast) => (
                        <Toast key={toast.id} notification={toast} onRemove={onRemove} onClick={onNotificationClick} />
                    ))}
                </div>
            </div>
            <style>{`
                @keyframes toast-in {
                    from {
                        opacity: 0;
                        transform: translateY(20px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                .animate-toast-in {
                    animation: toast-in 0.3s ease-out forwards;
                }
            `}</style>
        </>
    );
};