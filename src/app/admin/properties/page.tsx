'use client';

import React, { useState } from 'react';
import { Search, Filter, Home, Layout, Building2, MapPin } from 'lucide-react';
import StatsGrid from '@/app/components/StatsGrid';
import Modal from '@/app/components/ui/Modal';
import LocationPicker from '@/app/components/LocationPicker';
import PropertiesTable from '@/app/components/features/admin/properties/PropertiesTable'; 
import AdvancedSearchForm from '@/app/components/features/admin/properties/AdvancedSearchForm';

export default function PropertiesPage() {
  const [isAdvSearchOpen, setIsAdvSearchOpen] = useState(false);
  const [isLocPickerOpen, setIsLocPickerOpen] = useState(false);
  const [locations, setLocations] = useState<string[]>([]);

  const stats = [
    { title: "Total properties", value: "1,234", trend: "+5.2%", icon: Home },
    { title: "For Sale", value: "850", trend: "+3.1%", icon: Building2 },
    { title: "For Rent", value: "384", trend: "+12.5%", icon: Layout },
    { title: "Locations", value: "24", trend: "", icon: MapPin },
  ];

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold text-gray-900 mb-1">Properties</h2></div>
      <StatsGrid stats={stats} />

      <div className="space-y-4">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="text" placeholder="Search properties..." className="w-full pl-12 pr-24 py-3 border border-gray-300 rounded-xl bg-white" />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-600 text-white font-bold px-6 py-1.5 rounded-lg text-sm">Search</button>
          </div>
          <div className="flex items-center gap-3">
              <button onClick={() => setIsAdvSearchOpen(true)} className="flex items-center gap-2 px-3 py-2 border bg-white rounded-lg text-sm font-medium">
                <Filter className="w-4 h-4" /> Advanced Search <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded ml-1">3</span>
              </button>
          </div>
      </div>

      <PropertiesTable />

      <Modal isOpen={isAdvSearchOpen} onClose={() => { if (!isLocPickerOpen) setIsAdvSearchOpen(false); }} title="Advanced Search">
        <AdvancedSearchForm 
            selectedLocations={locations} // Truyền state
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