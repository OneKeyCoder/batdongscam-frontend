'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, Phone, Search, Eye, Check, X } from 'lucide-react';
import Modal from '@/app/components/ui/Modal';
import { assignmentService } from '@/lib/api/services/assignment.service';

type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

interface Appointment {
  id: number;
  propertyId: string;
  propertyName: string;
  propertyImage: string;
  propertyAddress: string;
  customerName: string;
  customerPhone: string;
  date: string;
  time: string;
  status: AppointmentStatus;
}

// Removed mock data - using real API

const statusColors: Record<AppointmentStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function AgentAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [filter, setFilter] = useState<'All' | 'Upcoming' | 'Completed'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmModal, setConfirmModal] = useState<{ type: 'confirm' | 'cancel'; appointment: Appointment } | null>(null);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    setIsLoading(true);
    try {
      const response = await assignmentService.getMyViewingList();
      // Map API response to component interface
      const mappedData: Appointment[] = (response.data || []).map((item: any) => ({
        id: item.id,
        propertyId: item.propertyId || item.id,
        propertyName: item.propertyTitle || 'Untitled Property',
        propertyImage: item.propertyImageUrl || '',
        propertyAddress: item.propertyAddress || '',
        customerName: item.customerName || 'Unknown',
        customerPhone: item.customerPhone || '',
        date: item.appointmentDate || new Date().toISOString().split('T')[0],
        time: item.appointmentTime || '10:00 AM',
        status: item.status || 'PENDING'
      }));
      setAppointments(mappedData);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAppointments = appointments.filter(a => {
    const matchesSearch = a.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          a.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = 
      filter === 'All' ? true :
      filter === 'Upcoming' ? (a.status === 'PENDING' || a.status === 'CONFIRMED') :
      filter === 'Completed' ? (a.status === 'COMPLETED' || a.status === 'CANCELLED') :
      true;
    return matchesSearch && matchesFilter;
  });

  // Group by date
  const groupedAppointments = filteredAppointments.reduce((groups, apt) => {
    const date = apt.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(apt);
    return groups;
  }, {} as Record<string, Appointment[]>);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  const handleConfirm = (appointment: Appointment) => {
    setAppointments(apps => apps.map(a => 
      a.id === appointment.id ? { ...a, status: 'CONFIRMED' as AppointmentStatus } : a
    ));
    setConfirmModal(null);
  };

  const handleCancel = (appointment: Appointment) => {
    setAppointments(apps => apps.map(a => 
      a.id === appointment.id ? { ...a, status: 'CANCELLED' as AppointmentStatus } : a
    ));
    setConfirmModal(null);
  };

  const handleComplete = (appointment: Appointment) => {
    setAppointments(apps => apps.map(a => 
      a.id === appointment.id ? { ...a, status: 'COMPLETED' as AppointmentStatus } : a
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-gray-700" />
          Appointments
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage your property viewing appointments
        </p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search appointments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 text-gray-900 placeholder-gray-400"
          />
        </div>
        
        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
          {(['All', 'Upcoming', 'Completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                filter === f 
                  ? 'bg-gray-100 text-gray-900' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-6">
        {Object.entries(groupedAppointments).sort().map(([date, dateAppointments]) => (
          <div key={date}>
            {/* Date Header */}
            <div className="flex items-center gap-2 mb-3 text-gray-500 text-sm">
              <Calendar className="w-4 h-4" />
              {formatDate(date)}
            </div>

            {/* Appointments for this date */}
            <div className="space-y-3">
              {dateAppointments.map((appointment) => (
                <div 
                  key={appointment.id}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-4"
                >
                  <div className="flex items-center gap-4">
                    {/* Time */}
                    <div className="flex items-center gap-2 min-w-[80px]">
                      <Clock className="w-4 h-4 text-red-500" />
                      <div className="text-sm">
                        <p className="font-bold text-gray-900">{appointment.time.split(' ')[0]}</p>
                        <p className="text-gray-500">{appointment.time.split(' ')[1]}</p>
                      </div>
                    </div>

                    {/* Property Image */}
                    <img
                      src={appointment.propertyImage}
                      alt={appointment.propertyName}
                      className="w-16 h-12 rounded-lg object-cover"
                    />

                    {/* Property Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{appointment.propertyName}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-red-500" />
                        {appointment.propertyAddress}
                      </p>
                    </div>

                    {/* Customer Info */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-500" />
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{appointment.customerName}</p>
                        <p className="text-xs text-gray-500">{appointment.customerPhone}</p>
                      </div>
                    </div>

                    {/* Status */}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[appointment.status]}`}>
                      {appointment.status}
                    </span>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSelectedAppointment(appointment)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      {appointment.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => setConfirmModal({ type: 'confirm', appointment })}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Confirm"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setConfirmModal({ type: 'cancel', appointment })}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      
                      {appointment.status === 'CONFIRMED' && (
                        <>
                          <button
                            onClick={() => handleComplete(appointment)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Mark Complete"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setConfirmModal({ type: 'cancel', appointment })}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredAppointments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-gray-100">
          <Calendar className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
          <p className="text-gray-500 text-sm">Try adjusting your search or filter</p>
        </div>
      )}

      {/* Details Modal */}
      {selectedAppointment && (
        <Modal
          isOpen={!!selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          title="Appointment Details"
        >
          <div className="space-y-4">
            {/* Property */}
            <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
              <img
                src={selectedAppointment.propertyImage}
                alt={selectedAppointment.propertyName}
                className="w-20 h-16 rounded-lg object-cover"
              />
              <div>
                <h4 className="font-semibold text-gray-900">{selectedAppointment.propertyName}</h4>
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" />
                  {selectedAppointment.propertyAddress}
                </p>
              </div>
            </div>

            {/* Schedule */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Date
                </p>
                <p className="font-medium text-gray-900 mt-1">{formatDate(selectedAppointment.date)}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Time
                </p>
                <p className="font-medium text-gray-900 mt-1">{selectedAppointment.time}</p>
              </div>
            </div>

            {/* Customer */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <p className="text-xs text-gray-500 mb-2">Customer</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{selectedAppointment.customerName}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {selectedAppointment.customerPhone}
                  </p>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Status:</span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[selectedAppointment.status]}`}>
                {selectedAppointment.status}
              </span>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmation Dialog */}
      {confirmModal && (
        <Modal
          isOpen={!!confirmModal}
          onClose={() => setConfirmModal(null)}
          title={confirmModal.type === 'confirm' ? 'Confirm Appointment' : 'Cancel Appointment'}
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              {confirmModal.type === 'confirm' 
                ? 'Are you sure you want to confirm this viewing appointment?' 
                : 'Are you sure you want to cancel this viewing appointment? This action cannot be undone.'}
            </p>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-900">{confirmModal.appointment.propertyName}</p>
              <p className="text-sm text-gray-500">{confirmModal.appointment.customerName} - {confirmModal.appointment.time}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal(null)}
                className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmModal.type === 'confirm' 
                  ? handleConfirm(confirmModal.appointment) 
                  : handleCancel(confirmModal.appointment)}
                className={`flex-1 py-2.5 text-sm font-medium text-white rounded-lg transition-colors ${
                  confirmModal.type === 'confirm' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {confirmModal.type === 'confirm' ? 'Confirm' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
