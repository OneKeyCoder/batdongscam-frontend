'use client';

import React, { useState } from 'react';
import NotificationDetailModal from '@/app/components/features/admin/notifications/NotificationDetailModal';

const initialNotifications = Array(10).fill(null).map((_, i) => ({
    id: i + 1,
    type: "Notification Type",
    title: "Notification Title", // Cái này hiện ở list
    subtitle: "LY HUA MOTHER HOUSE IS 3 DAYS LEFT", // Cái này hiện trong detail
    sentAt: "12:52:14 - October 10th, 2025",
    readAt: i % 3 === 0 ? null : "12:55:00 - October 10th, 2025", // Mock read/unread
    isRead: i % 3 !== 0, // i chia hết cho 3 là chưa đọc (False)
    content: "Ly Hua too sexy",
    image: `https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=500&ixlib=rb-4.0.3`
}));

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState<'all' | 'read' | 'unread'>('all');
  const [selectedNotif, setSelectedNotif] = useState<any>(null);

  const filteredList = notifications.filter(n => {
      if (filter === 'read') return n.isRead;
      if (filter === 'unread') return !n.isRead;
      return true;
  });

  // Mark as Read
  const handleMarkAsRead = (id: number) => {
      setNotifications(prev => prev.map(n => 
          n.id === id ? { ...n, isRead: true, readAt: new Date().toLocaleString() } : n
      ));
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Notifications</h2>
        <p className="text-sm text-gray-500">Hello 123</p>
      </div>

      {/* --- HEADER: COUNT & FILTER --- */}
      <div className="flex justify-between items-center">
          <h3 className="font-bold text-gray-900">Notifications ({filteredList.length})</h3>
          
          <div className="flex text-sm font-medium gap-6 text-gray-500">
              <button 
                onClick={() => setFilter('all')}
                className={`${filter === 'all' ? 'text-red-600 bg-red-50 px-2 py-0.5 rounded' : 'hover:text-gray-900'}`}
              >
                  All
              </button>
              <button 
                onClick={() => setFilter('read')}
                className={`${filter === 'read' ? 'text-red-600 bg-red-50 px-2 py-0.5 rounded' : 'hover:text-gray-900'}`}
              >
                  Read
              </button>
              <button 
                onClick={() => setFilter('unread')}
                className={`${filter === 'unread' ? 'text-red-600 bg-red-50 px-2 py-0.5 rounded' : 'hover:text-gray-900'}`}
              >
                  Unread
              </button>
          </div>
      </div>

      {/* --- NOTIFICATION LIST --- */}
      <div className="space-y-0">
          {filteredList.map((item) => (
              <div 
                key={item.id} 
                className={`py-6 border-b border-gray-100 flex justify-between items-start transition-colors ${!item.isRead ? 'bg-white' : 'bg-white/50'}`}
              >
                  {/* Left Content */}
                  <div className="flex-1">
                      <h4 className="text-sm font-bold text-gray-900 mb-0.5">{item.type}</h4>
                      <p className="text-xs text-gray-500 mb-2">{item.title}</p>
                      <p className="text-xs text-gray-400 mb-3">{item.sentAt}</p>
                      
                      <div className="flex gap-3">
                          <button 
                            onClick={() => setSelectedNotif(item)}
                            className="px-4 py-1.5 border border-green-200 text-green-600 hover:bg-green-50 rounded-lg text-xs font-bold transition-colors"
                          >
                              Detail
                          </button>
                          
                          {!item.isRead && (
                              <button 
                                onClick={() => handleMarkAsRead(item.id)}
                                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors"
                              >
                                  Mark as read
                              </button>
                          )}
                      </div>
                  </div>

                  {/* Right: Unread Dot */}
                  <div className="pt-2 pr-2">
                      {!item.isRead && (
                          <div className="w-3.5 h-3.5 bg-red-200 rounded-full animate-pulse border-2 border-white shadow-sm ring-1 ring-red-100"></div>
                      )}
                  </div>
              </div>
          ))}

          {filteredList.length === 0 && (
              <div className="py-10 text-center text-gray-400 text-sm">
                  No notifications found.
              </div>
          )}
      </div>

      {/* --- DETAIL MODAL --- */}
      <NotificationDetailModal 
        isOpen={!!selectedNotif}
        onClose={() => setSelectedNotif(null)}
        notification={selectedNotif}
      />
    </div>
  );
}