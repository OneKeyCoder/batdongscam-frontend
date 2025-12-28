import apiClient from '../client';
import { PaginatedResponse, SingleResponse } from '../types';

const NOTIFICATION_ENDPOINTS = {
    MY_NOTIFICATIONS: '/notifications',
    NOTIFICATION_DETAIL: (id: string) => `/notifications/${id}`,
};


// NotificationTypeEnum
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

// RelatedEntityTypeEnum
export type RelatedEntityType =
    | 'PROPERTY'
    | 'CONTRACT'
    | 'PAYMENT'
    | 'APPOINTMENT'
    | 'USER';

// NotificationStatusEnum (for internal use if needed)
export type NotificationStatus =
    | 'PENDING'
    | 'SENT'
    | 'READ'
    | 'FAILED';

// === DTOs ===

/**
 * NotificationItem - Used in list view
 * Extends AbstractBaseDataResponse (id, createdAt, updatedAt)
 */
export interface NotificationItem {
    id: string;
    type: NotificationType;
    title: string;
    isRead: boolean;
    createdAt: string;
    updatedAt: string;
}

/**
 * NotificationDetails - Used in detail view
 * Extends AbstractBaseDataResponse (id, createdAt, updatedAt)
 */
export interface NotificationDetails {
    id: string;
    type: NotificationType;
    title: string;
    isRead: boolean;
    message: string;
    relatedEntityType?: RelatedEntityType;
    relatedEntityId?: string;
    imgUrl?: string;
    readAt?: string; 
    createdAt: string;
    updatedAt: string;
}

/**
 * Filters for querying notifications
 */
export interface NotificationFilters {
    page?: number;
    limit?: number;
    sortType?: 'asc' | 'desc';
    sortBy?: string;
}

// === SERVICE ===

export const notificationService = {
    /**
     * Get my notifications (paginated)
     * GET /notifications
     * 
     * @param filters - Pagination and sorting options
     * @returns Paginated list of notifications
     */
    async getMyNotifications(filters?: NotificationFilters): Promise<PaginatedResponse<NotificationItem>> {
        const response = await apiClient.get<PaginatedResponse<NotificationItem>>(
            NOTIFICATION_ENDPOINTS.MY_NOTIFICATIONS,
            { params: filters }
        );
        return response.data;
    },

    /**
     * Get notification details by ID
     * GET /notifications/{notificationId}
     
     * @param notificationId - UUID of the notification
     * @returns Detailed notification information
     */
    async getNotificationById(notificationId: string): Promise<NotificationDetails> {
        const response = await apiClient.get<SingleResponse<NotificationDetails>>(
            NOTIFICATION_ENDPOINTS.NOTIFICATION_DETAIL(notificationId)
        );
        return response.data.data;
    },
};

// === HELPER FUNCTIONS (Optional - for UI) ===

/**
 * Get user-friendly label for notification type
 */
export const getNotificationTypeLabel = (type: NotificationType): string => {
    const labels: Record<NotificationType, string> = {
        APPOINTMENT_BOOKED: 'Appointment Booked',
        APPOINTMENT_CANCELLED: 'Appointment Cancelled',
        APPOINTMENT_COMPLETED: 'Appointment Completed',
        APPOINTMENT_ASSIGNED: 'Appointment Assigned',
        APPOINTMENT_REMINDER: 'Appointment Reminder',
        CONTRACT_UPDATE: 'Contract Update',
        PAYMENT_DUE: 'Payment Due',
        VIOLATION_WARNING: 'Violation Warning',
        SYSTEM_ALERT: 'System Alert',
    };
    return labels[type] || type;
};

/**
 * Get color variant for notification type (for badges/styling)
 */
export const getNotificationTypeVariant = (type: NotificationType): string => {
    const variants: Record<NotificationType, string> = {
        APPOINTMENT_BOOKED: 'success',
        APPOINTMENT_CANCELLED: 'failed',
        APPOINTMENT_COMPLETED: 'blue',
        APPOINTMENT_ASSIGNED: 'pending',
        APPOINTMENT_REMINDER: 'pending',
        CONTRACT_UPDATE: 'blue',
        PAYMENT_DUE: 'pending',
        VIOLATION_WARNING: 'failed',
        SYSTEM_ALERT: 'gray',
    };
    return variants[type] || 'default';
};