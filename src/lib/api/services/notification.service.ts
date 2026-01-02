import apiClient from '../client';
import { PaginatedResponse, SingleResponse } from '../types';

export type NotificationType =
  | 'APPOINTMENT_BOOKED'
  | 'APPOINTMENT_CANCELLED'
  | 'APPOINTMENT_COMPLETED'
  | 'APPOINTMENT_ASSIGNED'
  | 'APPOINTMENT_REMINDER'
  | 'CONTRACT_UPDATE'
  | 'PAYMENT_DUE'
  | 'VIOLATION_WARNING'
  | 'SYSTEM_ALERT';

export type RelatedEntityType =
  | 'PROPERTY'
  | 'CONTRACT'
  | 'PAYMENT'
  | 'APPOINTMENT'
  | 'USER';

/**
 * NotificationItem - Dùng cho List
 * Lưu ý: Thống nhất dùng `isRead`. Nếu Backend trả về `read`, 
 * hãy đổi tên ở đây hoặc map lại dữ liệu.
 */
export interface NotificationItem {
  id: string;
  type: NotificationType; // Dùng Enum thay vì string
  title: string;
  isRead: boolean; // Thống nhất dùng isRead cho chuẩn convention
  createdAt: string;
  updatedAt: string;
}

/**
 * NotificationDetails - Dùng cho Detail
 */
export interface NotificationDetails extends NotificationItem {
  message: string;
  relatedEntityType?: RelatedEntityType;
  relatedEntityId?: string;
  imgUrl?: string;
  readAt?: string; 
}

/**
 * Filters - (Lấy từ Friend để query linh hoạt hơn)
 */
export interface NotificationFilters {
  page?: number;
  limit?: number;
  sortType?: 'asc' | 'desc';
  sortBy?: string;
}

const NOTIFICATION_ENDPOINTS = {
  LIST: '/notifications',
  DETAILS: (id: string) => `/notifications/${id}`,
  MARK_READ: (id: string) => `/notifications/${id}/read`,
  MARK_ALL_READ: '/notifications/read-all',
  DELETE: (id: string) => `/notifications/${id}`,
};

export const notificationService = {
  /**
   * Lấy danh sách thông báo (có phân trang & filter)
   */
  async getMyNotifications(filters?: NotificationFilters): Promise<PaginatedResponse<NotificationItem>> {
    const params = {
      page: 1,
      limit: 20,
      ...filters // Merge default params với filters truyền vào
    };

    const response = await apiClient.get<PaginatedResponse<NotificationItem>>(
      NOTIFICATION_ENDPOINTS.LIST,
      { params }
    );
    return response.data;
  },

  /**
   * Lấy chi tiết thông báo
   */
  async getNotificationById(id: string): Promise<NotificationDetails> {
    const response = await apiClient.get<SingleResponse<NotificationDetails>>(
      NOTIFICATION_ENDPOINTS.DETAILS(id)
    );
    return response.data.data;
  },

  /**
   * Đánh dấu đã đọc một thông báo
   */
  async markAsRead(id: string): Promise<NotificationDetails> {
    const response = await apiClient.patch<SingleResponse<NotificationDetails>>(
      NOTIFICATION_ENDPOINTS.MARK_READ(id)
    );
    return response.data.data;
  },

  /**
   * Đánh dấu đã đọc tất cả
   */
  async markAllAsRead(): Promise<void> {
    await apiClient.patch(NOTIFICATION_ENDPOINTS.MARK_ALL_READ);
  },

  /**
   * Xóa thông báo
   */
  async deleteNotification(id: string): Promise<void> {
    await apiClient.delete(NOTIFICATION_ENDPOINTS.DELETE(id));
  },
};

export const getNotificationTypeLabel = (type: NotificationType): string => {
  const labels: Record<NotificationType, string> = {
    APPOINTMENT_BOOKED: 'Lịch hẹn đã đặt',
    APPOINTMENT_CANCELLED: 'Lịch hẹn bị hủy',
    APPOINTMENT_COMPLETED: 'Lịch hẹn hoàn thành',
    APPOINTMENT_ASSIGNED: 'Đã phân công lịch hẹn',
    APPOINTMENT_REMINDER: 'Nhắc nhở lịch hẹn',
    CONTRACT_UPDATE: 'Cập nhật hợp đồng',
    PAYMENT_DUE: 'Đến hạn thanh toán',
    VIOLATION_WARNING: 'Cảnh báo vi phạm',
    SYSTEM_ALERT: 'Thông báo hệ thống',
  };
  return labels[type] || type;
};

export const getNotificationTypeVariant = (type: NotificationType): string => {
  const variants: Record<NotificationType, string> = {
    APPOINTMENT_BOOKED: 'success',
    APPOINTMENT_CANCELLED: 'error', // Đổi failed thành error cho chuẩn Antd/MUI
    APPOINTMENT_COMPLETED: 'processing', // Đổi blue thành processing
    APPOINTMENT_ASSIGNED: 'warning',
    APPOINTMENT_REMINDER: 'warning',
    CONTRACT_UPDATE: 'processing',
    PAYMENT_DUE: 'error',
    VIOLATION_WARNING: 'error',
    SYSTEM_ALERT: 'default',
  };
  return variants[type] || 'default';
};