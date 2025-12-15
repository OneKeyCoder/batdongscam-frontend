'use client';

import React from 'react';
import { ChevronDown, RotateCcw, Search, Calendar } from 'lucide-react';

interface PaymentSearchProps {
  onApply: () => void;
  onReset: () => void;
}

const SearchInput = ({ label, placeholder = "---" }: any) => (
    <div>
        <label className="block text-sm font-bold text-gray-900 mb-1.5">{label}</label>
        <input type="text" placeholder={placeholder} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-red-500" />
    </div>
);

const SearchSelect = ({ label, value = "All" }: any) => (
    <div>
       <label className="block text-sm font-bold text-gray-900 mb-1.5">{label}</label>
       <div className="relative">
         <select className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-red-500">
            <option>{value}</option>
         </select>
         <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
       </div>
    </div>
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

export default function PaymentAdvancedSearch({ onApply, onReset }: PaymentSearchProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="space-y-4 flex-1 overflow-y-auto pr-2 pb-4 custom-scrollbar">
          <p className="text-sm text-gray-500">Filter payments by multiple criteria</p>

          <div className="grid grid-cols-2 gap-4">
            <SearchSelect label="Payment status" value="Multiple (2)" />
            <SearchSelect label="Payment type" value="Multiple (2)" />
            <SearchSelect label="Payment method type" value="Multiple (2)" />
            
            <div className="hidden md:block"></div> 

            <SearchInput label="Payer's name" placeholder="Nguyễn Văn A" />
            <SearchSelect label="Payer's role" value="Customer" />

            <SearchInput label="Payee's name" placeholder="Nguyễn Văn A" />
            <SearchSelect label="Payee's role" value="Multiple (2)" />

            <SearchInput label="Min payment amount" placeholder="3.5B" />
            <SearchInput label="Max payment amount" />

            <DateInput label="Paid date from" placeholder="January 2nd, 2025" />
            <DateInput label="Paid date to" placeholder="May 1st, 2025" />

            <DateInput label="Due date from" placeholder="January 2nd, 2025" />
            <DateInput label="Due date to" placeholder="May 1st, 2025" />
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