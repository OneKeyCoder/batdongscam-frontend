import apiClient from '../client';
import { SingleResponse, PaginatedResponse } from '../types';

const NOTIFICATION_ENDPOINTS = {
  LIST: '/notifications',
  DETAILS: (id: string) => `/notifications/${id}`,
  MARK_READ: (id: string) => `/notifications/${id}/read`,
  MARK_ALL_READ: '/notifications/read-all',
  DELETE: (id: string) => `/notifications/${id}`,
};

// Basic notification item from list
export interface NotificationItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  type: string; // NotificationTypeEnum from backend
  title: string;
  read: boolean; // Note: backend uses 'read' not 'isRead'
}

// Full notification details
export interface NotificationDetails extends NotificationItem {
  message: string;
  relatedEntityType?: string; // RelatedEntityTypeEnum from backend
  relatedEntityId?: string;
  imgUrl?: string;
  readAt?: string;
}

// Alias for backward compatibility
export type Notification = NotificationDetails;

export const notificationService = {
  async getNotifications(page: number = 1, limit: number = 20): Promise<PaginatedResponse<NotificationItem>> {
    const response = await apiClient.get<PaginatedResponse<NotificationItem>>(
      NOTIFICATION_ENDPOINTS.LIST,
      { params: { page, limit } }
    );
    return response.data;
  },

  async getNotificationDetails(id: string): Promise<NotificationDetails> {
    const response = await apiClient.get<SingleResponse<NotificationDetails>>(
      NOTIFICATION_ENDPOINTS.DETAILS(id)
    );
    return response.data.data;
  },

  async markAsRead(id: string): Promise<NotificationDetails> {
    const response = await apiClient.patch<SingleResponse<NotificationDetails>>(
      NOTIFICATION_ENDPOINTS.MARK_READ(id)
    );
    return response.data.data;
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.patch(NOTIFICATION_ENDPOINTS.MARK_ALL_READ);
  },

  async deleteNotification(id: string): Promise<void> {
    await apiClient.delete(NOTIFICATION_ENDPOINTS.DELETE(id));
  },
};
