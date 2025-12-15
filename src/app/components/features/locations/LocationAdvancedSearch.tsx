'use client';

import React from 'react';
import { ChevronDown, RotateCcw, Search, X } from 'lucide-react';

interface LocationAdvancedSearchProps {
  onOpenLocationPicker: () => void;
  onApply: () => void;
  onReset: () => void;
  selectedLocations?: string[];
}

export default function LocationAdvancedSearch({ 
  onOpenLocationPicker, 
  onApply, 
  onReset,
  selectedLocations = ['Hồ Chí Minh/Tân Bình', 'Đà Nẵng/All']
}: LocationAdvancedSearchProps) {
  
  return (
    <div className="flex flex-col h-full">
      <div className="space-y-5 flex-1 overflow-y-auto pr-1">
          <p className="text-sm text-gray-500">Filter locations by multiple criteria</p>

          <div className="grid grid-cols-2 gap-4">
            
            {/* --- FIX: STATUS FIELD --- */}
            <div>
               <label className="block text-sm font-bold text-gray-900 mb-1.5">Status</label>
               {/* Thay select bằng div để custom layout bên trong */}
               <div className="relative w-full border border-gray-300 rounded-lg bg-gray-50 px-3 py-2.5 cursor-pointer flex items-center justify-between group hover:border-red-500 transition-colors">
                  <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-900">Multiple</span>
                      {/* Badge nằm gọn gàng bên cạnh chữ, không dùng absolute nữa */}
                      <span className="bg-gray-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">2</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
               </div>
            </div>

            <div>
               <label className="block text-sm font-bold text-gray-900 mb-1.5">Is active</label>
               <div className="relative w-full border border-gray-300 rounded-lg bg-gray-50 px-3 py-2.5 cursor-pointer flex items-center justify-between group hover:border-red-500 transition-colors">
                  <span className="text-sm text-gray-900">All</span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
               </div>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1.5">Min land price (VNĐ/m²)</label>
              <input type="text" placeholder="10B" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-red-500" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1.5">Max land price (VNĐ/m²)</label>
              <input type="text" placeholder="---" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-red-500" />
            </div>

            {/* Area */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1.5">Min area (m²)</label>
              <input type="text" placeholder="100" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-red-500" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1.5">Max price (m²)</label>
              <input type="text" placeholder="---" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-red-500" />
            </div>

            {/* Population */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1.5">Min population</label>
              <input type="text" placeholder="100" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-red-500" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1.5">Max population</label>
              <input type="text" placeholder="---" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-red-500" />
            </div>

            {/* Location Picker Trigger */}
            <div className="col-span-2">
               <label className="block text-sm font-bold text-gray-900 mb-1.5">Location</label>
               <div 
                 onClick={onOpenLocationPicker}
                 className="w-full min-h-[42px] border border-gray-300 rounded-lg px-2 py-1.5 bg-gray-50 flex flex-wrap items-center gap-2 cursor-pointer hover:border-red-500 transition-colors"
               >
                  {selectedLocations.length > 0 ? (
                      selectedLocations.map((loc, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded text-xs font-medium text-gray-700 shadow-sm whitespace-nowrap">
                            {loc}
                            <X className="w-3 h-3 text-red-500 hover:text-red-700" />
                        </span>
                      ))
                  ) : (
                      <span className="text-sm text-gray-400 px-1">Select cities/districts...</span>
                  )}
                  <ChevronDown className="w-4 h-4 text-gray-400 ml-auto" />
               </div>
            </div>
          </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="flex items-center justify-end gap-3 pt-5 mt-2 border-t border-gray-100">
        <button 
            onClick={onReset}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-2 transition-colors"
        >
            <RotateCcw className="w-3 h-3" />
            Reset All
        </button>
        <button 
            onClick={onApply}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
            <Search className="w-3 h-3" />
            Apply
        </button>
      </div>
    </div>
  );
}