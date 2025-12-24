'use client';

import React from 'react';
import { ChevronDown, RotateCcw, Search } from 'lucide-react';

interface SearchProps {
  onApply: () => void;
  onReset: () => void;
}

const InputGroup = ({ labelFrom, labelTo, placeholderFrom, placeholderTo }: any) => (
    <div className="grid grid-cols-2 gap-4">
        <div>
            <label className="block text-sm font-bold text-gray-900 mb-1.5">{labelFrom}</label>
            <input type="text" placeholder={placeholderFrom} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-red-500" />
        </div>
        <div>
            <label className="block text-sm font-bold text-gray-900 mb-1.5">{labelTo}</label>
            <input type="text" placeholder={placeholderTo} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-red-500" />
        </div>
    </div>
);

export default function AccountantAgentAdvancedSearch({ onApply, onReset }: SearchProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="space-y-4 flex-1 overflow-y-auto pr-2 pb-4 custom-scrollbar">
          
          {/* Tier Dropdown */}
          <div>
               <label className="block text-sm font-bold text-gray-900 mb-1.5">Tier</label>
               <div className="relative">
                 <select className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-red-500">
                    <option>Multiple (2)</option>
                    <option>Platinum</option>
                    <option>Gold</option>
                 </select>
                 <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
               </div>
          </div>

          <InputGroup 
            labelFrom="Min performance point" labelTo="Max performance point"
            placeholderFrom="10B" placeholderTo="---"
          />

          <InputGroup 
            labelFrom="Ranking from" labelTo="Ranking to"
            placeholderFrom="10" placeholderTo="15"
          />

          <InputGroup 
            labelFrom="Salary from" labelTo="Salary to"
            placeholderFrom="10" placeholderTo="15"
          />

          <InputGroup 
            labelFrom="Bonus from" labelTo="Bonus to"
            placeholderFrom="10" placeholderTo="15"
          />

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