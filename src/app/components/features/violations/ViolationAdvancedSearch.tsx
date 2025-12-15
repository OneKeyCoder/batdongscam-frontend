'use client';
import React from 'react';
import { Search, RotateCcw } from 'lucide-react';

export default function ViolationAdvancedSearch({ onApply, onReset }: any) {
  return (
    <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-bold text-gray-900 mb-1.5">Status</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm"><option>All</option></select>
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-900 mb-1.5">Violation Type</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm"><option>All</option></select>
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-900 mb-1.5">Date From</label>
                <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm" />
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-900 mb-1.5">Date To</label>
                <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm" />
            </div>
        </div>
        <div className="flex justify-end gap-3 pt-4">
            <button onClick={onReset} className="px-4 py-2 border rounded-lg text-sm font-bold flex items-center gap-2"><RotateCcw className="w-4 h-4"/> Reset</button>
            <button onClick={onApply} className="px-6 py-2 bg-red-600 text-white rounded-lg text-sm font-bold flex items-center gap-2"><Search className="w-4 h-4"/> Apply</button>
        </div>
    </div>
  )
}