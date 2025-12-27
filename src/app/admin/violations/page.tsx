'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, AlertTriangle, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import StatsGrid from '@/app/components/StatsGrid';
import Modal from '@/app/components/ui/Modal';
import ViolationTable from '@/app/components/features/admin/violations/ViolationTable';
import ViolationAdvancedSearch from '@/app/components/features/admin/violations/ViolationAdvancedSearch';
import { reportService, ViolationReportStats } from '@/lib/api/services/statistic-report.service';
import { AdminViolationFilters } from '@/lib/api/services/violation.service';

export default function ViolationsPage() {
  const [isAdvSearchOpen, setIsAdvSearchOpen] = useState(false);

  // State Filters
  const [filters, setFilters] = useState<AdminViolationFilters>({
    page: 1,
    limit: 10,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  const [stats, setStats] = useState<ViolationReportStats | null>(null);
  const [keyword, setKeyword] = useState('');

  // Fetch Stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const currentYear = new Date().getFullYear();
        const data = await reportService.getViolationStats(currentYear);
        setStats(data);
      } catch (error) {
        console.error("Fetch violation stats error", error);
      }
    };
    fetchStats();
  }, []);

  const handleSearch = () => {
    setFilters(prev => ({
      ...prev,
      name: keyword || undefined,  
      page: 1
    }));
  };

  const handleAdvApply = (advFilters: AdminViolationFilters) => {
    setFilters({
      page: 1,
      limit: 10,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      ...advFilters  
    });
    setIsAdvSearchOpen(false);
  };

  const handleReset = () => {
    setKeyword('');
    setFilters({
      page: 1,
      limit: 10,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear()
    });
  };

  const formatNum = (num?: number) => {
    if (num === undefined) return "---";
    return new Intl.NumberFormat('en-US', { notation: "compact" }).format(num);
  };

  const statsData = [
    { title: "Total reports", value: formatNum(stats?.totalViolationReports), trend: "", icon: AlertTriangle },
    { title: "New this month", value: formatNum(stats?.newThisMonth), trend: "", icon: TrendingUp },
    { title: "Unresolved", value: formatNum(stats?.unsolved), trend: "", icon: Clock },
    { title: "Resolved", value: formatNum((stats?.totalViolationReports || 0) - (stats?.unsolved || 0)), trend: "", icon: CheckCircle },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Violation Reports</h2>
        <p className="text-sm text-gray-500">Manage reported content and users</p>
      </div>

      <StatsGrid stats={statsData} />

      <div className="space-y-4">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search reporter name, reported name..."
            className="w-full pl-12 pr-24 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-1.5 rounded-lg text-sm"
          >
            Search
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAdvSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 bg-white hover:bg-gray-50 font-medium rounded-lg text-sm text-gray-700"
          >
            <Filter className="w-4 h-4" /> Advanced Search
            {(filters.statuses || filters.violationTypes) && (
              <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded ml-1">
                {(filters.statuses?.length || 0) + (filters.violationTypes?.length || 0)}
              </span>
            )}
          </button>
        </div>
      </div>

      <ViolationTable filters={filters} onFilterChange={setFilters} />

      <Modal isOpen={isAdvSearchOpen} onClose={() => setIsAdvSearchOpen(false)} title="Advanced Search">
        <ViolationAdvancedSearch
          onApply={handleAdvApply}
          onReset={handleReset}  
        />
      </Modal>
    </div>
  );
}