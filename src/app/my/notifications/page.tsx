'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2, Calendar, FileText, CreditCard, AlertTriangle, MessageSquare, Loader2, MapPin, Clock, Star, ExternalLink, Building, User, ChevronLeft, ChevronRight } from 'lucide-react';
import Modal from '@/app/components/ui/Modal';
import PropertyCard from '@/app/components/cards/PropertyCard';
import Badge from '@/app/components/ui/Badge';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { notificationService, NotificationItem, NotificationDetails } from '@/lib/api/services/notification.service';
import { propertyService } from '@/lib/api/services/property.service';
import { appointmentService, ViewingDetailsCustomer } from '@/lib/api/services/appointment.service';
import { paymentService, PaymentDetailResponse } from '@/lib/api/services/payment.service';
import { contractService, DepositContractDetailResponse, PurchaseContractDetailResponse } from '@/lib/api/services/contract.service';
import { PropertyCard as PropertyCardType } from '@/lib/api/types';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';

const typeIcons: Record<string, React.ElementType> = {
  PAYMENT: CreditCard,
  VIEWING: Calendar,
  APPOINTMENT_ASSIGNED: Calendar,
  APPOINTMENT_COMPLETED: Calendar,
  APPOINTMENT_BOOKED: Calendar,
  APPOINTMENT_CANCELLED: Calendar,
  APPOINTMENT_REMINDER: Calendar,
  CONTRACT: FileText,
  CONTRACT_UPDATE: FileText,
  PROPERTY_APPROVAL: FileText,
  PROPERTY_REJECTION: AlertTriangle,
  SYSTEM: MessageSquare,
  SYSTEM_ALERT: AlertTriangle,
  REPORT: AlertTriangle,
  VIOLATION_WARNING: AlertTriangle,
  PAYMENT_DUE: CreditCard,
};

