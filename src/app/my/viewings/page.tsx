'use client';

import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';
import Modal from '@/app/components/ui/Modal';
import { appointmentService, ViewingCard, ViewingDetails } from '@/lib/api/services/appointment.service';
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
}

const statusVariants: Record<ViewingStatus, 'warning' | 'info' | 'success' | 'danger'> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  COMPLETED: 'success',
  CANCELLED: 'danger',
};

const statusLabels: Record<ViewingStatus, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Assigned',
  COMPLETED: 'Done',
  CANCELLED: 'Cancelled',
};

export default function ViewingsPage() {
  const [viewings, setViewings] = useState<Viewing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedViewingDetails, setSelectedViewingDetails] = useState<ViewingDetails | null>(null);
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Assigned' | 'Done' | 'Cancelled'>('All');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [hoveredDate, setHoveredDate] = useState<number | null>(null);
  const [showDateViewings, setShowDateViewings] = useState<{date: number, viewings: Viewing[]} | null>(null);

  const getImageUrl = (path?: string) => {
    if (!path) {
      // Random placeholder for empty paths
      const placeholders = [
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400',
      ];
      return placeholders[Math.floor(Math.random() * placeholders.length)];
    }
    
    // If it's already a full URL, return it
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    
    // For relative paths (like /uploads/...), fallback to placeholder
    // since backend images are not accessible
    const placeholders = [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400',
    ];
    // Use path hash to get consistent image for same property
    const hash = path.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return placeholders[hash % placeholders.length];
  };

  useEffect(() => {
    loadViewings();
  }, []);

  const loadViewings = async () => {
    setIsLoading(true);
    try {
      const data = await appointmentService.getViewingCards();
      console.log('Raw API response:', data);
      console.log('First viewing:', data[0]);
      
      const mappedData: Viewing[] = data.map(v => {
        console.log('Mapping viewing:', v);
        
        // Format date and time from requestedDate
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
        
        // Build address from district and city
        const address = [v.districtName, v.cityName].filter(Boolean).join(', ') || 'Address not available';
        
        return {
          id: v.id,
          propertyTitle: v.title,
          propertyImage: getImageUrl(v.thumbnailUrl),
          propertyAddress: address,
          scheduledDate: formattedDate,
          scheduledTime: formattedTime,
          status: v.status,
          agentName: 'TBA', // Not provided by backend
          price: v.priceAmount ? `$${v.priceAmount.toLocaleString()}` : undefined,
          area: v.area ? `${v.area} m²` : undefined,
        };
      });
      console.log('Mapped viewings:', mappedData);
      setViewings(mappedData);
    } catch (error) {
      console.error('Failed to load viewings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelViewing = async (id: string) => {
    try {
      await appointmentService.cancelAppointment(id);
      await loadViewings();
    } catch (error) {
      console.error('Failed to cancel viewing:', error);
    }
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(clickedDate);
    
    // Filter viewings for this date
    const dateViewings = viewings.filter(v => {
      const viewingDate = new Date(v.scheduledDate);
      return viewingDate.getDate() === day &&
        viewingDate.getMonth() === currentDate.getMonth() &&
        viewingDate.getFullYear() === currentDate.getFullYear();
    });
    
    // If there's only one viewing, open it directly
    if (dateViewings.length === 1) {
      handleViewDetails(dateViewings[0].id);
    } else if (dateViewings.length > 1) {
      // Show list to choose from
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
    if (filter === 'Assigned') return v.status === 'CONFIRMED';
    if (filter === 'Done') return v.status === 'COMPLETED';
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
  
  // Get dates that have viewings
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
            Viewing Requests ({viewings.length})
          </h1>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          {(['All', 'Pending', 'Assigned', 'Done', 'Cancelled'] as const).map((tab) => (
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
                        {/* Arrow */}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
                          <div className="w-2 h-2 bg-white border-r border-b border-gray-200 transform rotate-45"></div>
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
                    <div>
                      <h3 className="font-bold text-gray-900">{viewing.propertyTitle}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {viewing.propertyAddress}
                      </p>
                    </div>
                    <Badge variant={statusVariants[viewing.status]}>
                      {statusLabels[viewing.status]}
                    </Badge>
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
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">Agent:</span>
                      {viewing.agentName}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4">
                    <button
                      onClick={() => handleViewDetails(viewing.id)}
                      className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Detail
                    </button>
                    {(viewing.status === 'PENDING' || viewing.status === 'CONFIRMED') && (
                      <button 
                        onClick={() => handleCancelViewing(viewing.id)}
                        className="px-4 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        Cancel
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
                      ${selectedViewingDetails.priceAmount.toLocaleString()}
                    </span>
                  )}
                  {selectedViewingDetails.area && (
                    <span className="text-sm text-gray-600">{selectedViewingDetails.area} m²</span>
                  )}
                </div>
              </div>
            </div>

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

            {/* Property Features */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Property Features</h4>
              <div className="grid grid-cols-2 gap-3">
                {selectedViewingDetails.rooms && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 text-xs font-bold">R</span>
                      </div>
                      <p className="text-xs text-gray-500">Rooms</p>
                    </div>
                    <p className="font-semibold text-gray-900">{selectedViewingDetails.rooms}</p>
                  </div>
                )}
                {selectedViewingDetails.bedRooms && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <span className="text-purple-600 text-xs font-bold">B</span>
                      </div>
                      <p className="text-xs text-gray-500">Bedrooms</p>
                    </div>
                    <p className="font-semibold text-gray-900">{selectedViewingDetails.bedRooms}</p>
                  </div>
                )}
                {selectedViewingDetails.bathRooms && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center">
                        <span className="text-cyan-600 text-xs font-bold">🚿</span>
                      </div>
                      <p className="text-xs text-gray-500">Bathrooms</p>
                    </div>
                    <p className="font-semibold text-gray-900">{selectedViewingDetails.bathRooms}</p>
                  </div>
                )}
                {selectedViewingDetails.floors && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <span className="text-orange-600 text-xs font-bold">F</span>
                      </div>
                      <p className="text-xs text-gray-500">Floors</p>
                    </div>
                    <p className="font-semibold text-gray-900">{selectedViewingDetails.floors}</p>
                  </div>
                )}
              </div>
            </div>

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

            {/* Property Owner */}
            {selectedViewingDetails.propertyOwner && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Property Owner</h4>
                <div className="p-4 border border-gray-200 rounded-lg bg-white">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                      {selectedViewingDetails.propertyOwner.firstName?.[0]}{selectedViewingDetails.propertyOwner.lastName?.[0]}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {selectedViewingDetails.propertyOwner.firstName} {selectedViewingDetails.propertyOwner.lastName}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="success" className="text-xs">{selectedViewingDetails.propertyOwner.tier}</Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{selectedViewingDetails.propertyOwner.phoneNumber}</p>
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

            {/* Attached Documents */}
            {selectedViewingDetails.attachedDocuments && selectedViewingDetails.attachedDocuments.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Attached Documents</h4>
                <div className="space-y-2">
                  {selectedViewingDetails.attachedDocuments.map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
                          <span className="text-red-600 text-xs font-bold">📄</span>
                        </div>
                        <span className="text-sm text-gray-700">{doc.split('/').pop()}</span>
                      </div>
                      <button className="text-blue-600 hover:text-blue-700 text-xs font-medium">
                        Download
                      </button>
                    </div>
                  ))}
                </div>
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
