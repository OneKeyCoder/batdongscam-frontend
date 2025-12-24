'use client';

import React from 'react';
import { ChevronDown, RotateCcw, Search, Calendar, X } from 'lucide-react';

interface SearchProps {
  onOpenLocationPicker: () => void;
  onApply: () => void;
  onReset: () => void;
  selectedLocations?: string[];
}

export default function AppointmentAdvancedSearch({ 
  onOpenLocationPicker, onApply, onReset, selectedLocations = [] 
}: SearchProps) {
  
  return (
    <div className="flex flex-col h-full">
      <div className="space-y-4 flex-1 overflow-y-auto pr-2 pb-4 custom-scrollbar">
          <p className="text-sm text-gray-500">Filter appointments by multiple criteria</p>

          <div className="grid grid-cols-2 gap-4">
            
            {/* Property Type */}
            <div>
               <label className="block text-sm font-bold text-gray-900 mb-1.5">Property type</label>
               <div className="relative">
                 <select className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-red-500">
                    <option>Multiple (2)</option>
                 </select>
                 <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
               </div>
            </div>

            {/* Status Field */}
            <div>
               <label className="block text-sm font-bold text-gray-900 mb-1.5">Status</label>
               <div className="relative">
                 <select className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-red-500">
                    <option>All</option>
                    <option>Pending</option>
                    <option>Completed</option>
                    <option>Cancelled</option>
                 </select>
                 <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
               </div>
            </div>

            {/* Other Fields */}
            <div className="col-span-2">
               <label className="block text-sm font-bold text-gray-900 mb-1.5">Transaction type</label>
               <div className="relative">
                 <select className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-red-500">
                    <option>All</option>
                 </select>
                 <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
               </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-900 mb-1.5">Agent&apos;s name</label>
                <input type="text" placeholder="---" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-red-500" />
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-900 mb-1.5">Agent&apos;s tier</label>
                <div className="relative"><select className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm"><option>Multiple (2)</option></select><ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" /></div>
            </div>

            {/* Dates */}
            <div>
                <label className="block text-sm font-bold text-gray-900 mb-1.5">Requested date from</label>
                <div className="relative">
                    <input type="text" placeholder="Jan 2nd, 2025" className="w-full border border-gray-300 rounded-lg pl-3 pr-10 py-2.5 bg-gray-50 text-sm" />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-900 mb-1.5">Requested date to</label>
                <div className="relative">
                    <input type="text" placeholder="May 1st, 2025" className="w-full border border-gray-300 rounded-lg pl-3 pr-10 py-2.5 bg-gray-50 text-sm" />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
            </div>

            {/* Location */}
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