'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, FileText, CheckCircle, TrendingUp, DollarSign, ChevronDown } from 'lucide-react';
import StatsGrid from '@/app/components/StatsGrid';
import Modal from '@/app/components/ui/Modal';
import ContractTable from '@/app/components/features/admin/contracts/ContractTable';
import ContractAdvancedSearch from '@/app/components/features/admin/contracts/ContractAdvancedSearch';
import { ContractFilters } from '@/lib/api/services/contract.service';
import { reportService } from '@/lib/api/services/statistic-report.service';

export default function ContractsPage() {
  const [isAdvSearchOpen, setIsAdvSearchOpen] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<ContractFilters>({ page: 1, size: 10, search: '' });
  const [keyword, setKeyword] = useState('');

  // Stats state
  const [statsData, setStatsData] = useState({
    totalContracts: 0,
    monthRevenue: 0,
    // Các trường này API TopStats chưa trả về, tạm thời để 0 hoặc cần gọi API khác
    newThisMonth: 0,
    endThisMonth: 0
  });

  // 1. Fetch Dashboard Stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await reportService.getDashboardTopStats();
        if (res) {
          setStatsData(prev => ({
            ...prev,
            totalContracts: res.totalContracts || 0,
            monthRevenue: res.monthRevenue || 0
            // API không trả về new/end contract trong tháng này
          }));
        }
      } catch (e) {
        console.error("Failed to fetch dashboard stats:", e);
      }
    };
    fetchStats();
  }, []);

  // 2. Handlers
  const handleSearch = () => {
    setFilters(prev => ({ ...prev, page: 1, search: keyword.trim() }));
  };

  const handleAdvApply = (advFilters: ContractFilters) => {
    setFilters(prev => ({ ...prev, ...advFilters, page: 1 }));
    setIsAdvSearchOpen(false);
  };

  const handleResetFilters = () => {
    setKeyword('');
    setFilters({ page: 1, size: 10, search: '' });
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', {
    notation: "compact",
    maximumFractionDigits: 1,
    style: 'currency',
    currency: 'USD' // Hoặc VND tùy bạn
  }).format(val).replace('US$', '$'); // Format ngắn gọn $10K, $2.5M

  // 3. Stats Data Mapping
  const stats = [
    {
      title: "Total contracts",
      value: statsData.totalContracts.toLocaleString(),
      trend: "+12%", // Mock trend vì API chưa có
      trendUp: true,
      icon: FileText
    },
    {
      title: "New this month",
      value: statsData.newThisMonth.toString(), // Placeholder
      trend: "",
      icon: FileText
    },
    {
      title: "End this month",
      value: statsData.endThisMonth.toString(), // Placeholder
      trend: "",
      icon: CheckCircle
    },
    {
      title: "Month Revenue",
      value: formatCurrency(statsData.monthRevenue),
      trend: "+5%", // Mock trend
      trendUp: true,
      icon: DollarSign
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Contracts</h2>
        <p className="text-sm text-gray-500">Manage property contracts</p>
      </div>

      {/* Hiển thị Stats Grid với dữ liệu thật từ API */}
      <StatsGrid stats={stats} />

      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search contract number, property title..."
            className="w-full pl-12 pr-24 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-1.5 rounded-lg transition-colors text-sm"
          >
            Search
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAdvSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 bg-white hover:bg-gray-50 font-medium rounded-lg text-sm text-gray-700 transition-all whitespace-nowrap"
          >
            <Filter className="w-4 h-4" /> Advanced Search
          </button>

          {(filters.statuses?.length || filters.contractTypes?.length || filters.startDateFrom) && (
            <button onClick={handleResetFilters} className="text-xs text-red-600 underline">
              Clear filters
            </button>
          )}
        </div>
      </div>

      <ContractTable filters={filters} onFilterChange={setFilters} />

      <Modal isOpen={isAdvSearchOpen} onClose={() => setIsAdvSearchOpen(false)} title="Advanced Search">
        <ContractAdvancedSearch
          onApply={handleAdvApply}
          onReset={handleResetFilters}
        />
      </Modal>
    </div>
  );
}