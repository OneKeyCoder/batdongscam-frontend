'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, Clock, User, X, Loader2, AlertCircle } from 'lucide-react';
import Modal from '@/app/components/ui/Modal';
import Badge from '@/app/components/ui/Badge';
import { appointmentService, ViewingListItem } from '@/lib/api/services/appointment.service';

interface PropertyBookingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyName: string; 
}

export default function PropertyBookingsModal({ isOpen, onClose, propertyName }: PropertyBookingsModalProps) {
  const [bookings, setBookings] = useState<ViewingListItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && propertyName) {
      fetchBookings();
    }
  }, [isOpen, propertyName]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await appointmentService.getViewingList({
        page: 1,
        limit: 20,
        propertyName: propertyName, 
        sortType: 'desc',
        sortBy: 'requestedDate'
      });
      setBookings(res.data);
    } catch (error) {
      console.error("Failed to fetch bookings", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'CONFIRMED': return 'success';
          case 'PENDING': return 'warning';
          case 'CANCELLED': return 'danger';
          case 'COMPLETED': return 'blue';
          default: return 'default';
      }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Property Bookings">
      <div className="min-h-[300px] max-h-[500px] overflow-y-auto custom-scrollbar -mr-2 pr-2">
        {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-red-600 animate-spin"/></div>
        ) : bookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400 text-sm">
                <Calendar className="w-8 h-8 mb-2 opacity-20" />
                No bookings found for this property.
            </div>
        ) : (
            <div className="space-y-3">
                {bookings.map((item) => (
                    <div key={item.id} className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors bg-white shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5 text-gray-500" />
                                <span className="text-sm font-bold text-gray-900">
                                    {new Date(item.requestedDate).toLocaleDateString('en-GB')}
                                </span>
                                <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                    {new Date(item.requestedDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <Badge variant={getStatusColor(item.status)} className="text-[10px] px-1.5 py-0.5">
                                {item.status}
                            </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-1">
                            <User className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-xs text-gray-700 font-medium">Customer: {item.customerName || 'Unknown'}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <User className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-xs text-gray-500">Agent: {item.salesAgentName || '---'}</span>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </Modal>
  );
}