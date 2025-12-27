'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, Wallet, TrendingUp, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import StatsGrid from '@/app/components/StatsGrid';
import Modal from '@/app/components/ui/Modal';
import PaymentTable from '@/app/components/features/admin/payments/PaymentTable';
import PaymentAdvancedSearch from '@/app/components/features/admin/payments/PaymentAdvancedSearch';
import PaymentDetailModal from '@/app/components/features/admin/payments/PaymentDetailModal';
import { paymentService, PaymentListItem, PaymentFilters } from '@/lib/api/services/payment.service';

export default function PaymentsPage() {
  const [isAdvSearchOpen, setIsAdvSearchOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [payments, setPayments] = useState<PaymentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [filters, setFilters] = useState<PaymentFilters>({
    page: 0,  // Spring Boot uses 0-based pagination
    size: 10,
    sortBy: 'createdAt',
    sortDirection: 'DESC'
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await paymentService.getPayments(filters);
        setPayments(res.data);
        if (res.paging) {
          setTotalItems(res.paging.total);
        } else if ((res as any).meta) {
          setTotalItems((res as any).meta.total);
        }
      } catch (error) {
        console.error("Failed to fetch payments", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filters]);

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleApplySearch = (newFilters: PaymentFilters) => {
    // Don't merge - replace all filters except pagination defaults
    // Note: Spring Boot uses 0-based page numbering
    setFilters({
      page: 0,  // Spring Boot starts from 0
      size: 10,
      sortBy: 'createdAt',
      sortDirection: 'DESC',
      ...newFilters
    });
    setIsAdvSearchOpen(false);
  };

  const statsData = [
    { title: "Total payments", value: totalItems.toLocaleString(), trend: "", icon: Wallet },
    { title: "New this month", value: "---", trend: "", icon: Wallet },
    { title: "Total value", value: "---", trend: "", icon: TrendingUp },
    { title: "Inflow", value: "---", trend: "", icon: ArrowDownLeft },
    { title: "Outflow", value: "---", trend: "", icon: ArrowUpRight },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Payments</h2>
        <p className="text-sm text-gray-500">Manage all transaction history</p>
      </div>

      <StatsGrid stats={statsData} />

      <div className="space-y-4">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by Payment ID, Contract Number..."
            className="w-full pl-12 pr-24 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
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
            <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded ml-1">
              {Object.keys(filters).length - 4 > 0 ? Object.keys(filters).length - 4 : 0}
            </span>
          </button>
        </div>
      </div>

      <PaymentTable
        data={payments}
        loading={loading}
        currentPage={filters.page || 1}
        itemsPerPage={filters.size || 10}
        totalItems={totalItems}
        onPageChange={handlePageChange}
        onViewDetail={(id) => setSelectedPaymentId(id)}
      />

      <Modal
        isOpen={isAdvSearchOpen}
        onClose={() => setIsAdvSearchOpen(false)}
        title="Advanced Search"
      >
        <PaymentAdvancedSearch
          onApply={handleApplySearch}
          onReset={() => setFilters({ page: 0, size: 10, sortBy: 'createdAt', sortDirection: 'DESC' })}
          onClose={() => setIsAdvSearchOpen(false)}
        />
      </Modal>

      <PaymentDetailModal
        isOpen={!!selectedPaymentId}
        onClose={() => setSelectedPaymentId(null)}
        paymentId={selectedPaymentId}
      />
    </div>
  );
}