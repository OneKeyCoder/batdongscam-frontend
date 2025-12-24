'use client';

import React, { useState } from 'react';
import { Minus, Plus, Search, X, RotateCcw, ChevronDown } from 'lucide-react';

interface AdvancedSearchFormProps {
  onApply: () => void;
  onReset: () => void;
  onOpenLocationPicker: () => void;
  selectedLocations?: string[];
  onRemoveLocation: (location: string) => void;
}

function CounterInput({ label, value, onChange }: any) {
  const handleDecrease = () => onChange(Math.max(0, value - 1));
  const handleIncrease = () => onChange(value + 1);

  return (
    <div>
      <label className="block text-sm font-bold text-gray-900 mb-1.5">{label}</label>
      <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50">
        <input
          type="text"
          value={value === 0 ? '---' : value}
          readOnly
          className="flex-1 bg-transparent focus:outline-none text-gray-900 text-sm font-medium"
        />
        <div className="flex items-center gap-3 ml-2">
          <button onClick={handleDecrease} className="text-gray-400 hover:text-gray-600"><Minus className="w-4 h-4"/></button>
          <button onClick={handleIncrease} className="text-gray-400 hover:text-gray-600"><Plus className="w-4 h-4"/></button>
        </div>
      </div>
    </div>
  )
}

export default function AdvancedSearchForm({ 
    onApply, 
    onReset, 
    onOpenLocationPicker, 
    selectedLocations = [], 
    onRemoveLocation 
}: AdvancedSearchFormProps) {
  
  const [rooms, setRooms] = useState(10);
  const [bathrooms, setBathrooms] = useState(0);
  const [bedrooms, setBedrooms] = useState(0);
  const [floors, setFloors] = useState(3);

  return (
    <div className="flex flex-col h-full">
      <div className="space-y-6 flex-1 overflow-y-auto pr-2 pb-4 custom-scrollbar">
        <p className="text-sm text-gray-500">Filter properties by multiple criteria</p>
        
        <div className="grid grid-cols-2 gap-4">
          
          {/* Status & Property Type */}
          <div>
             <label className="block text-sm font-bold text-gray-900 mb-1.5">Status</label>
             <div className="relative">
                <select className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-red-500">
                    <option>Multiple (2)</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
             </div>
          </div>
          <div>
             <label className="block text-sm font-bold text-gray-900 mb-1.5">Property type</label>
             <div className="relative">
                <select className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-red-500">
                    <option>House</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
             </div>
          </div>

           {/* Transaction Type */}
           <div className="col-span-2">
             <label className="block text-sm font-bold text-gray-900 mb-1.5">Transaction type</label>
             <div className="relative">
                <select className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-red-500">
                    <option>For sale</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
             </div>
          </div>

          {/* Prices */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1.5">Min price (VNĐ)</label>
            <input type="text" placeholder="10B" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-red-500" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1.5">Max price (VNĐ)</label>
            <input type="text" placeholder="---" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-red-500" />
          </div>

           {/* Area */}
           <div>
            <label className="block text-sm font-bold text-gray-900 mb-1.5">Min area (m²)</label>
            <input type="text" placeholder="100" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-red-500" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1.5">Max area (m²)</label>
            <input type="text" placeholder="---" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-red-500" />
          </div>

          {/* Owner & Agent */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1.5">Owner&apos;s name</label>
            <input type="text" placeholder="Văn A" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-red-500" />
          </div>
          <div>
             <label className="block text-sm font-bold text-gray-900 mb-1.5">Owner&apos;s tier</label>
             <div className="relative">
                <select className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-red-500">
                    <option>All tier</option>
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
             <div className="relative">
                <select className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-red-500">
                    <option>PLATINUM</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
             </div>
          </div>

          {/* Counters */}
          <CounterInput label="Number of Rooms" value={rooms} onChange={setRooms} />
          <CounterInput label="Number of Bathrooms" value={bathrooms} onChange={setBathrooms} />
          <CounterInput label="Number of Bedrooms" value={bedrooms} onChange={setBedrooms} />
          <CounterInput label="Number of Floors" value={floors} onChange={setFloors} />

           {/* Orientations */}
           <div>
             <label className="block text-sm font-bold text-gray-900 mb-1.5">House Orientations</label>
             <div className="relative">
                <select className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-red-500">
                    <option>North West</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
             </div>
          </div>
           <div>
             <label className="block text-sm font-bold text-gray-900 mb-1.5">Balcony Orientations</label>
             <div className="relative">
                <select className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-red-500">
                    <option>---</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
             </div>
          </div>

          {/* Location Picker (REAL) */}
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
                              className="w-3 h-3 text-red-500 hover:text-red-700 cursor-pointer" 
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

      {/* Footer Buttons */}
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