'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, Wallet, TrendingUp, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import StatsGrid from '@/app/components/StatsGrid';
import Modal from '@/app/components/ui/Modal';
import PaymentTable from '@/app/components/features/admin/payments/PaymentTable';
import PaymentAdvancedSearch from '@/app/components/features/admin/payments/PaymentAdvancedSearch';
import PaymentDetailModal from '@/app/components/features/admin/payments/PaymentDetailModal';
import { paymentService, PaymentListItem, PaymentFilters } from '@/lib/api/services/payment.service';
import { reportService } from '@/lib/api/services/statistic-report.service';
import { accountService } from '@/lib/api/services/account.service';

export default function PaymentsPage() {
  const [isAdvSearchOpen, setIsAdvSearchOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);

  const [payments, setPayments] = useState<PaymentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [keyword, setKeyword] = useState('');

  const [filters, setFilters] = useState<PaymentFilters>({
    page: 0,
    size: 10,
    sortBy: 'createdAt',
    sortDirection: 'DESC'
  });

  const [finStats, setFinStats] = useState({
    totalRevenue: 0,
    netProfit: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await paymentService.getPayments(filters);
        const rawPayments = res.data;

        const userIdsToFetch = new Set<string>();
        rawPayments.forEach(p => {
          if (p.payerId) userIdsToFetch.add(p.payerId);
          if (p.payeeId) userIdsToFetch.add(p.payeeId);
        });

        const userMap = new Map<string, any>();

        if (userIdsToFetch.size > 0) {
          await Promise.all(Array.from(userIdsToFetch).map(async (id) => {
            try {
              const user = await accountService.getUserById(id);
              userMap.set(id, user);
            } catch (e) {
              console.warn(`Không lấy được thông tin user ID: ${id}`);
            }
          }));
        }

        const enrichedPayments = rawPayments.map(p => {
          const payerUser = p.payerId ? userMap.get(p.payerId) : null;
          const payeeUser = p.payeeId ? userMap.get(p.payeeId) : null;

          return {
            ...p,
            payerName: payerUser
              ? `${payerUser.firstName} ${payerUser.lastName}`
              : (p.payerId ? 'Unknown Payer' : 'System'),
            payerRole: payerUser ? payerUser.role : (p.payerId ? '---' : 'SYSTEM'),
            payeeName: payeeUser
              ? `${payeeUser.firstName} ${payeeUser.lastName}`
              : (p.payeeId ? 'Unknown Payee' : 'System'),
            payeeRole: payeeUser ? payeeUser.role : (p.payeeId ? '---' : 'SYSTEM'),
          };
        });

        setPayments(enrichedPayments);

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

  // 2. Fetch Financial Stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const currentYear = new Date().getFullYear();
        const res = await reportService.getFinancialStats(currentYear);
        if (res) {
          setFinStats({
            totalRevenue: res.totalRevenue || 0,
            netProfit: res.netProfit || 0
          });
        }
      } catch (error) {
        console.error("Failed to fetch financial stats", error);
      }
    };
    fetchStats();
  }, []);

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page: page - 1 }));
  };

  const handleApplySearch = (newFilters: PaymentFilters) => {
    setFilters({
      page: 0,
      size: 10,
      sortBy: 'createdAt',
      sortDirection: 'DESC',
      ...newFilters
    });
    setIsAdvSearchOpen(false);
  };

  const formatVNCurrency = (val: number) => {
    if (!val) return '0 ₫';
    if (val >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(1)}B ₫`;
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M ₫`;
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const statsData = [
    { title: "Total transactions", value: totalItems.toLocaleString(), trend: "", icon: Wallet },
    { title: "Total Revenue", value: formatVNCurrency(finStats.totalRevenue), trend: "+12%", trendUp: true, icon: TrendingUp },
    { title: "Net Profit", value: formatVNCurrency(finStats.netProfit), trend: "+8%", trendUp: true, icon: ArrowUpRight },
    { title: "Pending Payouts", value: "---", trend: "", icon: ArrowDownLeft },
  ];

  // --- Reset Filters ---
  const handleResetFilters = () => {
    setFilters({
      page: 0,
      size: 10,
      sortBy: 'createdAt',
      sortDirection: 'DESC'
    });
    setKeyword('');
  };

  // --- Check Advanced Filters ---
  const hasAdvancedFilters = !!(
    // Array/String checks 
    filters.paymentTypes?.length ||
    filters.statuses?.length ||
    filters.payerId ||
    filters.payeeId ||
    filters.contractId ||
    filters.propertyId ||
    filters.agentId ||

    // Date checks
    filters.dueDateFrom ||
    filters.dueDateTo ||
    filters.paidDateFrom ||
    filters.paidDateTo ||

    // Boolean checks 
    filters.overdue !== undefined
  );
  // ------------------------------------------

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
          </button>

          {/* --- Filters Summary & Clear --- */}
          {hasAdvancedFilters && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
              <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded hidden sm:inline-block">
                {[
                  filters.paymentTypes?.length && 'Type',
                  filters.statuses?.length && 'Status',
                  (filters.payerId || filters.payeeId) && 'User',
                  (filters.dueDateFrom || filters.dueDateTo) && 'Due Date',
                  (filters.paidDateFrom || filters.paidDateTo) && 'Paid Date',
                  filters.overdue !== undefined && 'Overdue'
                ].filter(Boolean).join(', ')}
              </span>
              <button
                onClick={handleResetFilters}
                className="text-xs text-red-600 underline hover:text-red-700 whitespace-nowrap"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      <PaymentTable
        data={payments}
        loading={loading}
        currentPage={(filters.page || 0) + 1}
        itemsPerPage={filters.size || 10}
        totalItems={totalItems}
        onPageChange={handlePageChange}
        onViewDetail={(id) => setSelectedPaymentId(id)}
      />

      <Modal isOpen={isAdvSearchOpen} onClose={() => setIsAdvSearchOpen(false)} title="Advanced Search">
        <PaymentAdvancedSearch
          onApply={handleApplySearch}
          onReset={handleResetFilters}
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