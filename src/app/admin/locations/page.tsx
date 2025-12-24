'use client';

import React, { useState } from 'react';
import { Search, Filter, MapPin } from 'lucide-react';
import StatsGrid from '@/app/components/StatsGrid';
import Modal from '@/app/components/ui/Modal';
import LocationPicker from '@/app/components/LocationPicker';
import LocationsTable from '@/app/components/features/admin/locations/LocationsTable'; 
import LocationAdvancedSearch from '@/app/components/features/admin/locations/LocationAdvancedSearch';

export default function LocationsPage() {
  const [isAdvSearchOpen, setIsAdvSearchOpen] = useState(false);
  const [isLocPickerOpen, setIsLocPickerOpen] = useState(false);
  
  // 1. Thêm State lưu địa điểm
  const [locations, setLocations] = useState<string[]>([]);

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold text-gray-900 mb-1">Locations Management</h2></div>
      
      <div className="space-y-4">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="text" placeholder="Search locations..." className="w-full pl-12 pr-24 py-3 border border-gray-300 rounded-xl bg-white" />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-600 text-white font-bold px-6 py-1.5 rounded-lg text-sm">Search</button>
          </div>
          <div className="flex items-center gap-3">
              <button onClick={() => setIsAdvSearchOpen(true)} className="flex items-center gap-2 px-3 py-2 border bg-white rounded-lg text-sm font-medium">
                <Filter className="w-4 h-4" /> Advanced Search
              </button>
          </div>
      </div>

      <LocationsTable />

      <Modal isOpen={isAdvSearchOpen} onClose={() => { if (!isLocPickerOpen) setIsAdvSearchOpen(false); }} title="Advanced Search">
        <LocationAdvancedSearch 
            selectedLocations={locations} 
            onRemoveLocation={(loc) => setLocations(prev => prev.filter(l => l !== loc))}
            onOpenLocationPicker={() => setIsLocPickerOpen(true)}
            onApply={() => setIsAdvSearchOpen(false)}
            onReset={() => setLocations([])}
        />
      </Modal>

      <LocationPicker 
        isOpen={isLocPickerOpen} 
        onClose={() => setIsLocPickerOpen(false)}
        initialSelected={locations}
        onConfirm={(newLocs) => {
            setLocations(newLocs);
            setIsLocPickerOpen(false);
        }}
      />
    </div>
  );
}