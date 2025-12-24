'use client';

import React from 'react';
import { ChevronDown, RotateCcw, Search, Calendar } from 'lucide-react';

interface SearchProps {
  onApply: () => void;
  onReset: () => void;
}

const SelectInput = ({ label, value = "Multiple (2)" }: any) => (
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

export default function AccountantPaymentAdvancedSearch({ onApply, onReset }: SearchProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="space-y-4 flex-1 overflow-y-auto pr-2 pb-4 custom-scrollbar">
          
          <div className="grid grid-cols-2 gap-4">
              <SelectInput label="Payment status" />
              <SelectInput label="Payment type" />

              <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1.5">Payer&apos;s name</label>
                  <input type="text" placeholder="Nguyễn Văn A" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-red-500" />
              </div>
              <SelectInput label="Payer&apos;s role" value="Customer" />

              <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1.5">Payee&apos;s name</label>
                  <input type="text" placeholder="Nguyễn Văn A" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-red-500" />
              </div>
              <SelectInput label="Payee&apos;s role" />

              <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1.5">Min payment amount</label>
                  <input type="text" placeholder="3.5B" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-red-500" />
              </div>
              <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1.5">Max payment amount</label>
                  <input type="text" placeholder="---" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-red-500" />
              </div>

              <DateInput label="Paid date from" placeholder="January 2nd, 2025" />
              <DateInput label="Paid date to" placeholder="May 1st, 2025" />

              <DateInput label="Due date from" placeholder="January 2nd, 2025" />
              <DateInput label="Due date to" placeholder="May 1st, 2025" />
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