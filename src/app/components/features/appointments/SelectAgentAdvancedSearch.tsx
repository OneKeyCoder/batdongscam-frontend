'use client';

import React from 'react';
import { ChevronDown, RotateCcw, Search } from 'lucide-react';

interface SearchProps {
  onApply: () => void;
  onReset: () => void;
}

const RangeInput = ({ label, fromPlaceholder = "10", toPlaceholder = "---" }: any) => (
    <>
        <div>
            <label className="block text-sm font-bold text-gray-900 mb-1.5">{label}</label>
            <input type="text" placeholder={fromPlaceholder} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-red-500" />
        </div>
        <div>
            {/* Spacer label để căn dòng */}
            <label className="block text-sm font-bold text-gray-900 mb-1.5 opacity-0">To</label> 
            <input type="text" placeholder={toPlaceholder} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-red-500" />
        </div>
    </>
);

export default function SelectAgentAdvancedSearch({ onApply, onReset }: SearchProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="space-y-4 flex-1 overflow-y-auto pr-2 pb-4 custom-scrollbar">
          <p className="text-sm text-gray-500">Filter agents by workload criteria</p>

          <div className="grid grid-cols-2 gap-4">
            {/* Tier */}
            <div className="col-span-1">
               <label className="block text-sm font-bold text-gray-900 mb-1.5">Tier</label>
               <div className="relative">
                 <select className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-red-500">
                    <option>Multiple (2)</option>
                 </select>
                 <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
               </div>
            </div>
            
            {/* Empty Col for alignment if needed, or just let grid flow */}
            <div className="hidden md:block"></div>

            {/* Các cặp Input Min/Max theo hình */}
            <RangeInput label="Min appointments" fromPlaceholder="10" />
            <RangeInput label="Min properties" fromPlaceholder="10" toPlaceholder="15" />
            
            {/* Max property per day from/to */}
            <div>
                <label className="block text-sm font-bold text-gray-900 mb-1.5">Max property per day from</label>
                <input type="text" placeholder="10" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm" />
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-900 mb-1.5">Max property per day to</label>
                <input type="text" placeholder="15" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm" />
            </div>

            <RangeInput label="Min current handle" fromPlaceholder="10" toPlaceholder="15" />
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