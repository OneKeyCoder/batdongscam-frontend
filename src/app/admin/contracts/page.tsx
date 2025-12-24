'use client';

import React, { useState } from 'react';
import { Search, Filter, FileText, CheckCircle, TrendingUp, DollarSign, ChevronDown } from 'lucide-react';
import StatsGrid from '@/app/components/StatsGrid';
import Modal from '@/app/components/ui/Modal';
import ContractTable from '@/app/components/features/admin/contracts/ContractTable';
import ContractAdvancedSearch from '@/app/components/features/admin/contracts/ContractAdvancedSearch';

export default function ContractsPage() {
  const [isAdvSearchOpen, setIsAdvSearchOpen] = useState(false);
  
  const stats = [
    { title: "Total contracts", value: "72.5M", trend: "+12.5%", icon: FileText },
    { title: "New this month", value: "2,817", trend: "+8.2%", icon: FileText },
    { title: "End this month", value: "10.000B", trend: "+12.5%", icon: CheckCircle },
    { title: "Total value", value: "20B", trend: "+12.5%", icon: DollarSign },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Contracts</h2>
        <p className="text-sm text-gray-500">Hello 1234</p>
      </div>

      <StatsGrid stats={stats} />

      <div className="space-y-4">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="text" placeholder="Property listing's name or Contract number" className="w-full pl-12 pr-24 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white" />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-1.5 rounded-lg transition-colors text-sm">Search</button>
          </div>

          <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsAdvSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 bg-white hover:bg-gray-50 font-medium rounded-lg text-sm text-gray-700 transition-all whitespace-nowrap"
              >
                <Filter className="w-4 h-4" /> Advanced Search <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded ml-1">3</span>
              </button>

              <div className="relative">
                  <button className="flex items-center justify-between gap-2 px-3 py-2 border border-gray-300 bg-white hover:bg-gray-50 font-medium rounded-lg text-sm text-gray-700 transition-all min-w-[140px]">
                      October, 2025
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>
              </div>
          </div>
      </div>

      <ContractTable />

      <Modal isOpen={isAdvSearchOpen} onClose={() => setIsAdvSearchOpen(false)} title="Advanced Search">
        <ContractAdvancedSearch onApply={() => setIsAdvSearchOpen(false)} onReset={() => {}} />
      </Modal>
    </div>
  );
}