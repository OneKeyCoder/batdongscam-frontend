'use client';

import React from 'react';
import { Clock, X } from 'lucide-react';

interface NotificationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification: any;
}

export default function NotificationDetailModal({ isOpen, onClose, notification }: NotificationDetailModalProps) {
  if (!isOpen || !notification) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            
            {/* 1. Header Image*/}
            <div className="h-48 w-full bg-gray-200 relative">
                <img 
                    src={notification.image || "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=1000"} 
                    alt="Notification Banner" 
                    className="w-full h-full object-cover"
                />
            </div>

            {/* 2. Body Content */}
            <div className="p-6 overflow-y-auto custom-scrollbar">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{notification.title}</h2>

                {/* Timestamps */}
                <div className="space-y-3 mb-6 border-b border-gray-100 pb-4">
                    <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-red-600 mt-0.5" />
                        <div>
                            <p className="text-xs text-gray-500 font-medium">Sent at</p>
                            <p className="text-sm font-bold text-gray-900">{notification.sentAt}</p>
                        </div>
                    </div>
                    {notification.readAt && (
                        <div className="flex items-start gap-3">
                            <Clock className="w-5 h-5 text-red-600 mt-0.5" />
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Read at</p>
                                <p className="text-sm font-bold text-gray-900">{notification.readAt}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Message */}
                <div className="space-y-3">
                    <h3 className="font-bold text-gray-900 text-sm uppercase">PAYMENT FOR {notification.subtitle}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed text-justify">
                        {notification.content || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis."}
                    </p>
                    <p className="text-sm text-gray-600 leading-relaxed text-justify">
                        Metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere.
                    </p>
                    
                    <p className="text-sm text-gray-500 mt-4">
                        For more information: <a href="#" className="text-red-600 underline font-medium">Link</a>
                    </p>
                </div>
            </div>

            {/* 3. Footer */}
            <div className="p-4 border-t border-gray-100 flex justify-end">
                <button 
                    onClick={onClose} 
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                    Close
                </button>
            </div>
        </div>
    </div>
  );
}