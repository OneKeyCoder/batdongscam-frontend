'use client';

import React, { useState, useMemo } from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react';
import Modal from '@/app/components/ui/Modal';
import LocationPicker from '@/app/components/LocationPicker';
import CustomerTable from './CustomerTable';
import CustomerAdvancedSearch, { LocationSelection } from './CustomerAdvancedSearch';
import { CustomerFilters } from '@/lib/api/services/account.service';

export default function MonthTab() {
  const [isAdvSearchOpen, setIsAdvSearchOpen] = useState(false);
  const [isLocPickerOpen, setIsLocPickerOpen] = useState(false);

  const [locations, setLocations] = useState<LocationSelection[]>([]);
  const [tableFilters, setTableFilters] = useState<CustomerFilters>({});
  const [keyword, setKeyword] = useState('');

  // Time state
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  // Handlers
  const handleSearch = () => {
    setTableFilters(prev => ({ ...prev, name: keyword }));
  };

  const handleApplyFilters = (newFilters: CustomerFilters) => {
    setTableFilters(prev => ({ ...prev, ...newFilters }));
    setIsAdvSearchOpen(false);
  };

  const handleReset = () => {
    setLocations([]);
    setTableFilters({});
    setKeyword('');
  };

  const combinedFilters = useMemo(() => ({
    ...tableFilters,
    month,
    year
  }), [tableFilters, month, year]);

  const activeFiltersCount = Object.keys(tableFilters).filter(k => tableFilters[k as keyof CustomerFilters] !== undefined && k !== 'name').length;

  return (
    <div className="space-y-4 pt-2 animate-in fade-in duration-300">

      {/* Search Bar */}
      <div className="relative w-full flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text" placeholder="Search Customer's name"
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white text-sm"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <button
          onClick={handleSearch}
          className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-1.5 rounded-lg transition-colors text-sm"
        >
          Search
        </button>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setIsAdvSearchOpen(true)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white hover:bg-gray-50 font-medium rounded-lg text-sm text-gray-700 transition-all shadow-sm"
        >
          <Filter className="w-4 h-4" />
          Advanced Search
          {activeFiltersCount > 0 && <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded ml-1">{activeFiltersCount}</span>}
        </button>

        {/* Month/Year Pickers */}
        <div className="relative">
          <select
            value={month} onChange={(e) => setMonth(Number(e.target.value))}
            className="appearance-none pl-3 pr-8 py-2 border border-gray-300 bg-white rounded-lg text-sm font-medium text-gray-700 cursor-pointer shadow-sm focus:outline-none focus:border-red-500"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => <option key={m} value={m}>Month {m}</option>)}
          </select>
          <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={year} onChange={(e) => setYear(Number(e.target.value))}
            className="appearance-none pl-3 pr-8 py-2 border border-gray-300 bg-white rounded-lg text-sm font-medium text-gray-700 cursor-pointer shadow-sm focus:outline-none focus:border-red-500"
          >
            {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <CustomerTable externalFilters={combinedFilters} />

      {/* Modals */}
      <Modal isOpen={isAdvSearchOpen} onClose={() => { if (!isLocPickerOpen) setIsAdvSearchOpen(false); }} title="Advanced Search">
        <CustomerAdvancedSearch
          selectedLocations={locations}
          onRemoveLocation={(loc) => setLocations(prev => prev.filter(l => l.id !== loc.id))}
          onOpenLocationPicker={() => setIsLocPickerOpen(true)}
          onApply={handleApplyFilters}
          onReset={handleReset}
        />
      </Modal>
      <LocationPicker isOpen={isLocPickerOpen} onClose={() => setIsLocPickerOpen(false)} initialSelected={locations} onConfirm={(newLocs) => { setLocations(newLocs); setIsLocPickerOpen(false); }} />
    </div>
  );
}