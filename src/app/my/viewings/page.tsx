'use client';

import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, ChevronLeft, ChevronRight, Star, X, Loader2 } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';
import Modal from '@/app/components/ui/Modal';
import { appointmentService, ViewingCard, ViewingDetailsCustomer, RateAppointmentRequest } from '@/lib/api/services/appointment.service';
import Skeleton from '@/app/components/ui/Skeleton';

type ViewingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

interface Viewing {
  id: string;
  propertyTitle: string;
  propertyImage: string;
  propertyAddress: string;
  scheduledDate: string;
  scheduledTime: string;
  status: ViewingStatus;
  agentName: string;
  price?: string;
  area?: string;
  // Rating info from viewing details
  rating?: number;
  comment?: string;
  // Full details for modal
  fullAddress?: string;
  description?: string;
  customerRequirements?: string;
  salesAgent?: {
    id: string;
    firstName?: string;
    lastName?: string;
    tier?: string;
    rating?: number;
    totalRates?: number;
    phoneNumber?: string;
  };
}

const statusVariants: Record<ViewingStatus, 'warning' | 'info' | 'success' | 'danger'> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  COMPLETED: 'success',
  CANCELLED: 'danger',
};

const statusLabels: Record<ViewingStatus, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export default function ViewingsPage() {
  const [viewings, setViewings] = useState<Viewing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedViewingDetails, setSelectedViewingDetails] = useState<ViewingDetailsCustomer | null>(null);
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled'>('All');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [hoveredDate, setHoveredDate] = useState<number | null>(null);
  const [showDateViewings, setShowDateViewings] = useState<{date: number, viewings: Viewing[]} | null>(null);
  
  // Cancel modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  
  // Rate modal state
  const [showRateModal, setShowRateModal] = useState(false);
  const [ratingId, setRatingId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [isRating, setIsRating] = useState(false);
  
  // Total viewings count
  const [totalViewings, setTotalViewings] = useState(0);

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

  useEffect(() => {
    loadViewings();
  }, []);

  const loadViewings = async () => {
    setIsLoading(true);
    try {
      // Fetch all viewing cards - no need to fetch details for each
      // Backend now returns rating, comment, and agentName in viewing cards
      const response = await appointmentService.getViewingCards({ limit: 100 });
      const cardsData = response.data || [];
      
      const mappedData: Viewing[] = cardsData.map((v: ViewingCard) => {
        const requestedDate = new Date(v.requestedDate);
        const formattedDate = requestedDate.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
        const formattedTime = requestedDate.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
        
        const address = [v.districtName, v.cityName].filter(Boolean).join(', ') || 'Address not available';
        
        return {
          id: v.id,
          propertyTitle: v.title,
          propertyImage: getImageUrl(v.thumbnailUrl),
          propertyAddress: address,
          scheduledDate: formattedDate,
          scheduledTime: formattedTime,
          status: v.status,
          agentName: v.agentName || 'TBA',
          price: v.priceAmount ? `${v.priceAmount.toLocaleString('vi-VN')} VND` : undefined,
          area: v.area ? `${v.area} m²` : undefined,
          // Rating info now comes from viewing card API
          rating: v.rating,
          comment: v.comment,
        };
      });
      setViewings(mappedData);
      // Store total count from API if available
      if (response.paging?.total) {
        setTotalViewings(response.paging.total);
      } else {
        setTotalViewings(mappedData.length);
      }
    } catch (error) {
      console.error('Failed to load viewings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openCancelModal = (id: string) => {
    setCancellingId(id);
    setCancelReason('');
    setShowCancelModal(true);
  };

  const handleCancelViewing = async () => {
    if (!cancellingId) return;
    
    setIsCancelling(true);
    try {
      await appointmentService.cancelAppointment(cancellingId, cancelReason || undefined);
      await loadViewings();
      setShowCancelModal(false);
      setCancellingId(null);
    } catch (error) {
      console.error('Failed to cancel viewing:', error);
    } finally {
      setIsCancelling(false);
    }
  };

  const openRateModal = (id: string, existingRating?: number, existingComment?: string) => {
    setRatingId(id);
    setRating(existingRating || 5);
    setRatingComment(existingComment || '');
    setShowRateModal(true);
  };

  const handleRateAppointment = async () => {
    if (!ratingId) return;
    
    setIsRating(true);
    try {
      await appointmentService.rateAppointment(ratingId, { rating, comment: ratingComment || undefined });
      await loadViewings();
      setShowRateModal(false);
      setRatingId(null);
      // Refresh details if open
      if (selectedViewingDetails && selectedViewingDetails.id === ratingId) {
        const details = await appointmentService.getViewingDetails(ratingId);
        setSelectedViewingDetails(details);
      }
    } catch (error) {
      console.error('Failed to rate appointment:', error);
    } finally {
      setIsRating(false);
    }
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(clickedDate);
    
    const dateViewings = viewings.filter(v => {
      const viewingDate = new Date(v.scheduledDate);
      return viewingDate.getDate() === day &&
        viewingDate.getMonth() === currentDate.getMonth() &&
        viewingDate.getFullYear() === currentDate.getFullYear();
    });
    
    if (dateViewings.length === 1) {
      handleViewDetails(dateViewings[0].id);
    } else if (dateViewings.length > 1) {
      setShowDateViewings({ date: day, viewings: dateViewings });
    }
  };

  const getViewingsForDate = (day: number): Viewing[] => {
    return viewings.filter(v => {
      const viewingDate = new Date(v.scheduledDate);
      return viewingDate.getDate() === day &&
        viewingDate.getMonth() === currentDate.getMonth() &&
        viewingDate.getFullYear() === currentDate.getFullYear();
    });
  };

  const handleViewDetails = async (id: string) => {
    try {
      const details = await appointmentService.getViewingDetails(id);
      setSelectedViewingDetails(details);
    } catch (error) {
      console.error('Failed to load viewing details:', error);
    }
  };

  const filteredViewings = viewings.filter(v => {
    if (filter === 'All') return true;
    if (filter === 'Pending') return v.status === 'PENDING';
    if (filter === 'Confirmed') return v.status === 'CONFIRMED';
    if (filter === 'Completed') return v.status === 'COMPLETED';
    if (filter === 'Cancelled') return v.status === 'CANCELLED';
    return true;
  });

  const upcomingViewings = viewings
    .filter(v => v.status === 'PENDING' || v.status === 'CONFIRMED')
    .slice(0, 2);

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
  
  const viewingDates = viewings.map(v => {
    const date = new Date(v.scheduledDate);
    return {
      day: date.getDate(),
      month: date.getMonth(),
      year: date.getFullYear(),
      status: v.status
    };
  }).filter(d => 
    d.month === currentDate.getMonth() && 
    d.year === currentDate.getFullYear()
  );
  
  const hasViewingOnDate = (day: number) => {
    return viewingDates.some(d => d.day === day);
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
            Viewing Requests ({totalViewings})
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
                const hasViewing = hasViewingOnDate(day);
                const dayViewings = getViewingsForDate(day);
                
                return (
                  <div key={day} className="relative">
                    <button
                      onClick={() => hasViewing && handleDateClick(day)}
                      onMouseEnter={() => hasViewing && setHoveredDate(day)}
                      onMouseLeave={() => setHoveredDate(null)}
                      disabled={!hasViewing}
                      className={`w-full aspect-square flex items-center justify-center text-sm rounded-lg transition-colors relative ${
                        isToday 
                          ? 'bg-red-600 text-white font-bold' 
                          : hasViewing
                          ? 'bg-blue-100 text-blue-900 font-semibold hover:bg-blue-200 cursor-pointer'
                          : 'hover:bg-gray-100 text-gray-700 cursor-default'
                      }`}
                    >
                      {day}
                      {hasViewing && !isToday && (
                        <div className="absolute bottom-1 w-1 h-1 bg-blue-600 rounded-full" />
                      )}
                    </button>
                    
                    {/* Hover Tooltip */}
                    {hoveredDate === day && dayViewings.length > 0 && (
                      <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 p-3 animate-in fade-in zoom-in-95 duration-150">
                        <div className="text-xs font-semibold text-gray-900 mb-2">
                          {dayViewings.length} Viewing{dayViewings.length > 1 ? 's' : ''} on {monthNames[currentDate.getMonth()]} {day}
                        </div>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {dayViewings.map(v => (
                            <div key={v.id} className="text-xs p-2 bg-gray-50 rounded border border-gray-100">
                              <p className="font-medium text-gray-900 truncate">{v.propertyTitle}</p>
                              <p className="text-gray-500 mt-0.5">{v.scheduledTime}</p>
                              <Badge variant={statusVariants[v.status]} className="mt-1 text-xs">
                                {statusLabels[v.status]}
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

          {/* Upcoming Viewings */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-4">
              Upcoming Viewings ({upcomingViewings.length})
            </h3>
            <div className="space-y-3">
              {upcomingViewings.map(viewing => (
                <div key={viewing.id} className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900 text-sm">{viewing.propertyTitle}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {viewing.scheduledDate} at {viewing.scheduledTime}
                  </p>
                  {viewing.agentName && viewing.agentName !== 'TBA' && (
                    <p className="text-xs text-gray-600 mt-1">
                      Agent: <span className="font-medium">{viewing.agentName}</span>
                    </p>
                  )}
                  <Badge variant={statusVariants[viewing.status]} className="mt-2">
                    {statusLabels[viewing.status]}
                  </Badge>
                </div>
              ))}
              {upcomingViewings.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No upcoming viewings</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Viewing List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredViewings.map(viewing => (
            <div 
              key={viewing.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
            >
              <div className="flex gap-4 p-4">
                {/* Property Image */}
                <div className="w-32 h-32 shrink-0 rounded-lg overflow-hidden">
                  <img
                    src={viewing.propertyImage}
                    alt={viewing.propertyTitle}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{viewing.propertyTitle}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {viewing.propertyAddress}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Rating indicator - shown next to status for completed viewings */}
                      {viewing.status === 'COMPLETED' && viewing.rating && (
                        <div className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-yellow-50 to-amber-50 rounded border border-yellow-300">
                          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-bold text-yellow-700">{viewing.rating}/5</span>
                          <span className="text-xs text-yellow-600 font-semibold">Rated</span>
                        </div>
                      )}
                      <Badge variant={statusVariants[viewing.status]} className="text-xs px-3 py-1">
                        {statusLabels[viewing.status]}
                      </Badge>
                    </div>
                  </div>

                  {/* Schedule */}
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-red-500" />
                      {viewing.scheduledDate}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-red-500" />
                      {viewing.scheduledTime}
                    </div>
                    {viewing.agentName && viewing.agentName !== 'TBA' && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">•</span>
                        <span className="font-medium text-gray-700">Agent: {viewing.agentName}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions - Clean and clear */}
                  <div className="flex items-center gap-2 mt-4">
                    <button
                      onClick={() => handleViewDetails(viewing.id)}
                      className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      View Details
                    </button>
                    {viewing.status === 'COMPLETED' && (
                      <button 
                        onClick={() => openRateModal(viewing.id, viewing.rating, viewing.comment)}
                        className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                          viewing.rating 
                            ? 'text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200' 
                            : 'text-yellow-700 bg-yellow-50 hover:bg-yellow-100 border border-yellow-200'
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${viewing.rating ? 'text-amber-500' : 'fill-yellow-400 text-yellow-400'}`} />
                        {viewing.rating ? 'Edit Rating' : 'Rate Experience'}
                      </button>
                    )}
                    {(viewing.status === 'PENDING' || viewing.status === 'CONFIRMED') && (
                      <button 
                        onClick={() => openCancelModal(viewing.id)}
                        className="px-4 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        Cancel Viewing
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredViewings.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100">
              <CalendarIcon className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No viewings found</h3>
              <p className="text-gray-500 text-sm">Try changing your filter</p>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Viewing"
      >
        <div className="space-y-4">
          <p className="text-gray-600">Are you sure you want to cancel this viewing appointment?</p>
          
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
          
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setShowCancelModal(false)}
              className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Keep Appointment
            </button>
            <button
              onClick={handleCancelViewing}
              disabled={isCancelling}
              className="flex-1 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isCancelling && <Loader2 className="w-4 h-4 animate-spin" />}
              Cancel Viewing
            </button>
          </div>
        </div>
      </Modal>

      {/* Rate Modal */}
      <Modal
        isOpen={showRateModal}
        onClose={() => setShowRateModal(false)}
        title="Rate Your Experience"
      >
        <div className="space-y-4">
          <p className="text-gray-600">How was your viewing experience?</p>
          
          {/* Star Rating */}
          <div className="flex items-center justify-center gap-2 py-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star 
                  className={`w-8 h-8 ${
                    star <= rating 
                      ? 'fill-yellow-400 text-yellow-400' 
                      : 'text-gray-300'
                  }`} 
                />
              </button>
            ))}
          </div>
          <p className="text-center text-sm text-gray-500">
            {rating === 1 && 'Poor'}
            {rating === 2 && 'Fair'}
            {rating === 3 && 'Good'}
            {rating === 4 && 'Very Good'}
            {rating === 5 && 'Excellent'}
          </p>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comment (optional)
            </label>
            <textarea
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              placeholder="Share your feedback..."
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              rows={3}
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setShowRateModal(false)}
              className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleRateAppointment}
              disabled={isRating}
              className="flex-1 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isRating && <Loader2 className="w-4 h-4 animate-spin" />}
              Submit Rating
            </button>
          </div>
        </div>
      </Modal>

      {/* Details Modal */}
      {selectedViewingDetails && (
        <Modal
          isOpen={!!selectedViewingDetails}
          onClose={() => setSelectedViewingDetails(null)}
          title="Viewing Details"
          size="large"
        >
          <div className="space-y-6">
            {/* Property Header */}
            <div className="flex gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
              <img
                src={getImageUrl(selectedViewingDetails.imagesList?.[0] || selectedViewingDetails.thumbnailUrl)}
                alt={selectedViewingDetails.title}
                className="w-24 h-24 rounded-lg object-cover shadow-md"
              />
              <div className="flex-1">
                <h3 className="font-bold text-xl text-gray-900 mb-1">{selectedViewingDetails.title}</h3>
                <p className="text-sm text-gray-600 flex items-center gap-1 mb-2">
                  <MapPin className="w-4 h-4" />
                  {selectedViewingDetails.fullAddress}
                </p>
                <div className="flex items-center gap-3">
                  <Badge variant={statusVariants[selectedViewingDetails.status]}>
                    {statusLabels[selectedViewingDetails.status]}
                  </Badge>
                  {selectedViewingDetails.priceAmount && (
                    <span className="text-lg font-bold text-red-600">
                      {selectedViewingDetails.priceAmount.toLocaleString('vi-VN')} VND
                    </span>
                  )}
                  {selectedViewingDetails.area && (
                    <span className="text-sm text-gray-600">{selectedViewingDetails.area} m²</span>
                  )}
                </div>
              </div>
            </div>

            {/* Rating Display */}
            {selectedViewingDetails.rating && (
              <div className="flex items-center gap-2 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <span className="text-sm font-medium text-gray-700">Your Rating:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star}
                      className={`w-5 h-5 ${
                        star <= selectedViewingDetails.rating! 
                          ? 'fill-yellow-400 text-yellow-400' 
                          : 'text-gray-300'
                      }`} 
                    />
                  ))}
                </div>
                {selectedViewingDetails.comment && (
                  <span className="text-sm text-gray-600 ml-2">"{selectedViewingDetails.comment}"</span>
                )}
              </div>
            )}

            {/* Schedule Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500 mb-1 font-medium">Requested Date</p>
                <p className="font-semibold text-gray-900 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-red-500" />
                  {new Date(selectedViewingDetails.requestedDate).toLocaleDateString('en-US', { 
                    year: 'numeric', month: 'short', day: 'numeric' 
                  })}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500 mb-1 font-medium">Time</p>
                <p className="font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-red-500" />
                  {new Date(selectedViewingDetails.requestedDate).toLocaleTimeString('en-US', { 
                    hour: '2-digit', minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>

            {/* Description */}
            {selectedViewingDetails.description && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Description</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{selectedViewingDetails.description}</p>
              </div>
            )}

            {/* Sales Agent */}
            {selectedViewingDetails.salesAgent && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Sales Agent</h4>
                <div className="p-4 border border-gray-200 rounded-lg bg-white">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                      {selectedViewingDetails.salesAgent.firstName?.[0]}{selectedViewingDetails.salesAgent.lastName?.[0]}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {selectedViewingDetails.salesAgent.firstName} {selectedViewingDetails.salesAgent.lastName}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="info" className="text-xs">{selectedViewingDetails.salesAgent.tier}</Badge>
                        {selectedViewingDetails.salesAgent.rating && (
                          <span className="text-xs text-yellow-600 flex items-center gap-1">
                            ⭐ {selectedViewingDetails.salesAgent.rating.toFixed(1)} ({selectedViewingDetails.salesAgent.totalRates} reviews)
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{selectedViewingDetails.salesAgent.phoneNumber}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Customer Requirements */}
            {selectedViewingDetails.customerRequirements && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Your Requirements</h4>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-gray-700">{selectedViewingDetails.customerRequirements}</p>
                </div>
              </div>
            )}

            {/* Actions */}
            {selectedViewingDetails.status === 'COMPLETED' && !selectedViewingDetails.rating && (
              <div className="pt-4 border-t">
                <button
                  onClick={() => {
                    setSelectedViewingDetails(null);
                    openRateModal(selectedViewingDetails.id);
                  }}
                  className="w-full py-3 text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Star className="w-4 h-4" />
                  Rate This Experience
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Multiple Viewings Modal */}
      {showDateViewings && (
        <Modal
          isOpen={!!showDateViewings}
          onClose={() => setShowDateViewings(null)}
          title={`Viewings on ${monthNames[currentDate.getMonth()]} ${showDateViewings.date}`}
        >
          <div className="space-y-3">
            <p className="text-sm text-gray-600 mb-4">
              You have {showDateViewings.viewings.length} viewings scheduled on this date. Select one to view details:
            </p>
            {showDateViewings.viewings.map(viewing => (
              <button
                key={viewing.id}
                onClick={() => {
                  setShowDateViewings(null);
                  handleViewDetails(viewing.id);
                }}
                className="w-full text-left p-4 bg-gray-50 hover:bg-blue-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-all"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={viewing.propertyImage}
                    alt={viewing.propertyTitle}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{viewing.propertyTitle}</h4>
                    <p className="text-sm text-gray-500 mt-1">{viewing.propertyAddress}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-gray-600 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {viewing.scheduledTime}
                      </span>
                      <Badge variant={statusVariants[viewing.status]} className="text-xs">
                        {statusLabels[viewing.status]}
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
