/**
 * Notification Context - AUREX Civic Issue Reporting System
 * 
 * Manages in-app notifications and toast messages.
 */

import React, { createContext, useContext, useState, useCallback } from 'react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  title?: string;
  duration?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  showNotification: (notification: Omit<Notification, 'id'>) => void;
  hideNotification: (id: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newNotification = { ...notification, id };
    
    setNotifications((prev) => [...prev, newNotification]);

    // Auto-hide after duration
    if (notification.duration !== 0) {
      setTimeout(() => {
        hideNotification(id);
      }, notification.duration || 5000);
    }
  }, []);

  const hideNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const success = useCallback((message: string, title?: string) => {
    showNotification({ type: 'success', message, title });
  }, [showNotification]);

  const error = useCallback((message: string, title?: string) => {
    showNotification({ type: 'error', message, title });
  }, [showNotification]);

  const warning = useCallback((message: string, title?: string) => {
    showNotification({ type: 'warning', message, title });
  }, [showNotification]);

  const info = useCallback((message: string, title?: string) => {
    showNotification({ type: 'info', message, title });
  }, [showNotification]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        showNotification,
        hideNotification,
        success,
        error,
        warning,
        info
      }}
    >
      {children}
      {/* Notification Toast Container */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
        {notifications.map((notification) => (
          <NotificationToast
            key={notification.id}
            notification={notification}
            onClose={() => hideNotification(notification.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

function NotificationToast({
  notification,
  onClose
}: {
  notification: Notification;
  onClose: () => void;
}) {
  const bgColors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
  };

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  return (
    <div
      className={`${bgColors[notification.type]} text-white px-4 py-3 rounded-lg shadow-lg min-w-[300px] max-w-[400px] animate-slideInRight`}
    >
      <div className="flex items-start gap-3">
        <span className="text-lg">{icons[notification.type]}</span>
        <div className="flex-1">
          {notification.title && (
            <h4 className="font-semibold text-sm">{notification.title}</h4>
          )}
          <p className="text-sm">{notification.message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}