'use client';

import React, { useState } from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react';
import Modal from '@/app/components/ui/Modal';
import LocationPicker from '@/app/components/LocationPicker';
import OwnerContributionTable from './OwnerContributionTable';
import OwnerAdvancedSearch from './OwnerAdvancedSearch';

export default function MonthTab() {
  const [isAdvSearchOpen, setIsAdvSearchOpen] = useState(false);
  const [isLocPickerOpen, setIsLocPickerOpen] = useState(false);
  const [locations, setLocations] = useState<string[]>([]);

  return (
    <div className="space-y-4 pt-2 animate-in fade-in duration-300">
      <div className="relative w-full">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input type="text" placeholder="Property owner's name" className="w-full pl-12 pr-24 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white" />
        <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-1.5 rounded-lg transition-colors text-sm">Search</button>
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

          <div className="relative">
              <button className="flex items-center justify-between gap-2 px-3 py-2 border border-gray-300 bg-white hover:bg-gray-50 font-medium rounded-lg text-sm text-gray-700 transition-all min-w-[140px]">
                  October, 2025
                  <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
          </div>
      </div>

      <OwnerContributionTable />

      <Modal isOpen={isAdvSearchOpen} onClose={() => { if (!isLocPickerOpen) setIsAdvSearchOpen(false); }} title="Advanced Search">
        <OwnerAdvancedSearch selectedLocations={locations} onRemoveLocation={(loc) => setLocations(prev => prev.filter(l => l !== loc))} onOpenLocationPicker={() => setIsLocPickerOpen(true)} onApply={() => setIsAdvSearchOpen(false)} onReset={() => setLocations([])} />
      </Modal>
      <LocationPicker isOpen={isLocPickerOpen} onClose={() => setIsLocPickerOpen(false)} initialSelected={locations} onConfirm={(newLocs) => { setLocations(newLocs); setIsLocPickerOpen(false); }} />
    </div>
  );
}