'use client';

import React, { useState } from 'react';
import { LogOut } from 'lucide-react';
import AllTab from '@/app/components/features/admin/reports/customer/AllTab';
import MonthTab from '@/app/components/features/admin/reports/customer/MonthTab';

export default function CustomerAnalyticsReportPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'month'>('month');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Customer Analytics Report</h2>
            <p className="text-sm text-gray-500">Understand your customers like never before — uncover insights about preferences, satisfaction, and engagement over time.</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-bold rounded-lg text-sm hover:bg-red-700 transition-colors">
              <LogOut className="w-4 h-4" /> Export to file
          </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-200">
          <button 
            onClick={() => setActiveTab('all')}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'all' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            All
          </button>
          <button 
             onClick={() => setActiveTab('month')}
             className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'month' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Month
          </button>
      </div>

      {/* Content */}
      <div className="pt-2">
        {activeTab === 'all' ? <AllTab /> : <MonthTab />}
      </div>
    </div>
  );
}