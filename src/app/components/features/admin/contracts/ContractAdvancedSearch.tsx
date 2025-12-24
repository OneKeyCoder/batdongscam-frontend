'use client';

import React from 'react';
import { ChevronDown, RotateCcw, Search, Calendar } from 'lucide-react';

interface SearchProps {
  onApply: () => void;
  onReset: () => void;
}

const RangeInput = ({ label, placeholderFrom = "3.5B", placeholderTo = "---" }: any) => (
    <>
        <div>
            <label className="block text-sm font-bold text-gray-900 mb-1.5">Min {label}</label>
            <input type="text" placeholder={placeholderFrom} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-red-500" />
        </div>
        <div>
            <label className="block text-sm font-bold text-gray-900 mb-1.5">Max {label}</label>
            <input type="text" placeholder={placeholderTo} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-red-500" />
        </div>
    </>
);

const DateInput = ({ label, placeholder }: any) => (
    <div>
        <label className="block text-sm font-bold text-gray-900 mb-1.5">{label}</label>
        <div className="relative">
            <input type="text" placeholder={placeholder} className="w-full border border-gray-300 rounded-lg pl-3 pr-10 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-red-500" />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
    </div>
);

const SelectInput = ({ label, value }: any) => (
    <div>
        <label className="block text-sm font-bold text-gray-900 mb-1.5">{label}</label>
        <div className="relative">
            <button className="w-full flex items-center justify-between border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-red-500 text-left">
                <span className="text-gray-700">{value}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
        </div>
    </div>
);

export default function ContractAdvancedSearch({ onApply, onReset }: SearchProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="space-y-4 flex-1 overflow-y-auto pr-2 pb-4 custom-scrollbar">
          <p className="text-sm text-gray-500">Filter contracts by multiple criteria</p>

          <div className="grid grid-cols-2 gap-4">
            
            <SelectInput label="Contract status" value="Multiple (2)" />
            <SelectInput label="Property type" value="Multiple (2)" />
            <SelectInput label="Contract type" value="Multiple (2)" />
            <SelectInput label="Contract payment type" value="All" />

            <RangeInput label="contract amount" placeholderFrom="3.5B" />

            {/* Inputs Text đơn giản */}
            <div>
                 <label className="block text-sm font-bold text-gray-900 mb-1.5">Agent's name</label>
                 <input type="text" placeholder="---" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-red-500" />
            </div>
            <SelectInput label="Agent's tier" value="Multiple (2)" />

            <div>
                 <label className="block text-sm font-bold text-gray-900 mb-1.5">Customer's name</label>
                 <input type="text" placeholder="---" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-red-500" />
            </div>
            <SelectInput label="Customer's tier" value="Multiple (2)" />

            <div>
                 <label className="block text-sm font-bold text-gray-900 mb-1.5">Owner's name</label>
                 <input type="text" placeholder="---" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-red-500" />
            </div>
            <SelectInput label="Owner's tier" value="Multiple (2)" />

            {/* Date Ranges */}
            <DateInput label="Start date" placeholder="January 2nd, 2025" />
            <DateInput label="End date" placeholder="May 1st, 2025" />
            <DateInput label="Signed date from" placeholder="January 2nd, 2025" />
            <DateInput label="Signed date to" placeholder="May 1st, 2025" />

            {/* Rating */}
            <RangeInput label="rating" placeholderFrom="3.5" placeholderTo="---" />

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