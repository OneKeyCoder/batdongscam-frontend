'use client';

import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, ChevronLeft, ChevronRight, User, Phone, Loader2, Check, X } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';
import Modal from '@/app/components/ui/Modal';
import { appointmentService, ViewingListItem, ViewingDetailsAdmin } from '@/lib/api/services/appointment.service';
import Skeleton from '@/app/components/ui/Skeleton';

type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

interface Appointment {
  id: string;
  propertyTitle: string;
  propertyImage: string;
  propertyAddress: string;
  scheduledDate: string;
  scheduledTime: string;
  status: AppointmentStatus;
  customerName: string;
  customerTier?: string;
  customerPhone?: string;
  price?: string;
  area?: string;
  // Details
  fullAddress?: string;
  description?: string;
  customerRequirements?: string;
  rating?: number;
  comment?: string;
}

const statusVariants: Record<AppointmentStatus, 'warning' | 'info' | 'success' | 'danger'> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  COMPLETED: 'success',
  CANCELLED: 'danger',
};

const statusLabels: Record<AppointmentStatus, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export default function AgentAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAppointmentDetails, setSelectedAppointmentDetails] = useState<ViewingDetailsAdmin | null>(null);
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled'>('All');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState<number | null>(null);
  const [showDateAppointments, setShowDateAppointments] = useState<{date: number, appointments: Appointment[]} | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;
  
  // Action modal state
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'cancel' | 'complete' | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const getImageUrl = (path?: string) => {
    if (!path) {
      const placeholders = [
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400',
      ];
      return placeholders[Math.floor(Math.random() * placeholders.length)];
    }
    
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    
    const placeholders = [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400',
    ];
    const hash = path.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return placeholders[hash % placeholders.length];
  };

  // State for all appointments (for calendar)
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  
  // Load all appointments for calendar on mount
  useEffect(() => {
    loadAllAppointmentsForCalendar();
  }, []);

  // Load paginated appointments when page changes
  useEffect(() => {
    loadAppointments(currentPage);
  }, [currentPage]);

  // Load ALL appointments for calendar display (no pagination)
  const loadAllAppointmentsForCalendar = async () => {
    try {
      const response = await appointmentService.getMyViewingList({
        limit: 500, // Get all appointments
        sortType: 'desc',
        sortBy: 'requestedDate',
      });
      
      const data = response.data || [];
      
      const mappedData: Appointment[] = data.map((item: ViewingListItem) => {
        const requestedDate = new Date(item.requestedDate);
        const formattedDate = requestedDate.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
        const formattedTime = requestedDate.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
        
        const address = [item.districtName, item.cityName].filter(Boolean).join(', ') || 'Address not available';
        
        return {
          id: item.id,
          propertyTitle: item.propertyName,
          propertyImage: getImageUrl(item.thumbnailUrl),
          propertyAddress: address,
          scheduledDate: formattedDate,
          scheduledTime: formattedTime,
          status: item.status,
          customerName: item.customerName || 'Unknown Customer',
          customerTier: item.customerTier,
          price: item.price ? `${item.price.toLocaleString('vi-VN')} VND` : undefined,
          area: item.area ? `${item.area} m²` : undefined,
        };
      });
      setAllAppointments(mappedData);
    } catch (error) {
      console.error('Failed to load all appointments for calendar:', error);
    }
  };

  const loadAppointments = async (page: number = 1) => {
    setIsLoading(true);
    try {
      // Map filter to status enums
      const statusEnums = filter === 'All' ? undefined : 
        filter === 'Pending' ? ['PENDING' as const] :
        filter === 'Confirmed' ? ['CONFIRMED' as const] :
        filter === 'Completed' ? ['COMPLETED' as const] :
        filter === 'Cancelled' ? ['CANCELLED' as const] : undefined;

      // Use agent's my-viewing-list endpoint with pagination and sort desc
      const response = await appointmentService.getMyViewingList({
        page,
        limit: itemsPerPage,
        sortType: 'desc',
        sortBy: 'requestedDate',
        statusEnums
      });
      
      const data = response.data || [];
      
      // Update pagination info
      if (response.paging) {
        setTotalPages(response.paging.totalPages || 1);
        setTotalItems(response.paging.total || 0);
      }
      
      // Map data without loading details for each (faster)
      const mappedData: Appointment[] = data.map((item: ViewingListItem) => {
        const requestedDate = new Date(item.requestedDate);
        const formattedDate = requestedDate.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
        const formattedTime = requestedDate.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
        
        const address = [item.districtName, item.cityName].filter(Boolean).join(', ') || 'Address not available';
        
        return {
          id: item.id,
          propertyTitle: item.propertyName,
          propertyImage: getImageUrl(item.thumbnailUrl),
          propertyAddress: address,
          scheduledDate: formattedDate,
          scheduledTime: formattedTime,
          status: item.status,
          customerName: item.customerName || 'Unknown Customer',
          customerTier: item.customerTier,
          price: item.price ? `${item.price.toLocaleString('vi-VN')} VND` : undefined,
          area: item.area ? `${item.area} m²` : undefined,
          // Rating info from API
          rating: item.rating,
          comment: item.comment,
        };
      });
      setAppointments(mappedData);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Reload when filter changes
  useEffect(() => {
    setCurrentPage(1);
    loadAppointments(1);
  }, [filter]);

  const openActionModal = (id: string, type: 'cancel' | 'complete') => {
    setActionId(id);
    setActionType(type);
    setCancelReason('');
    setShowActionModal(true);
  };

  const handleAction = async () => {
    if (!actionId || !actionType) return;
    
    setIsProcessing(true);
    try {
      if (actionType === 'cancel') {
        await appointmentService.cancelAppointment(actionId, cancelReason || undefined);
      } else if (actionType === 'complete') {
        await appointmentService.completeAppointment(actionId);
      }
      
      await loadAppointments();
      setShowActionModal(false);
      setActionId(null);
      setActionType(null);
    } catch (error) {
      console.error(`Failed to ${actionType} appointment:`, error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDateClick = (day: number) => {
    // Use allAppointments for calendar click (not paginated)
    const dateAppointments = allAppointments.filter(a => {
      const appointmentDate = new Date(a.scheduledDate);
      return appointmentDate.getDate() === day &&
        appointmentDate.getMonth() === currentDate.getMonth() &&
        appointmentDate.getFullYear() === currentDate.getFullYear();
    });
    
    if (dateAppointments.length === 1) {
      handleViewDetails(dateAppointments[0].id);
    } else if (dateAppointments.length > 1) {
      setShowDateAppointments({ date: day, appointments: dateAppointments });
    }
  };

  const getAppointmentsForDate = (day: number): Appointment[] => {
    // Use allAppointments for calendar hover (not paginated)
    return allAppointments.filter(a => {
      const appointmentDate = new Date(a.scheduledDate);
      return appointmentDate.getDate() === day &&
        appointmentDate.getMonth() === currentDate.getMonth() &&
        appointmentDate.getFullYear() === currentDate.getFullYear();
    });
  };

  const handleViewDetails = async (id: string) => {
    try {
      const details = await appointmentService.getViewingDetailsAdmin(id);
      setSelectedAppointmentDetails(details);
    } catch (error) {
      console.error('Failed to load appointment details:', error);
    }
  };

  // Use allAppointments for upcoming section (not paginated list)
  const upcomingAppointments = allAppointments
    .filter(a => a.status === 'PENDING' || a.status === 'CONFIRMED')
    .slice(0, 3);

  // Calendar logic
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  
  // Use allAppointments for calendar dots (not paginated)
  const appointmentDates = allAppointments.map(a => {
    const date = new Date(a.scheduledDate);
    return {
      day: date.getDate(),
      month: date.getMonth(),
      year: date.getFullYear(),
      status: a.status
    };
  }).filter(d => 
    d.month === currentDate.getMonth() && 
    d.year === currentDate.getFullYear()
  );
  
  const hasAppointmentOnDate = (day: number) => {
    return appointmentDates.some(d => d.day === day);
  };
  
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton height={60} />
        <Skeleton height={400} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-red-600" />
            Appointments ({totalItems})
          </h1>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          {(['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                filter === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Calendar + Upcoming */}
        <div className="space-y-6">
          {/* Calendar */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <button 
                onClick={previousMonth} 
                className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h3 className="font-semibold text-gray-900">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <button 
                onClick={nextMonth} 
                className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
              
              {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isToday = day === new Date().getDate() && 
                  currentDate.getMonth() === new Date().getMonth()&&
                  currentDate.getFullYear() === new Date().getFullYear();
                const hasAppointment = hasAppointmentOnDate(day);
                const dayAppointments = getAppointmentsForDate(day);
                
                return (
                  <div key={day} className="relative">
                    <button
                      onClick={() => hasAppointment && handleDateClick(day)}
                      onMouseEnter={() => hasAppointment && setHoveredDate(day)}
                      onMouseLeave={() => setHoveredDate(null)}
                      disabled={!hasAppointment}
                      className={`w-full aspect-square flex items-center justify-center text-sm rounded-lg transition-colors relative ${
                        isToday 
                          ? 'bg-red-600 text-white font-bold' 
                          : hasAppointment
                          ? 'bg-blue-100 text-blue-900 font-semibold hover:bg-blue-200 cursor-pointer'
                          : 'hover:bg-gray-100 text-gray-700 cursor-default'
                      }`}
                    >
                      {day}
                      {hasAppointment && !isToday && (
                        <div className="absolute bottom-1 w-1 h-1 bg-blue-600 rounded-full" />
                      )}
                    </button>
                    
                    {/* Hover Tooltip */}
                    {hoveredDate === day && dayAppointments.length > 0 && (
                      <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 p-3 animate-in fade-in zoom-in-95 duration-150">
                        <div className="text-xs font-semibold text-gray-900 mb-2">
                          {dayAppointments.length} Appointment{dayAppointments.length > 1 ? 's' : ''} on {monthNames[currentDate.getMonth()]} {day}
                        </div>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {dayAppointments.map(a => (
                            <div key={a.id} className="text-xs p-2 bg-gray-50 rounded border border-gray-100">
                              <p className="font-medium text-gray-900 truncate">{a.propertyTitle}</p>
                              <p className="text-gray-500 mt-0.5">{a.scheduledTime} • {a.customerName}</p>
                              <Badge variant={statusVariants[a.status]} className="mt-1 text-xs">
                                {statusLabels[a.status]}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-4">
              Upcoming Appointments ({upcomingAppointments.length})
            </h3>
            <div className="space-y-3">
              {upcomingAppointments.map(appointment => (
                <div key={appointment.id} className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900 text-sm">{appointment.propertyTitle}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {appointment.scheduledDate} at {appointment.scheduledTime}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Customer: <span className="font-medium">{appointment.customerName}</span>
                  </p>
                  <Badge variant={statusVariants[appointment.status]} className="mt-2">
                    {statusLabels[appointment.status]}
                  </Badge>
                </div>
              ))}
              {upcomingAppointments.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No upcoming appointments</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Appointment List */}
        <div className="lg:col-span-2 space-y-4">
          {appointments.map(appointment => (
            <div 
              key={appointment.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
            >
              <div className="flex gap-4 p-4">
                {/* Property Image */}
                <div className="w-32 h-32 shrink-0 rounded-lg overflow-hidden">
                  <img
                    src={appointment.propertyImage}
                    alt={appointment.propertyTitle}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{appointment.propertyTitle}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {appointment.propertyAddress}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Customer rating indicator for completed */}
                      {appointment.status === 'COMPLETED' && appointment.rating && (
                        <div className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-yellow-50 to-amber-50 rounded border border-yellow-300">
                          <span className="text-xs font-bold text-yellow-700">⭐ {appointment.rating}/5</span>
                          <span className="text-xs text-yellow-600 font-semibold">Customer Rating</span>
                        </div>
                      )}
                      <Badge variant={statusVariants[appointment.status]} className="text-xs px-3 py-1">
                        {statusLabels[appointment.status]}
                      </Badge>
                    </div>
                  </div>

                  {/* Schedule & Customer */}
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-red-500" />
                      {appointment.scheduledDate}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-red-500" />
                      {appointment.scheduledTime}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">•</span>
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-700">{appointment.customerName}</span>
                      {appointment.customerTier && (
                        <Badge variant="gold" className="text-[9px]">{appointment.customerTier}</Badge>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4">
                    <button
                      onClick={() => handleViewDetails(appointment.id)}
                      className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      View Details
                    </button>
                    {/* Note: Agent cannot accept PENDING - they get auto-assigned by admin. 
                        They can only decline/cancel if needed */}
                    {appointment.status === 'PENDING' && (
                      <button 
                        onClick={() => openActionModal(appointment.id, 'cancel')}
                        className="px-4 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <X className="w-3.5 h-3.5" />
                        Decline
                      </button>
                    )}
                    {appointment.status === 'CONFIRMED' && (
                      <>
                        <button 
                          onClick={() => openActionModal(appointment.id, 'complete')}
                          className="px-4 py-2 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Mark Complete
                        </button>
                        <button 
                          onClick={() => openActionModal(appointment.id, 'cancel')}
                          className="px-4 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {appointments.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100">
              <CalendarIcon className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
              <p className="text-gray-500 text-sm">Try changing your filter</p>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-4 mt-6">
              <div className="text-sm text-gray-600">
                Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} appointments
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          currentPage === pageNum
                            ? 'bg-red-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-1"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Confirmation Modal */}
      <Modal
        isOpen={showActionModal}
        onClose={() => setShowActionModal(false)}
        title={
          actionType === 'complete' ? 'Complete Appointment' :
          'Decline Appointment'
        }
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            {actionType === 'complete' && 'Are you sure you want to mark this appointment as completed?'}
            {actionType === 'cancel' && 'Are you sure you want to decline/cancel this appointment? This action cannot be undone.'}
          </p>
          
          {actionType === 'cancel' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for cancellation (optional)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please provide a reason..."
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                rows={3}
              />
            </div>
          )}
          
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setShowActionModal(false)}
              className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAction}
              disabled={isProcessing}
              className={`flex-1 py-2.5 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
                actionType === 'cancel' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
              {actionType === 'complete' && 'Complete'}
              {actionType === 'cancel' && 'Yes, Decline'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Details Modal */}
      {selectedAppointmentDetails && (
        <Modal
          isOpen={!!selectedAppointmentDetails}
          onClose={() => setSelectedAppointmentDetails(null)}
          title="Appointment Details"
          size="large"
        >
          <div className="space-y-6">
            {/* Property Header */}
            <div className="flex gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
              <img
                src={getImageUrl(selectedAppointmentDetails.propertyCard?.thumbnailUrl)}
                alt={selectedAppointmentDetails.propertyCard?.title || 'Property'}
                className="w-24 h-24 rounded-lg object-cover shadow-md"
              />
              <div className="flex-1">
                <h3 className="font-bold text-xl text-gray-900 mb-1">{selectedAppointmentDetails.propertyCard?.title}</h3>
                <p className="text-sm text-gray-600 flex items-center gap-1 mb-2">
                  <MapPin className="w-4 h-4" />
                  {selectedAppointmentDetails.propertyCard?.fullAddress}
                </p>
                <div className="flex items-center gap-3">
                  <Badge variant={statusVariants[selectedAppointmentDetails.status]}>
                    {statusLabels[selectedAppointmentDetails.status]}
                  </Badge>
                  {selectedAppointmentDetails.propertyCard?.price && (
                    <span className="text-lg font-bold text-red-600">
                      {selectedAppointmentDetails.propertyCard.price.toLocaleString('vi-VN')} VND
                    </span>
                  )}
                  {selectedAppointmentDetails.propertyCard?.area && (
                    <span className="text-sm text-gray-600">{selectedAppointmentDetails.propertyCard.area} m²</span>
                  )}
                </div>
              </div>
            </div>

            {/* Customer Rating */}
            {selectedAppointmentDetails.rating && (
              <div className="flex items-center gap-2 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <span className="text-sm font-medium text-gray-700">Customer Rating:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span 
                      key={star}
                      className={`text-lg ${star <= selectedAppointmentDetails.rating! ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                {selectedAppointmentDetails.comment && (
                  <span className="text-sm text-gray-600 ml-2">"{selectedAppointmentDetails.comment}"</span>
                )}
              </div>
            )}

            {/* Schedule Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500 mb-1 font-medium">Requested Date</p>
                <p className="font-semibold text-gray-900 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-red-500" />
                  {new Date(selectedAppointmentDetails.requestedDate).toLocaleDateString('en-US', { 
                    year: 'numeric', month: 'short', day: 'numeric' 
                  })}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500 mb-1 font-medium">Time</p>
                <p className="font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-red-500" />
                  {new Date(selectedAppointmentDetails.requestedDate).toLocaleTimeString('en-US', { 
                    hour: '2-digit', minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>

            {/* Customer Info */}
            {selectedAppointmentDetails.customer && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Customer</h4>
                <div className="p-4 border border-gray-200 rounded-lg bg-white">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                      {selectedAppointmentDetails.customer.fullName?.[0] || 'C'}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {selectedAppointmentDetails.customer.fullName}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {selectedAppointmentDetails.customer.tier && (
                          <Badge variant="gold" className="text-xs">{selectedAppointmentDetails.customer.tier}</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        {selectedAppointmentDetails.customer.phoneNumber && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {selectedAppointmentDetails.customer.phoneNumber}
                          </span>
                        )}
                        {selectedAppointmentDetails.customer.email && (
                          <span>{selectedAppointmentDetails.customer.email}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Customer Requirements */}
            {selectedAppointmentDetails.customerRequirements && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Customer Requirements</h4>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-gray-700">{selectedAppointmentDetails.customerRequirements}</p>
                </div>
              </div>
            )}

            {/* Agent Notes */}
            {selectedAppointmentDetails.agentNotes && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Your Notes</h4>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-700">{selectedAppointmentDetails.agentNotes}</p>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Multiple Appointments Modal */}
      {showDateAppointments && (
        <Modal
          isOpen={!!showDateAppointments}
          onClose={() => setShowDateAppointments(null)}
          title={`Appointments on ${monthNames[currentDate.getMonth()]} ${showDateAppointments.date}`}
        >
          <div className="space-y-3">
            <p className="text-sm text-gray-600 mb-4">
              You have {showDateAppointments.appointments.length} appointments scheduled on this date. Select one to view details:
            </p>
            {showDateAppointments.appointments.map(appointment => (
              <button
                key={appointment.id}
                onClick={() => {
                  setShowDateAppointments(null);
                  handleViewDetails(appointment.id);
                }}
                className="w-full text-left p-4 bg-gray-50 hover:bg-blue-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-all"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={appointment.propertyImage}
                    alt={appointment.propertyTitle}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{appointment.propertyTitle}</h4>
                    <p className="text-sm text-gray-500 mt-1">{appointment.customerName}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-gray-600 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {appointment.scheduledTime}
                      </span>
                      <Badge variant={statusVariants[appointment.status]} className="text-xs">
                        {statusLabels[appointment.status]}
                      </Badge>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}
