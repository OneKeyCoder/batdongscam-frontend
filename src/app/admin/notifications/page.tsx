'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle, Clock, AlertTriangle,
  FileText, Bell, Calendar, DollarSign, Loader2
} from 'lucide-react';
import NotificationDetailModal from '@/app/components/features/admin/notifications/NotificationDetailModal';
import Pagination from '@/app/components/Pagination'; // Import component phân trang của bạn
import {
  notificationService,
  NotificationItem,
  NotificationDetails,
  NotificationType,
  getNotificationTypeLabel
} from '@/lib/api/services/notification.service';

export default function NotificationsPage() {
  // --- STATE ---
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter State (Client-side filter cho trang hiện tại)
  const [filter, setFilter] = useState<'all' | 'read' | 'unread'>('all');

  // Pagination State
  const [page, setPage] = useState(1);
  const limit = 10; // Page size cố định
  const [totalItems, setTotalItems] = useState(0);

  // Detail Modal State
  const [selectedNotif, setSelectedNotif] = useState<NotificationDetails | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // --- FETCH DATA ---
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getMyNotifications({
        page,
        limit,
        sortType: 'desc',
        sortBy: 'createdAt'
      });

      setNotifications(res.data);

      // Cập nhật totalItems cho Pagination
      if (res.paging) setTotalItems(res.paging.total);
      else if ((res as any).meta) setTotalItems((res as any).meta.total);

    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Gọi lại API khi chuyển trang
  useEffect(() => {
    fetchNotifications();
  }, [page]);

  // --- HANDLERS ---

  // 1. Xem chi tiết (Backend tự mark read)
  const handleViewDetail = async (id: string) => {
    setIsDetailLoading(true);
    try {
      const detail = await notificationService.getNotificationById(id);
      setSelectedNotif(detail);
      markLocalAsRead(id); // Cập nhật UI ngay
    } catch (error) {
      console.error("Failed to get details:", error);
    } finally {
      setIsDetailLoading(false);
    }
  };

  // 2. Mark as read nhanh
  const handleMarkAsRead = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await notificationService.getNotificationById(id);
      markLocalAsRead(id);
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const markLocalAsRead = (id: string) => {
    setNotifications(prev => prev.map(n =>
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  // --- UI HELPERS ---

  // Filter danh sách đã fetch được (trên trang hiện tại)
  const filteredList = notifications.filter(n => {
    if (filter === 'read') return n.isRead;
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getIconByType = (type: NotificationType) => {
    switch (type) {
      case 'APPOINTMENT_BOOKED':
      case 'APPOINTMENT_COMPLETED':
      case 'APPOINTMENT_ASSIGNED':
        return <Calendar className="w-5 h-5 text-blue-500" />;
      case 'APPOINTMENT_CANCELLED':
      case 'VIOLATION_WARNING':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'CONTRACT_UPDATE':
        return <FileText className="w-5 h-5 text-purple-500" />;
      case 'PAYMENT_DUE':
        return <DollarSign className="w-5 h-5 text-yellow-500" />;
      case 'APPOINTMENT_REMINDER':
        return <Clock className="w-5 h-5 text-orange-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Notifications</h2>
          <p className="text-sm text-gray-500">Stay updated with appointments, contracts, and system alerts.</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm gap-4">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          All Notifications
          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{totalItems}</span>
        </h3>

        <div className="flex p-1 bg-gray-100 rounded-lg">
          {(['all', 'unread', 'read'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filter === f
                  ? 'bg-white text-red-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Notification List */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
          </div>
        ) : filteredList.length === 0 ? (
          <div className="flex flex-col justify-center items-center py-20 text-gray-400">
            <Bell className="w-12 h-12 mb-3 text-gray-200" />
            <p>No notifications found.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredList.map((item) => (
              <div
                key={item.id}
                onClick={() => handleViewDetail(item.id)}
                className={`group p-5 flex gap-4 transition-all cursor-pointer hover:bg-gray-50 ${!item.isRead ? 'bg-blue-50/30' : 'bg-white'
                  }`}
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${!item.isRead ? 'bg-white border border-blue-100 shadow-sm' : 'bg-gray-100'
                  }`}>
                  {getIconByType(item.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className={`text-xs font-bold uppercase mb-1 tracking-wide ${!item.isRead ? 'text-blue-600' : 'text-gray-500'
                        }`}>
                        {getNotificationTypeLabel(item.type)}
                      </p>
                      <h4 className={`text-sm mb-1 truncate ${!item.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-700'
                        }`}>
                        {item.title}
                      </h4>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(item.createdAt)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      {!item.isRead && (
                        <span className="w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white shadow-sm mb-1"></span>
                      )}

                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!item.isRead && (
                          <button
                            onClick={(e) => handleMarkAsRead(e, item.id)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                            title="Mark as read"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Pagination
          currentPage={page}
          totalItems={totalItems}
          pageSize={limit}
          onPageChange={(newPage) => setPage(newPage)}
          className="border-none bg-white" 
        />
      </div>

      {/* --- DETAIL MODAL --- */}
      {selectedNotif && (
        <NotificationDetailModal
          isOpen={!!selectedNotif}
          onClose={() => setSelectedNotif(null)}
          notification={selectedNotif}
        />
      )}

      {/* Loading Overlay */}
      {isDetailLoading && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/10 backdrop-blur-[1px]">
          <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
        </div>
      )}
    </div>
  );
}