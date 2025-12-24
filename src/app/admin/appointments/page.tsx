'use client';

import React, { useState } from 'react';
import { Search, Filter, Calendar, CheckCircle, Clock, Star, Smile } from 'lucide-react';
import StatsGrid from '@/app/components/StatsGrid';
import Modal from '@/app/components/ui/Modal';
import LocationPicker from '@/app/components/LocationPicker'; 
import AppointmentTable from '@/app/components/features/admin/appointments/AppointmentTable';
import AppointmentAdvancedSearch from '@/app/components/features/admin/appointments/AppointmentAdvancedSearch';

export default function AppointmentsPage() {
  const [isAdvSearchOpen, setIsAdvSearchOpen] = useState(false);
  const [isLocPickerOpen, setIsLocPickerOpen] = useState(false);
  
  // 1. Thêm State lưu danh sách địa điểm
  const [locations, setLocations] = useState<string[]>([]); 

  const statsData = [
    { title: "Total appointments", value: "72.5M", trend: "+12.5%", icon: Calendar },
    { title: "Completed", value: "2,817", trend: "+8.2%", icon: CheckCircle },
    { title: "Pending", value: "72.5M", trend: "+12.5%", icon: Clock },
    { title: "Average rating", value: "4.8", trend: "+12.5%", icon: Star },
    { title: "Customer satisfaction", value: "96.5%", trend: "+12.5%", icon: Smile },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Appointments</h2>
        <p className="text-sm text-gray-500">View all customers&apos; bookings and assigned to your sales team</p>
      </div>

      <StatsGrid stats={statsData} />

      <div className="space-y-4">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
                type="text"
                placeholder="Project/Property listing name"
                className="w-full pl-12 pr-24 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white"
            />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-1.5 rounded-lg transition-colors text-sm">
                Search
            </button>
          </div>

          <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsAdvSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 bg-white hover:bg-gray-50 font-medium rounded-lg text-sm text-gray-700 transition-all whitespace-nowrap"
              >
                <Filter className="w-4 h-4" />
                Advanced Search
                <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded ml-1">3</span>
              </button>
          </div>
      </div>

      <AppointmentTable />

      {/* MODAL 1: ADVANCED SEARCH */}
      <Modal 
        isOpen={isAdvSearchOpen} 
        onClose={() => {
            if (!isLocPickerOpen) setIsAdvSearchOpen(false);
        }}
        title="Advanced Search"
      >
        <AppointmentAdvancedSearch 
            selectedLocations={locations} 
            onOpenLocationPicker={() => setIsLocPickerOpen(true)}
            onApply={() => setIsAdvSearchOpen(false)}
            onReset={() => setLocations([])} 
        />
      </Modal>

      {/* MODAL 2: LOCATION PICKER */}
      <LocationPicker 
        isOpen={isLocPickerOpen} 
        onClose={() => setIsLocPickerOpen(false)}
        
        initialSelected={locations} 
        
        onConfirm={(newLocations) => {
            setLocations(newLocations); // Cập nhật state cha
            setIsLocPickerOpen(false);  // Đóng modal
        }}
      />
    </div>
  );
}