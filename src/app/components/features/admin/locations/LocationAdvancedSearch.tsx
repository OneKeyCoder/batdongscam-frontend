'use client';

import React, { useState } from 'react';
import { ChevronDown, RotateCcw, Search, X } from 'lucide-react';
import { LocationSelection } from '@/app/components/LocationPicker';
import { LocationCardsFilters } from '@/lib/api/services/location.service';

interface LocationAdvancedSearchProps {
  onOpenLocationPicker: () => void;
  onApply: (filters: LocationCardsFilters) => void;
  onReset: () => void;
  selectedLocations?: LocationSelection[];
  onRemoveLocation: (id: string) => void;
}

export default function LocationAdvancedSearch({
  onOpenLocationPicker,
  onApply,
  onReset,
  selectedLocations = [],
  onRemoveLocation
}: LocationAdvancedSearchProps) {

  const [status, setStatus] = useState<string>('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minArea, setMinArea] = useState('');
  const [maxArea, setMaxArea] = useState('');
  const [minPop, setMinPop] = useState('');
  const [maxPop, setMaxPop] = useState('');

  const handleApply = () => {
    const filters: LocationCardsFilters = {
      locationTypeEnum: 'CITY',
    };

    if (status !== '') filters.isActive = status === 'true';
    if (minPrice) filters.minAvgLandPrice = Number(minPrice);
    if (maxPrice) filters.maxAvgLandPrice = Number(maxPrice);
    if (minArea) filters.minArea = Number(minArea);
    if (maxArea) filters.maxArea = Number(maxArea);
    if (minPop) filters.minPopulation = Number(minPop);
    if (maxPop) filters.maxPopulation = Number(maxPop);

    onApply(filters);
  };

  const handleReset = () => {
    setStatus('');
    setMinPrice(''); setMaxPrice('');
    setMinArea(''); setMaxArea('');
    setMinPop(''); setMaxPop('');
    onReset();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="space-y-5 flex-1 overflow-y-auto pr-1 pb-4 custom-scrollbar">
        <p className="text-sm text-gray-500">Filter locations by multiple criteria</p>

        <div className="grid grid-cols-2 gap-4">

          {/* Status Field */}
          <div className="col-span-2">
            <label className="block text-sm font-bold text-gray-900 mb-1.5">Status (Is Active)</label>
            <div className="relative">
              <select
                className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-red-500"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">All</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Land Price Range */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1.5">Min land price</label>
            <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1.5">Max land price</label>
            <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm" />
          </div>

          {/* Area Range */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1.5">Min area (m²)</label>
            <input type="number" value={minArea} onChange={e => setMinArea(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1.5">Max area (m²)</label>
            <input type="number" value={maxArea} onChange={e => setMaxArea(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm" />
          </div>

          {/* Population Range */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1.5">Min population</label>
            <input type="number" value={minPop} onChange={e => setMinPop(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1.5">Max population</label>
            <input type="number" value={maxPop} onChange={e => setMaxPop(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm" />
          </div>

          {/* Location Picker */}
          <div className="col-span-2">
            <label className="block text-sm font-bold text-gray-900 mb-1.5">Parent Location (Optional)</label>
            <div
              onClick={onOpenLocationPicker}
              className="w-full min-h-[42px] border border-gray-300 rounded-lg px-2 py-1.5 bg-gray-50 flex flex-wrap items-center gap-2 cursor-pointer hover:border-red-500 transition-colors"
            >
              {selectedLocations.length > 0 ? (
                selectedLocations.map((loc) => (
                  <span key={loc.id} className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded text-xs font-medium text-gray-700 shadow-sm whitespace-nowrap">
                    {loc.name}
                    <X
                      className="w-3 h-3 text-red-500 hover:text-red-700 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveLocation(loc.id);
                      }}
                    />
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-400 px-1">Select cities...</span>
              )}
              <ChevronDown className="w-4 h-4 text-gray-400 ml-auto" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 pt-5 mt-2 border-t border-gray-100">
        <button onClick={handleReset} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-2">
          <RotateCcw className="w-3 h-3" /> Reset All
        </button>
        <button onClick={handleApply} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg flex items-center gap-2 shadow-sm">
          <Search className="w-3 h-3" /> Apply
        </button>
      </div>
    </div>
  );
}