'use client';

import React, { useState } from 'react';
import { Minus, Plus, Search, X } from 'lucide-react';

function CounterInput({ label, value, onChange }: any) {
  const handleDecrease = () => onChange(Math.max(0, value - 1));
  const handleIncrease = () => onChange(value + 1);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-gray-50">
        <input
          type="text"
          value={value === 0 ? '---' : value}
          readOnly
          className="flex-1 bg-transparent focus:outline-none text-gray-600 text-sm"
        />
        <div className="flex items-center gap-3 ml-2">
          <button onClick={handleDecrease} className="text-gray-400 hover:text-gray-600"><Minus className="w-4 h-4"/></button>
          <button onClick={handleIncrease} className="text-gray-400 hover:text-gray-600"><Plus className="w-4 h-4"/></button>
        </div>
      </div>
    </div>
  )
}

function LocationInputMock() {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <div className="border border-gray-300 rounded-lg p-2 bg-gray-50 flex flex-wrap gap-2 min-h-[42px] items-center">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-200 text-xs font-medium text-gray-700">
                    Hồ Chí Minh/Tân Bình <X className="w-3 h-3 cursor-pointer hover:text-gray-900"/>
                </span>
                 <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-200 text-xs font-medium text-gray-700">
                    Đà Nẵng/All <X className="w-3 h-3 cursor-pointer hover:text-gray-900"/>
                </span>
            </div>
        </div>
    )
}


export default function AdvancedSearchForm({ onApply, onReset }: any) {
  // State giả lập cho các counter
  const [rooms, setRooms] = useState(10);
  const [bathrooms, setBathrooms] = useState(0);
  const [bedrooms, setBedrooms] = useState(0);
  const [floors, setFloors] = useState(3);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-500 mb-4">Filter properties by multiple criteria</p>
        <div className="grid grid-cols-2 gap-4">
          {/* Status & Property Type */}
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
             <select className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500">
                <option>Multiple (2)</option>
             </select>
          </div>
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Property type</label>
             <select className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500">
                <option>House</option>
             </select>
          </div>

           {/* Transaction Type */}
           <div className="col-span-2">
             <label className="block text-sm font-medium text-gray-700 mb-1">Transaction type</label>
             <select className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500">
                <option>For sale</option>
             </select>
          </div>

          {/* Prices */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min price (VNĐ)</label>
            <input type="text" placeholder="10B" className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500" />
          </div>
           <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max price (VNĐ)</label>
            <input type="text" placeholder="---" className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500" />
          </div>

           {/* Area */}
           <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min area (m²)</label>
            <input type="text" placeholder="100" className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500" />
          </div>
           <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max area (m²)</label>
            <input type="text" placeholder="---" className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500" />
          </div>

          {/* Owner & Agent */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Owner's name</label>
            <input type="text" placeholder="Văn A" className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500" />
          </div>
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Owner's tier</label>
             <select className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500">
                <option>All tier</option>
             </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Agent's name</label>
            <input type="text" placeholder="---" className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500" />
          </div>
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Agent's tier</label>
             <select className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500">
                <option>PLATINUM</option>
             </select>
          </div>

          {/* Counters */}
          <CounterInput label="Number of Rooms" value={rooms} onChange={setRooms} />
          <CounterInput label="Number of Bathrooms" value={bathrooms} onChange={setBathrooms} />
          <CounterInput label="Number of Bedrooms" value={bedrooms} onChange={setBedrooms} />
          <CounterInput label="Number of Floors" value={floors} onChange={setFloors} />

           {/* Orientations */}
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">House Orientations</label>
             <select className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500">
                <option>North West</option>
             </select>
          </div>
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Balcony Orientations</label>
             <select className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500">
                <option>---</option>
             </select>
          </div>

          {/* Location */}
          <div className="col-span-2">
              <LocationInputMock />
          </div>

        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
        <button onClick={onReset} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-rotate-ccw"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 12"/></svg>
            Reset All
        </button>
        <button onClick={onApply} className="px-4 py-2 bg-red-600 rounded-lg text-sm font-bold text-white hover:bg-red-700 flex items-center gap-2">
            <Search className="w-4 h-4" />
            Apply
        </button>
      </div>
    </div>
  );
}