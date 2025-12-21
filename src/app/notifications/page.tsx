'use client';

import React, { useState } from 'react';
import { Bell, Check, Eye, Trash2, Calendar, FileText, CreditCard, AlertTriangle, MessageSquare } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';
import Modal from '@/app/components/ui/Modal';

// Mock data
const mockNotifications = [
  {
    id: 1,
    type: 'payment' as const,
    title: 'Payment Reminder',
    message: 'Your payment of $85,000 for Modern Villa with Pool is due on February 15, 2024. Please make the payment to avoid late fees.',
    date: '2024-02-10',
    time: '10:30 AM',
    isRead: false,
    relatedId: 'PAY-2024-001',
  },
  {
    id: 2,
    type: 'viewing' as const,
    title: 'Viewing Confirmed',
    message: 'Your viewing appointment for Luxury Apartment Downtown has been confirmed for January 20, 2024 at 10:00 AM. Agent Trần Văn Agent will meet you at the property.',
    date: '2024-01-18',
    time: '09:00 AM',
    isRead: false,
    relatedId: 'VW-2024-001',
  },
  {
    id: 3,
    type: 'contract' as const,
    title: 'Contract Ready for Signing',
    message: 'Your rental contract CTR-2024-002 for Luxury Apartment Downtown is ready for signing. Please review the terms and sign before February 1, 2024.',
    date: '2024-01-16',
    time: '02:15 PM',
    isRead: true,
    relatedId: 'CTR-2024-002',
  },
  {
    id: 4,
    type: 'system' as const,
    title: 'Account Verification Successful',
    message: 'Your account has been successfully verified. You now have full access to all features including booking viewings and signing contracts.',
    date: '2024-01-15',
    time: '11:00 AM',
    isRead: true,
    relatedId: null,
  },
  {
    id: 5,
    type: 'report' as const,
    title: 'Report Status Update',
    message: 'Your violation report #RPT-2024-001 has been reviewed by our team. The reported property has been flagged for investigation.',
    date: '2024-01-12',
    time: '04:30 PM',
    isRead: true,
    relatedId: 'RPT-2024-001',
  },
  {
    id: 6,
    type: 'payment' as const,
    title: 'Payment Successful',
    message: 'Your payment of $85,000 (Installment 2/10) for Modern Villa with Pool has been processed successfully. Thank you for your payment.',
    date: '2024-01-14',
    time: '03:45 PM',
    isRead: true,
    relatedId: 'PAY-2024-002',
  },
];

const typeIcons = {
  payment: CreditCard,
  viewing: Calendar,
  contract: FileText,
  system: MessageSquare,
  report: AlertTriangle,
};

const typeColors = {
  payment: 'bg-green-100 text-green-600',
  viewing: 'bg-blue-100 text-blue-600',
  contract: 'bg-purple-100 text-purple-600',
  system: 'bg-gray-100 text-gray-600',
  report: 'bg-red-100 text-red-600',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [selectedNotification, setSelectedNotification] = useState<typeof mockNotifications[0] | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'payment' | 'viewing' | 'contract'>('all');

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'payment') return n.type === 'payment';
    if (filter === 'viewing') return n.type === 'viewing';
    if (filter === 'contract') return n.type === 'contract';
    return true;
  });

  const handleRead = (notification: typeof mockNotifications[0]) => {
    setNotifications(notifications.map(n => 
      n.id === notification.id ? { ...n, isRead: true } : n
    ));
    setSelectedNotification(notification);
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
    if (selectedNotification?.id === id) {
      setSelectedNotification(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-red-600" />
            Notifications
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-red-600 text-white text-xs font-bold rounded-full">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Stay updated with your activities
          </p>
        </div>

        <button
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Check className="w-4 h-4" />
          Mark all as read
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {[
          { key: 'all', label: 'All' },
          { key: 'unread', label: 'Unread', count: unreadCount },
          { key: 'payment', label: 'Payments' },
          { key: 'viewing', label: 'Viewings' },
          { key: 'contract', label: 'Contracts' },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setFilter(item.key as any)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${
              filter === item.key 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {item.label}
            {item.count !== undefined && item.count > 0 && (
              <span className={`px-1.5 py-0.5 text-[10px] rounded-full ${
                filter === item.key ? 'bg-white text-red-600' : 'bg-red-600 text-white'
              }`}>
                {item.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100">
        {filteredNotifications.map((notification) => {
          const Icon = typeIcons[notification.type];
          return (
            <div
              key={notification.id}
              className={`flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                !notification.isRead ? 'bg-red-50/50' : ''
              }`}
              onClick={() => handleRead(notification)}
            >
              {/* Icon */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${typeColors[notification.type]}`}>
                <Icon className="w-5 h-5" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className={`text-sm ${!notification.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                      {notification.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                      {notification.message}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="w-2 h-2 bg-red-600 rounded-full shrink-0 mt-2" />
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {notification.date} • {notification.time}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notification.id);
                  }}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {/* Empty State */}
        {filteredNotifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <Bell className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-500 text-sm">
              {filter === 'unread' ? 'All caught up!' : 'No notifications in this category'}
            </p>
          </div>
        )}
      </div>

      {/* Notification Detail Modal */}
      {selectedNotification && (
        <Modal
          isOpen={!!selectedNotification}
          onClose={() => setSelectedNotification(null)}
          title="Notification Details"
        >
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${typeColors[selectedNotification.type]}`}>
                {React.createElement(typeIcons[selectedNotification.type], { className: 'w-6 h-6' })}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{selectedNotification.title}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedNotification.date} at {selectedNotification.time}
                </p>
              </div>
            </div>

            {/* Message */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700 leading-relaxed">
                {selectedNotification.message}
              </p>
            </div>

            {/* Related Item */}
            {selectedNotification.relatedId && (
              <div className="p-4 border border-gray-200 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Related Reference</p>
                <p className="font-medium text-gray-900">{selectedNotification.relatedId}</p>
              </div>
            )}

            {/* Actions based on type */}
            <div className="flex gap-3 pt-4 border-t">
              {selectedNotification.type === 'payment' && (
                <button className="flex-1 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
                  Go to Payments
                </button>
              )}
              {selectedNotification.type === 'viewing' && (
                <button className="flex-1 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
                  View Appointment
                </button>
              )}
              {selectedNotification.type === 'contract' && (
                <button className="flex-1 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
                  View Contract
                </button>
              )}
              <button
                onClick={() => setSelectedNotification(null)}
                className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