const typeColors: Record<string, string> = {
  PAYMENT: 'bg-green-100 text-green-600',
  PAYMENT_DUE: 'bg-orange-100 text-orange-600',
  VIEWING: 'bg-blue-100 text-blue-600',
  APPOINTMENT_ASSIGNED: 'bg-blue-100 text-blue-600',
  APPOINTMENT_COMPLETED: 'bg-green-100 text-green-600',
  APPOINTMENT_BOOKED: 'bg-blue-100 text-blue-600',
  APPOINTMENT_CANCELLED: 'bg-red-100 text-red-600',
  APPOINTMENT_REMINDER: 'bg-yellow-100 text-yellow-600',
  CONTRACT: 'bg-purple-100 text-purple-600',
  CONTRACT_UPDATE: 'bg-purple-100 text-purple-600',
  PROPERTY_APPROVAL: 'bg-green-100 text-green-600',
  PROPERTY_REJECTION: 'bg-red-100 text-red-600',
  SYSTEM: 'bg-gray-100 text-gray-600',
  SYSTEM_ALERT: 'bg-red-100 text-red-600',
  REPORT: 'bg-red-100 text-red-600',
  VIOLATION_WARNING: 'bg-red-100 text-red-600',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedNotification, setSelectedNotification] = useState<NotificationDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [relatedProperty, setRelatedProperty] = useState<PropertyCardType | null>(null);
  const [isLoadingProperty, setIsLoadingProperty] = useState(false);
  const [relatedAppointment, setRelatedAppointment] = useState<ViewingDetailsCustomer | null>(null);
  const [isLoadingAppointment, setIsLoadingAppointment] = useState(false);
  const [relatedPayment, setRelatedPayment] = useState<PaymentDetailResponse | null>(null);
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);
  const [relatedContract, setRelatedContract] = useState<DepositContractDetailResponse | PurchaseContractDetailResponse | null>(null);
  const [isLoadingContract, setIsLoadingContract] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'PAYMENT' | 'VIEWING' | 'CONTRACT'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const router = useRouter();
  const { user } = useAuth();
  const { decrementUnreadCount, markAllAsReadLocal } = useNotification();
  
  // Get the correct viewings path based on user role
  const getViewingsPath = () => {
    if (user?.role === 'SALESAGENT') return '/agent/appointments';
    if (user?.role === 'CUSTOMER') return '/my/viewings';
    return '/my/viewings'; // Default fallback
  };
  
  // Get the correct contracts path based on user role
  const getContractsPath = () => {
    if (user?.role === 'SALESAGENT') return '/agent/contracts';
    if (user?.role === 'CUSTOMER') return '/customer/contracts';
    if (user?.role === 'PROPERTY_OWNER') return '/owner/contracts';
    return '/my/contracts'; // Default fallback
  };
  
  // Get the correct payments path based on user role
  // Note: Sales Agent doesn't have payments page (they don't pay anything per role_based_access.md)
  const getPaymentsPath = () => {
    if (user?.role === 'CUSTOMER' || user?.role === 'PROPERTY_OWNER') return '/my/payments';
    return '/my/payments'; // Default fallback
  };
  
  // Navigate and close modal
  const navigateAndClose = (path: string) => {
    setSelectedNotification(null);
    router.push(path);
  };

  // Fetch notifications from API
  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await notificationService.getNotifications(currentPage, 20);
        setNotifications(response.data || []);
        setTotalPages(response.paging?.totalPages || 1);
      } catch (err: any) {
        console.error('Failed to fetch notifications:', err);
        // If API fails, use empty array (mock data removed)
        setNotifications([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, [currentPage]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'PAYMENT') return n.type === 'PAYMENT';
    if (filter === 'VIEWING') return n.type === 'VIEWING' || n.type.startsWith('APPOINTMENT');
    if (filter === 'CONTRACT') return n.type === 'CONTRACT';
    return true;
  });

  const handleRead = async (notification: NotificationItem) => {
    setIsLoadingDetails(true);
    // Reset all related entities
    setRelatedProperty(null);
    setRelatedAppointment(null);
    setRelatedPayment(null);
    setRelatedContract(null);
    
    try {
      // Fetch full notification details
      const details = await notificationService.getNotificationDetails(notification.id);
      setSelectedNotification(details);
      
      // Fetch related property if available
      if (details.relatedEntityType === 'PROPERTY' && details.relatedEntityId) {
        setIsLoadingProperty(true);
        try {
          const propertyDetails = await propertyService.getPropertyDetails(details.relatedEntityId);
          const propertyCard: PropertyCardType = {
            id: propertyDetails.id,
            title: propertyDetails.title,
            thumbnailUrl: propertyDetails.mediaList?.[0]?.filePath || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
            price: propertyDetails.priceAmount,
            transactionType: propertyDetails.transactionType as 'SALE' | 'RENTAL',
            location: `${propertyDetails.wardName || ''}, ${propertyDetails.districtName || ''}, ${propertyDetails.cityName || ''}`,
            totalArea: propertyDetails.area,
            numberOfImages: propertyDetails.mediaList?.length || 0,
            favorite: propertyDetails.isFavorite || false,
            status: (propertyDetails.status as 'AVAILABLE' | 'SOLD' | 'RENTED' | 'PENDING' | 'APPROVED') || 'AVAILABLE',
            createdAt: propertyDetails.createdAt,
            updatedAt: propertyDetails.updatedAt,
            ownerId: propertyDetails.owner?.id || '',
            ownerFirstName: propertyDetails.owner?.firstName || '',
            ownerLastName: propertyDetails.owner?.lastName || '',
            ownerTier: '',
          };
          setRelatedProperty(propertyCard);
        } catch (propErr) {
          console.error('Failed to fetch related property:', propErr);
        } finally {
          setIsLoadingProperty(false);
        }
      }
      
      // Fetch related appointment if available
      if (details.relatedEntityType === 'APPOINTMENT' && details.relatedEntityId) {
        setIsLoadingAppointment(true);
        try {
          const appointmentDetails = await appointmentService.getViewingDetails(details.relatedEntityId);
          setRelatedAppointment(appointmentDetails);
        } catch (apptErr) {
          console.error('Failed to fetch related appointment:', apptErr);
        } finally {
          setIsLoadingAppointment(false);
        }
      }
      
      // Fetch related payment if available
      if (details.relatedEntityType === 'PAYMENT' && details.relatedEntityId) {
        setIsLoadingPayment(true);
        try {
          const paymentDetails = await paymentService.getPaymentById(details.relatedEntityId);
          setRelatedPayment(paymentDetails);
        } catch (payErr) {
          console.error('Failed to fetch related payment:', payErr);
        } finally {
          setIsLoadingPayment(false);
        }
      }
      
      // Fetch related contract if available (type could be CONTRACT, DEPOSIT_CONTRACT, PURCHASE_CONTRACT)
      if (String(details.relatedEntityType || '').includes('CONTRACT') && details.relatedEntityId) {
        setIsLoadingContract(true);
        try {
          // Try deposit contract first, then purchase contract
          try {
            const depositDetails = await contractService.getDepositContractById(details.relatedEntityId);
            setRelatedContract(depositDetails);
          } catch {
            // If not deposit, try purchase
            const purchaseDetails = await contractService.getPurchaseContractById(details.relatedEntityId);
            setRelatedContract(purchaseDetails);
          }
        } catch (contractErr) {
          console.error('Failed to fetch related contract:', contractErr);
        } finally {
          setIsLoadingContract(false);
        }
      }
      
      if (!notification.isRead) {
        await notificationService.markAsRead(notification.id);
        setNotifications(notifications.map(n => 
          n.id === notification.id ? { ...n, isRead: true } : n
        ));
        // Update navbar badge count
        decrementUnreadCount();
      }
    } catch (err) {
      console.error('Failed to load notification details:', err);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      // Clear navbar badge count
      markAllAsReadLocal();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
      // Still update UI optimistically
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      markAllAsReadLocal();
    }
  };

  const deleteNotification = async (id: string) => {
    // Find notification before deleting to check if it was unread
    const notificationToDelete = notifications.find(n => n.id === id);
    const wasUnread = notificationToDelete && !notificationToDelete.isRead;
    
    try {
      await notificationService.deleteNotification(id);
      setNotifications(notifications.filter(n => n.id !== id));
      if (selectedNotification?.id === id) {
        setSelectedNotification(null);
      }
      // Decrement navbar count if the deleted notification was unread
      if (wasUnread) {
        decrementUnreadCount();
      }
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
          { key: 'PAYMENT', label: 'Payments' },
          { key: 'VIEWING', label: 'Viewings' },
          { key: 'CONTRACT', label: 'Contracts' },
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

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
        </div>
      )}

      {/* Notifications List */}
      {!isLoading && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100">
          {filteredNotifications.map((notification) => {
            const Icon = typeIcons[notification.type] || MessageSquare;
            const colorClass = typeColors[notification.type] || 'bg-gray-100 text-gray-600';
            return (
              <div
                key={notification.id}
                className={`flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                  !notification.isRead ? 'bg-red-50/50' : ''
                }`}
                onClick={() => handleRead(notification)}
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
                  <Icon className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className={`text-sm ${!notification.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                        {notification.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {notification.type.replace(/_/g, ' ')}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-red-600 rounded-full shrink-0 mt-2" />
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {formatDate(notification.createdAt)}
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
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 mt-8">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
            title="First page"
          >
            <ChevronLeft className="w-4 h-4" />
            <ChevronLeft className="w-4 h-4 -ml-3" />
          </button>
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Previous page"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          {/* Page numbers */}
          <div className="flex items-center gap-1 mx-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => {
                // Show first, last, current, and pages around current
                if (page === 1 || page === totalPages) return true;
                if (Math.abs(page - currentPage) <= 1) return true;
                return false;
              })
              .map((page, index, arr) => {
                // Check if we need to show ellipsis
                const prevPage = arr[index - 1];
                const showEllipsis = prevPage && page - prevPage > 1;
                
                return (
                  <React.Fragment key={page}>
                    {showEllipsis && (
                      <span className="px-2 text-gray-400">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-[36px] h-9 px-3 text-sm font-medium rounded-lg transition-colors ${
                        currentPage === page
                          ? 'bg-red-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                );
              })}
          </div>
          
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Next page"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Last page"
          >
            <ChevronRight className="w-4 h-4" />
            <ChevronRight className="w-4 h-4 -ml-3" />
          </button>
        </div>
      )}

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
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${typeColors[selectedNotification.type] || 'bg-gray-100 text-gray-600'}`}>
                {selectedNotification.imgUrl ? (
                  <img src={selectedNotification.imgUrl} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  React.createElement(typeIcons[selectedNotification.type] || MessageSquare, { className: 'w-6 h-6' })
                )}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{selectedNotification.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{selectedNotification.type.replace(/_/g, ' ')}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {formatDate(selectedNotification.createdAt)}
                </p>
              </div>
            </div>

            {/* Message */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700 leading-relaxed">
                {selectedNotification.message || 'No additional details available.'}
              </p>
            </div>

            {/* Related Property Card */}
            {selectedNotification.relatedEntityType === 'PROPERTY' && (
              <div className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-500">Related Property</p>
                  {relatedProperty && (
                    <Link
                      href={`/property/${relatedProperty.id}`}
                      className="flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View Property
                    </Link>
                  )}
                </div>
                {isLoadingProperty ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 text-red-600 animate-spin" />
                  </div>
                ) : relatedProperty ? (
                  <PropertyCard
                    id={relatedProperty.id}
                    image={relatedProperty.thumbnailUrl || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'}
                    title={relatedProperty.title}
                    price={`${relatedProperty.price.toLocaleString('vi-VN')} VND`}
                    priceUnit={relatedProperty.transactionType === 'RENTAL' ? '/tháng' : ''}
                    address={relatedProperty.location}
                    area={`${relatedProperty.totalArea}m²`}
                    numberOfImages={relatedProperty.numberOfImages}
                    type={relatedProperty.transactionType === 'SALE' ? 'Sale' : 'Rent'}
                    isFavorite={relatedProperty.favorite}
                    showFavorite={false}
                    variant="profile"
                  />
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">Unable to load property</p>
                )}
              </div>
            )}

            {/* Related Appointment Card */}
            {selectedNotification.relatedEntityType === 'APPOINTMENT' && (
              <div className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-gray-500">Related Appointment</p>
                  <button
                    onClick={() => navigateAndClose(getViewingsPath())}
                    className="flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {user?.role === 'SALESAGENT' ? 'View All Appointments' : 'View All Viewings'}
                  </button>
                </div>
                {isLoadingAppointment ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 text-red-600 animate-spin" />
                  </div>
                ) : relatedAppointment ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    {/* Property Info */}
                    <div className="flex gap-3">
                      <img
                        src={relatedAppointment.imagesList?.[0] || relatedAppointment.thumbnailUrl || selectedNotification.imgUrl || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400'}
                        alt={relatedAppointment.title}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm truncate">{relatedAppointment.title}</h4>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />
                          {relatedAppointment.fullAddress || `${relatedAppointment.districtName || ''}, ${relatedAppointment.cityName || ''}`.replace(/^, |, $/g, '') || 'Address not available'}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge 
                            variant={
                              relatedAppointment.status === 'COMPLETED' ? 'success' :
                              relatedAppointment.status === 'CANCELLED' ? 'danger' :
                              relatedAppointment.status === 'CONFIRMED' ? 'info' : 'warning'
                            }
                            className="text-[10px]"
                          >
                            {relatedAppointment.status}
                          </Badge>
                          {relatedAppointment.rating && (
                            <div className="flex items-center gap-1 text-xs text-yellow-600">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              {relatedAppointment.rating}/5
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Agent Info */}
                    {relatedAppointment.salesAgent && (
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
                        <img
                          src={relatedAppointment.salesAgent.avatarUrl || '/default-avatar.png'}
                          alt="Agent"
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/profile/${relatedAppointment.salesAgent.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs font-medium text-gray-900 hover:text-red-600 transition-colors"
                          >
                            {`${relatedAppointment.salesAgent.firstName || ''} ${relatedAppointment.salesAgent.lastName || ''}`.trim() || 'Agent'}
                          </Link>
                          <p className="text-[10px] text-gray-500">Sales Agent</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Schedule Info */}
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <Calendar className="w-3.5 h-3.5 text-red-500" />
                        {new Date(relatedAppointment.requestedDate).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'short', day: 'numeric'
                        })}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <Clock className="w-3.5 h-3.5 text-red-500" />
                        {new Date(relatedAppointment.requestedDate).toLocaleTimeString('en-US', {
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">Unable to load appointment</p>
                )}
              </div>
            )}
            {/* Related Payment Details */}
            {selectedNotification.relatedEntityType === 'PAYMENT' && (
              <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium text-green-700">Related Payment</p>
                  {(user?.role === 'CUSTOMER' || user?.role === 'PROPERTY_OWNER') && relatedPayment && (
                    <Link 
                      href="/my/payments"
                      onClick={() => setSelectedNotification(null)}
                      className="flex items-center gap-1 text-xs font-medium text-green-600 hover:text-green-700"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View All Payments
                    </Link>
                  )}
                </div>
                {isLoadingPayment ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="w-5 h-5 text-green-600 animate-spin" />
                  </div>
                ) : relatedPayment ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-green-600" />
                        <span className="font-semibold text-gray-900">{relatedPayment.paymentType}</span>
                      </div>
                      <Badge 
                        variant={
                          relatedPayment.status === 'SUCCESS' ? 'success' :
                          relatedPayment.status === 'PENDING' ? 'warning' :
                          relatedPayment.status === 'FAILED' ? 'danger' : 'default'
                        }
                      >
                        {relatedPayment.status}
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold text-green-700">
                      {Number(relatedPayment.amount).toLocaleString('vi-VN')} VND
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      {relatedPayment.dueDate && (
                        <div>
                          <span className="text-gray-400">Due:</span>{' '}
                          {new Date(relatedPayment.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      )}
                      {relatedPayment.paidTime && (
                        <div>
                          <span className="text-gray-400">Paid:</span>{' '}
                          {new Date(relatedPayment.paidTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      )}
                    </div>
                    {relatedPayment.propertyTitle && (
                      <div className="flex items-center gap-2 pt-2 border-t border-green-200 text-xs">
                        <Building className="w-3 h-3 text-gray-400" />
                        <Link 
                          href={`/property/${relatedPayment.propertyId}`}
                          onClick={() => setSelectedNotification(null)}
                          className="text-gray-700 hover:text-green-600"
                        >
                          {relatedPayment.propertyTitle}
                        </Link>
                      </div>
                    )}
                    {/* Go to Payments button for pending payments */}
                    {(user?.role === 'CUSTOMER' || user?.role === 'PROPERTY_OWNER') && relatedPayment.status === 'PENDING' && (
                      <Link
                        href="/my/payments"
                        onClick={() => setSelectedNotification(null)}
                        className="block w-full py-2 text-center text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors mt-2"
                      >
                        Go to Payments to Pay
                      </Link>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-3">Unable to load payment details</p>
                )}
              </div>
            )}

            {/* Related Contract Details */}
            {String(selectedNotification.relatedEntityType || '').includes('CONTRACT') && (
              <div className="border border-purple-200 bg-purple-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium text-purple-700">Related Contract</p>
                  <Link 
                    href={getContractsPath()}
                    onClick={() => setSelectedNotification(null)}
                    className="flex items-center gap-1 text-xs font-medium text-purple-600 hover:text-purple-700"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View All Contracts
                  </Link>
                </div>
                {isLoadingContract ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                  </div>
                ) : relatedContract ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-purple-600" />
                        <span className="font-semibold text-gray-900">{relatedContract.contractNumber || 'Contract'}</span>
                      </div>
                      <Badge 
                        variant={
                          relatedContract.status === 'ACTIVE' || relatedContract.status === 'COMPLETED' ? 'success' :
                          relatedContract.status === 'PENDING_PAYMENT' ? 'warning' :
                          relatedContract.status === 'CANCELLED' ? 'danger' : 'info'
                        }
                      >
                        {String(relatedContract.status).replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    {'depositAmount' in relatedContract && (
                      <div className="text-xl font-bold text-purple-700">
                        Deposit: {Number(relatedContract.depositAmount).toLocaleString('vi-VN')} VND
                      </div>
                    )}
                    {'propertyValue' in relatedContract && (
                      <div className="text-xl font-bold text-purple-700">
                        Value: {Number(relatedContract.propertyValue).toLocaleString('vi-VN')} VND
                      </div>
                    )}
                    {relatedContract.property && (
                      <div className="flex items-center gap-2 pt-2 border-t border-purple-200 text-xs">
                        <Building className="w-3 h-3 text-gray-400" />
                        <Link 
                          href={`/property/${relatedContract.property.id}`}
                          onClick={() => setSelectedNotification(null)}
                          className="text-gray-700 hover:text-purple-600"
                        >
                          {relatedContract.property.title}
                        </Link>
                      </div>
                    )}
                    {relatedContract.customer && (
                      <div className="flex items-center gap-2 text-xs">
                        <User className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-600">Customer:</span>
                        <Link 
                          href={`/profile/${relatedContract.customer.id}`}
                          onClick={() => setSelectedNotification(null)}
                          className="text-gray-700 hover:text-purple-600"
                        >
                          {relatedContract.customer.firstName} {relatedContract.customer.lastName}
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-3">Unable to load contract details</p>
                )}
              </div>
            )}

            {/* Related User */}
            {selectedNotification.relatedEntityType === 'USER' && selectedNotification.relatedEntityId && (
              <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-500" />
                    <span className="font-medium text-gray-900 text-sm">
                      User: {selectedNotification.relatedEntityId.slice(0, 8)}...
                    </span>
                  </div>
                  <Link 
                    href={`/profile/${selectedNotification.relatedEntityId}`}
                    onClick={() => setSelectedNotification(null)}
                    className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View Profile
                  </Link>
                </div>
              </div>
            )}

            {/* Other entity types - just show ID */}
            {selectedNotification.relatedEntityId && 
             selectedNotification.relatedEntityType !== 'PROPERTY' && 
             selectedNotification.relatedEntityType !== 'APPOINTMENT' &&
             !String(selectedNotification.relatedEntityType || '').includes('CONTRACT') && 
             selectedNotification.relatedEntityType !== 'PAYMENT' &&
             selectedNotification.relatedEntityType !== 'USER' && (
              <div className="p-4 border border-gray-200 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">
                  Related {selectedNotification.relatedEntityType?.replace(/_/g, ' ') || 'Reference'}
                </p>
                <p className="font-medium text-gray-900 font-mono text-sm">{selectedNotification.relatedEntityId}</p>
              </div>
            )}

            {/* Actions based on type and role */}
            <div className="flex gap-3 pt-4 border-t">
              {/* Payment notification actions - only for Customer and Property Owner */}
              {(selectedNotification.type === 'PAYMENT' || selectedNotification.type === 'PAYMENT_DUE') && 
               (user?.role === 'CUSTOMER' || user?.role === 'PROPERTY_OWNER') && (
                <button
                  onClick={() => navigateAndClose('/my/payments')}
                  className="flex-1 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-center"
                >
                  Go to Payments
                </button>
              )}
              
              {/* Viewing/Appointment notification actions */}
              {(selectedNotification.type === 'VIEWING' || selectedNotification.type.startsWith('APPOINTMENT')) && (
                <button
                  onClick={() => navigateAndClose(getViewingsPath())}
                  className="flex-1 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-center"
                >
                  {user?.role === 'SALESAGENT' ? 'View My Appointments' : 'View My Viewings'}
                </button>
              )}
              
              {/* Contract notification actions */}
              {(selectedNotification.type === 'CONTRACT' || selectedNotification.type === 'CONTRACT_UPDATE') && (
                <button
                  onClick={() => navigateAndClose(getContractsPath())}
                  className="flex-1 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-center"
                >
                  View Contracts
                </button>
              )}
              
              {/* Property approval/rejection actions */}
              {(selectedNotification.type === 'PROPERTY_APPROVAL' || selectedNotification.type === 'PROPERTY_REJECTION') && relatedProperty && (
                <button
                  onClick={() => navigateAndClose(`/property/${relatedProperty.id}`)}
                  className="flex-1 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-center"
                >
                  View Property
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
