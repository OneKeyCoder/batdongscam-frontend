'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, FileText, CheckCircle, TrendingUp, DollarSign, ChevronDown, Plus } from 'lucide-react';
import StatsGrid from '@/app/components/StatsGrid';
import Modal from '@/app/components/ui/Modal';
import ContractTable from '@/app/components/features/admin/contracts/ContractTable';
import ContractAdvancedSearch from '@/app/components/features/admin/contracts/ContractAdvancedSearch';
import AddContractForm from '@/app/components/features/admin/contracts/AddContractForm';
import { contractService, ContractFilters } from '@/lib/api/services/contract.service';
import { reportService } from '@/lib/api/services/statistic-report.service';

export default function ContractsPage() {
  const [isAdvSearchOpen, setIsAdvSearchOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<ContractFilters>({ page: 1, size: 10, search: '' });
  const [keyword, setKeyword] = useState('');

  // Stats state
  const [statsData, setStatsData] = useState({
    totalContracts: 0,
    monthRevenue: 0,
    newThisMonth: 0,
    endThisMonth: 0
  });

  // 1. Fetch Stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [dashboardRes, contractsRes] = await Promise.all([
          reportService.getDashboardTopStats(),
          contractService.getContracts()
        ]);

        const realTotalContracts = (contractsRes as any).paging?.total ?? (contractsRes as any).meta?.total ?? 0;

        if (dashboardRes) {
          setStatsData(prev => ({
            ...prev,
            totalContracts: realTotalContracts, 
            monthRevenue: dashboardRes.monthRevenue || 0
          }));
        }
      } catch (e) {
        console.error("Failed to fetch stats:", e);
      }
    };

    fetchStats();
  }, []);

  // 2. Handlers
  const handleSearch = () => {
    setFilters({
      page: 1,
      size: 10,
      search: keyword.trim(),
      statuses: undefined,
      contractTypes: undefined,
      customerId: undefined,
      agentId: undefined,
      propertyId: undefined,
      startDateFrom: undefined,
      startDateTo: undefined,
      endDateFrom: undefined,
      endDateTo: undefined,
    });
  };

  const handleAdvApply = (advFilters: ContractFilters) => {
    setFilters({
      ...advFilters,
      size: filters.size || 10
    });
    setKeyword('');
    setIsAdvSearchOpen(false);
  };

  // --- Reset Filters ---
  const handleResetFilters = () => {
    setKeyword('');
    setFilters({ page: 1, size: 10, search: '' });
  };

  const handleCreateSuccess = () => {
    setIsAddModalOpen(false);
    window.location.reload();
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', {
    notation: "compact",
    maximumFractionDigits: 1,
    style: 'currency',
    currency: 'USD'
  }).format(val).replace('US$', '$');

  // 3. Stats Data Mapping
  const stats = [
    {
      title: "Total contracts",
      value: statsData.totalContracts.toLocaleString(),
      trend: "",
      icon: FileText
    },
    {
      title: "New this month",
      value: statsData.newThisMonth.toString(),
      trend: "",
      icon: FileText
    },
    {
      title: "End this month",
      value: statsData.endThisMonth.toString(),
      trend: "",
      icon: CheckCircle
    },
    {
      title: "Month Revenue",
      value: formatCurrency(statsData.monthRevenue),
      trend: "+5%",
      trendUp: true,
      icon: DollarSign
    },
  ];

  // Check Advanced Filters
  const hasAdvancedFilters = !!(
    filters.statuses?.length ||
    filters.contractTypes?.length ||
    filters.startDateFrom ||
    filters.startDateTo ||
    filters.endDateFrom ||
    filters.endDateTo ||
    filters.customerId ||
    filters.agentId ||
    filters.propertyId
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Contracts</h2>
        <p className="text-sm text-gray-500">Manage property contracts</p>
      </div>

      <StatsGrid stats={stats} />

      <div className="space-y-4">
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

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAdvSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 bg-white hover:bg-gray-50 font-medium rounded-lg text-sm text-gray-700 transition-all whitespace-nowrap"
            >
              <Filter className="w-4 h-4" /> Advanced Search
            </button>

            {hasAdvancedFilters && (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded hidden sm:inline-block">
                  {[
                    filters.statuses?.length && 'Status',
                    filters.contractTypes?.length && 'Type',
                    (filters.customerId || filters.agentId) && 'Parties',
                    filters.propertyId && 'Property',
                    (filters.startDateFrom || filters.startDateTo) && 'Start Date',
                    (filters.endDateFrom || filters.endDateTo) && 'End Date'
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

            {filters.search && !hasAdvancedFilters && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600 bg-blue-50 px-2 py-1 rounded">
                  Search: "{filters.search}"
                </span>
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-red-600 underline hover:text-red-700"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-sm transition-colors text-sm"
          >
            <Plus className="w-5 h-5" />
            Add Contract
          </button>
        </div>
      </div>

      <ContractTable filters={filters} onFilterChange={setFilters} />

      <Modal isOpen={isAdvSearchOpen} onClose={() => setIsAdvSearchOpen(false)} title="Advanced Search">
        <ContractAdvancedSearch
          key={isAdvSearchOpen ? 'open' : 'closed'}
          onApply={handleAdvApply}
          onReset={handleResetFilters}
        />
      </Modal>

      {/* Modal Add Contract */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create New Contract"
      >
        {isAddModalOpen && (
          <AddContractForm
            onSuccess={handleCreateSuccess}
            onCancel={() => setIsAddModalOpen(false)}
          />
        )}
      </Modal>
    </div>
  );
}