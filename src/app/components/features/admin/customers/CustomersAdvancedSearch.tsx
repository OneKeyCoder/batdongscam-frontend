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

export default function CustomersAdvancedSearch({ 
  onOpenLocationPicker, 
  onApply, 
  onReset,
  selectedLocations = [],
  onRemoveLocation
}: SearchProps) {
  
  return (
    <div className="flex flex-col h-full">
      <div className="space-y-4 flex-1 overflow-y-auto pr-2 pb-4 custom-scrollbar">
          <p className="text-sm text-gray-500">Filter customers by multiple criteria</p>

          <div className="grid grid-cols-2 gap-4">
            {/* Customer Tier */}
            <div className="col-span-2 md:col-span-1">
               <label className="block text-sm font-bold text-gray-900 mb-1.5">Customer&apos;s tier</label>
               <div className="relative w-full border border-gray-300 rounded-lg bg-gray-50 px-3 py-2.5 cursor-pointer flex items-center justify-between group hover:border-red-500 transition-colors">
                  <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-900">Multiple</span>
                      <span className="bg-gray-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">2</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
               </div>
            </div>
            
            <div className="hidden md:block"></div>

            {/* Range Inputs... (Giữ nguyên) */}
            <RangeInput label="leading score" />
            <RangeInput label="viewings" />
            
            {/* ... Date inputs ... */}

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

      {/* Footer */}
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