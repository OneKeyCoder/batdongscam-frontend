'use client';

import React, { useState, useMemo } from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react';
import Modal from '@/app/components/ui/Modal';
import LocationPicker from '@/app/components/LocationPicker';
import AgentPerformanceTable from './AgentPerformanceTable';
import AgentPerformanceAdvancedSearch, { LocationSelection } from './AgentPerformanceAdvancedSearch';
import { SaleAgentFilters } from '@/lib/api/services/account.service';

export default function MonthTab() {
  const [isAdvSearchOpen, setIsAdvSearchOpen] = useState(false);
  const [isLocPickerOpen, setIsLocPickerOpen] = useState(false);

  const [locations, setLocations] = useState<LocationSelection[]>([]);
  const [tableFilters, setTableFilters] = useState<SaleAgentFilters>({});
  const [keyword, setKeyword] = useState('');

  // Time state
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Handlers
  const handleSearch = () => {
    setTableFilters(prev => ({ ...prev, name: keyword }));
  };

  const handleApplyFilters = (newFilters: SaleAgentFilters) => {
    setTableFilters(prev => ({ ...prev, ...newFilters }));
    setIsAdvSearchOpen(false);
  };

  const handleReset = () => {
    setLocations([]);
    setTableFilters({});
    setKeyword('');
    setSelectedMonth(new Date().getMonth() + 1);
    setSelectedYear(new Date().getFullYear());
  };

  const combinedFilters = useMemo(() => {
    const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();

    // 2. Tạo chuỗi ISO cuối ngày: YYYY-MM-DDT23:59:59
    const endOfMonthISO = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}T23:59:59`;

    return {
      ...tableFilters,
      month: selectedMonth,
      year: selectedYear,
      hiredDateTo: tableFilters.hiredDateTo || endOfMonthISO
    };
  }, [tableFilters, selectedMonth, selectedYear]);

  const activeFiltersCount = Object.keys(tableFilters).filter(key =>
    key !== 'name' && key !== 'page' && key !== 'limit' && key !== 'sortType' && key !== 'sortBy' &&
    tableFilters[key as keyof SaleAgentFilters] !== undefined
  ).length;

  return (
    <div className="space-y-4 animate-in fade-in duration-300 pt-2">

      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-3">
        {/* Row 1: Search */}
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search Agent's name or code..."
            className="w-full pl-12 pr-24 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white text-sm"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch} className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-1.5 rounded-lg transition-colors text-xs">
            Search
          </button>
        </div>

        {/* Row 2: Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setIsAdvSearchOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white hover:bg-gray-50 font-medium rounded-lg text-sm text-gray-700 transition-all shadow-sm"
          >
            <Filter className="w-4 h-4" />
            Advanced Search
            {activeFiltersCount > 0 && (
              <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded ml-1">{activeFiltersCount}</span>
            )}
          </button>

          {/* Month Picker */}
          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="appearance-none pl-4 pr-9 py-2 border border-gray-300 bg-white rounded-lg text-sm font-medium text-gray-700 cursor-pointer shadow-sm focus:outline-none focus:border-red-500"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>Month {m}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Year Picker */}
          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="appearance-none pl-4 pr-9 py-2 border border-gray-300 bg-white rounded-lg text-sm font-medium text-gray-700 cursor-pointer shadow-sm focus:outline-none focus:border-red-500"
            >
              {[2023, 2024, 2025, 2026].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table */}
      <AgentPerformanceTable externalFilters={combinedFilters} />

      {/* Modals */}
      <Modal isOpen={isAdvSearchOpen} onClose={() => { if (!isLocPickerOpen) setIsAdvSearchOpen(false); }} title="Advanced Search">
        <AgentPerformanceAdvancedSearch
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