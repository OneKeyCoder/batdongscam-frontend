'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { notificationService } from '@/lib/api/services/notification.service';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
  decrementUnreadCount: () => void;
  markAllAsReadLocal: () => void;
  incrementUnreadCount: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  // Fetch unread count from API  
  const refreshUnreadCount = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    try {
      const response = await notificationService.getNotifications(1, 100);
      const count = (response.data || []).filter(n => !n.isRead).length;
      setUnreadCount(count);
    } catch (err) {
      console.error('Failed to fetch notification count:', err);
    }
  }, [user]);

  // Manually decrement when a notification is marked as read
  const decrementUnreadCount = useCallback(() => {
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  // When mark all as read is called
  const markAllAsReadLocal = useCallback(() => {
    setUnreadCount(0);
  }, []);

  // Increment (for new notifications via socket/polling if needed)
  const incrementUnreadCount = useCallback(() => {
    setUnreadCount(prev => prev + 1);
  }, []);

  // Initial fetch when user logs in
  useEffect(() => {
    refreshUnreadCount();
  }, [refreshUnreadCount]);

  // Periodic refresh (every 2 minutes as backup, not 30 seconds to reduce API calls)
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(refreshUnreadCount, 120000); // 2 minutes
    return () => clearInterval(interval);
  }, [user, refreshUnreadCount]);

  return (
    <NotificationContext.Provider value={{
      unreadCount,
      refreshUnreadCount,
      decrementUnreadCount,
      markAllAsReadLocal,
      incrementUnreadCount,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

// Hook that doesn't throw if used outside provider (for optional usage)
export function useNotificationOptional() {
  return useContext(NotificationContext);
}
