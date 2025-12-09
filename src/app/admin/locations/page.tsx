'use client';

import React, { useState } from 'react';
import { Map, MapPin, Users, Building2, TrendingUp, PlusCircle, Search, Filter, ChevronDown } from 'lucide-react';
import StatsGrid from '@/app/components/StatsGrid';
import LocationsTable from '@/app/components/features/locations/LocationsTable';
import LocationPicker from '@/app/components/LocationPicker'; 
import LocationAdvancedSearch from '@/app/components/features/locations/LocationAdvancedSearch'; 
import Modal from '@/app/components/ui/Modal'; 

export default function LocationsPage() {
  const [isAdvSearchOpen, setIsAdvSearchOpen] = useState(false);
  const [isLocPickerOpen, setIsLocPickerOpen] = useState(false);

  // Stats Data...
  const statsData = [
    { title: "Cities", value: "72.5M", trend: "+12.5%", icon: Building2 },
    { title: "Districts", value: "2,817", trend: "+8.2%", icon: Map },
    { title: "Wards", value: "72.5M", trend: "+12.5%", icon: MapPin },
    { title: "Population", value: "72.5M", trend: "+12.5%", icon: Users },
    { title: "Average land price", value: "72.5M", trend: "+12.5%", icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Locations Management</h2>
        <p className="text-sm text-gray-500">Manage all your Locations</p>
      </div>
      <StatsGrid stats={statsData} />

      {/* Filter Section */}
      <div className="space-y-4">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
                type="text"
                placeholder="Location's name"
                className="w-full pl-12 pr-20 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white"
            />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-1.5 rounded-lg transition-colors text-sm">
                Search
            </button>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3 w-full md:w-auto">
                  <button 
                    onClick={() => setIsAdvSearchOpen(true)}
                    className="flex items-center gap-2 px-3 py-2 border border-gray-300 bg-white hover:bg-gray-50 font-medium rounded-lg text-sm text-gray-700 transition-all whitespace-nowrap"
                  >
                    <Filter className="w-4 h-4" />
                    Advanced Search
                    <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded ml-1">3</span>
                  </button>
                  {/* ... City Dropdown ... */}
                  <div className="relative group">
                      <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 bg-white hover:bg-gray-50 font-medium rounded-lg text-sm text-gray-700 transition-all min-w-[120px] justify-between">
                          City
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                      </button>
                  </div>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors shrink-0 text-sm">
                 <PlusCircle className="w-4 h-4" />
                 Add Location
              </button>
          </div>
      </div>

      <LocationsTable />

      {/* --- MODAL 1: FORM SEARCH --- */}
      <Modal 
        isOpen={isAdvSearchOpen} 
        onClose={() => {
            // FIX: Chỉ đóng Modal A nếu Modal B KHÔNG mở
            // Lý do: Khi click backdrop của Modal B để đóng nó, sự kiện đó cũng lan tới backdrop của Modal A
            if (!isLocPickerOpen) {
                setIsAdvSearchOpen(false);
            }
        }}
        title="Advanced Search"
      >
        <LocationAdvancedSearch 
           onOpenLocationPicker={() => setIsLocPickerOpen(true)}
           onApply={() => {
               console.log("Applied");
               setIsAdvSearchOpen(false);
           }}
           onReset={() => console.log("Reset")}
        />
      </Modal>

      {/* --- MODAL 2: PICKER --- */}
      <LocationPicker 
        isOpen={isLocPickerOpen} 
        onClose={() => setIsLocPickerOpen(false)} 
        onSelect={(val) => {
            console.log("Selected:", val);
            setIsLocPickerOpen(false); 
        }}
      />
    </div>
  );
}