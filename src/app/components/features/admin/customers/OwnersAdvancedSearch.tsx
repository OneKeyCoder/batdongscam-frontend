'use client';

import React from 'react';
import { ChevronDown, RotateCcw, Search, X, Calendar } from 'lucide-react';

interface SearchProps {
  onOpenLocationPicker: () => void;
  onApply: () => void;
  onReset: () => void;
  selectedLocations?: string[];
  onRemoveLocation: (location: string) => void; 
}

const RangeInput = ({ label, fromPlaceholder = "3.5", toPlaceholder = "---" }: any) => (
    <>
        <div>
            <label className="block text-sm font-bold text-gray-900 mb-1.5">Min {label}</label>
            <input type="text" placeholder={fromPlaceholder} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-red-500" />
        </div>
        <div>
            <label className="block text-sm font-bold text-gray-900 mb-1.5">Max {label}</label>
            <input type="text" placeholder={toPlaceholder} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-red-500" />
        </div>
    </>
);

export default function OwnersAdvancedSearch({ 
  onOpenLocationPicker, 
  onApply, 
  onReset,
  selectedLocations = [],
  onRemoveLocation
}: SearchProps) {
  
  return (
    <div className="flex flex-col h-full">
      <div className="space-y-4 flex-1 overflow-y-auto pr-2 pb-4 custom-scrollbar">
          <p className="text-sm text-gray-500">Filter owners by multiple criteria</p>

          <div className="grid grid-cols-2 gap-4">
            {/* Owner's Tier ... (Giữ nguyên) */}
            
            {/* Ranges... (Giữ nguyên) */}

            {/* Location Picker */}
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
                            <X 
                                className="w-3 h-3 text-red-500 hover:text-red-700" 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemoveLocation(loc);
                                }}
                            />
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

      {/* Footer... (Giữ nguyên) */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
        <button onClick={onReset} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-2">
            <RotateCcw className="w-3 h-3" /> Reset All
        </button>
        <button onClick={onApply} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg flex items-center gap-2 shadow-sm">
            <Search className="w-3 h-3" /> Apply
        </button>
      </div>
    </div>
  );
}