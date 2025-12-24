'use client';

import React, { useState } from 'react';
import { Search, Filter, ChevronDown, Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import StatsGrid from '@/app/components/StatsGrid';
import Modal from '@/app/components/ui/Modal';
import PaymentTable from '@/app/components/features/admin/payments/PaymentTable';
import PaymentAdvancedSearch from '@/app/components/features/admin/payments/PaymentAdvancedSearch';
import PaymentDetailModal from '@/app/components/features/admin/payments/PaymentDetailModal';

export default function PaymentsPage() {
  const [isAdvSearchOpen, setIsAdvSearchOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  const statsData = [
    { title: "Total payments", value: "72.5M", trend: "+12.5%", icon: Wallet },
    { title: "New this month", value: "2,817", trend: "+8.2%", icon: Wallet },
    { title: "Total value", value: "10.000B", trend: "+12.5%", icon: TrendingUp },
    { title: "Inflow", value: "14212", trend: "+12.5%", icon: ArrowDownLeft },
    { title: "Outflow", value: "90", trend: "+12.5%", icon: ArrowUpRight },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Payments</h2>
        <p className="text-sm text-gray-500">Hello 1234</p>
      </div>

      <StatsGrid stats={statsData} />

      {/* --- FILTERS --- */}
      <div className="space-y-4">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
                type="text"
                placeholder="Property listing's name or Contract number"
                className="w-full pl-12 pr-24 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white"
            />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-1.5 rounded-lg transition-colors text-sm">
                Search
            </button>
          </div>

          <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsAdvSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 bg-white hover:bg-gray-50 font-medium rounded-lg text-sm text-gray-700 transition-all whitespace-nowrap"
              >
                <Filter className="w-4 h-4" />
                Advanced Search
                <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded ml-1">3</span>
              </button>

              <div className="relative group">
                  <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 bg-white hover:bg-gray-50 font-medium rounded-lg text-sm text-gray-700 transition-all min-w-[140px] justify-between">
                      October, 2025
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>
              </div>
          </div>
      </div>

      {/* --- TABLE (Pass hàm mở modal xuống) --- */}
      <PaymentTable 
        onViewDetail={(payment) => setSelectedPayment(payment)} 
      />

      {/* --- MODAL 1: ADVANCED SEARCH --- */}
      <Modal 
        isOpen={isAdvSearchOpen} 
        onClose={() => setIsAdvSearchOpen(false)}
        title="Advanced Search"
      >
        <PaymentAdvancedSearch 
            onApply={() => setIsAdvSearchOpen(false)}
            onReset={() => {}}
        />
      </Modal>

      {/* --- MODAL 2: PAYMENT DETAIL POPUP --- */}
      <PaymentDetailModal 
        isOpen={!!selectedPayment} // Mở khi có data
        onClose={() => setSelectedPayment(null)} // Đóng thì set data về null
        payment={selectedPayment}
      />
    </div>
  );
}