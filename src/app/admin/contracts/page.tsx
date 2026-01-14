'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, FileText, DollarSign, Plus, Package } from 'lucide-react';
import StatsGrid from '@/app/components/StatsGrid';
import Modal from '@/app/components/ui/Modal';
import DepositContractTable from '@/app/components/features/admin/contracts/DepositContractTable';
import PurchaseContractTable from '@/app/components/features/admin/contracts/PurchaseContractTable';
import DepositContractAdvancedSearch from '@/app/components/features/admin/contracts/DepositContractAdvancedSearch';
import PurchaseContractAdvancedSearch from '@/app/components/features/admin/contracts/PurchaseContractAdvancedSearch';
import AddDepositContractForm from '@/app/components/features/admin/contracts/AddDepositContractForm';
import AddPurchaseContractForm from '@/app/components/features/admin/contracts/AddPurchaseContractForm';
import { contractService, DepositContractFilters, PurchaseContractFilters } from '@/lib/api/services/contract.service';
import { reportService } from '@/lib/api/services/statistic-report.service';

type ContractTab = 'deposit' | 'purchase';

export default function ContractsPage() {
  const [activeTab, setActiveTab] = useState<ContractTab>('deposit');
  const [isAdvSearchOpen, setIsAdvSearchOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Separate filter states for each contract type
  const [depositFilters, setDepositFilters] = useState<DepositContractFilters>({ page: 1, size: 10, search: '' });
  const [purchaseFilters, setPurchaseFilters] = useState<PurchaseContractFilters>({ page: 1, size: 10, search: '' });
  const [keyword, setKeyword] = useState('');

  // Stats state
  const [statsData, setStatsData] = useState({
    totalDepositContracts: 0,
    totalPurchaseContracts: 0,
    monthRevenue: 0,
    activeContracts: 0
  });

  // Fetch Stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [dashboardRes, depositRes, purchaseRes] = await Promise.all([
          reportService.getDashboardTopStats(),
          contractService.getDepositContracts({ page: 1, size: 1 }),
          contractService.getPurchaseContracts({ page: 1, size: 1 })
        ]);

        const totalDeposit = (depositRes as any).paging?.total ?? 0;
        const totalPurchase = (purchaseRes as any).paging?.total ?? 0;

        setStatsData({
          totalDepositContracts: totalDeposit,
          totalPurchaseContracts: totalPurchase,
          monthRevenue: dashboardRes?.monthRevenue || 0,
          activeContracts: totalDeposit + totalPurchase // Simplified - could filter by status
        });
      } catch (e) {
        console.error("Failed to fetch stats:", e);
      }
    };

    fetchStats();
  }, []);

  // Get current filters based on active tab
  const getCurrentFilters = () => activeTab === 'deposit' ? depositFilters : purchaseFilters;
  const setCurrentFilters = (filters: any) => {
    if (activeTab === 'deposit') setDepositFilters(filters);
    else setPurchaseFilters(filters);
  };

  // Search handler
  const handleSearch = () => {
    const commonFilters = {
      page: 1,
      size: 10,
      search: keyword.trim(),
      statuses: undefined,
      customerId: undefined,
      agentId: undefined,
      propertyId: undefined,
      ownerId: undefined,
      startDateFrom: undefined,
      startDateTo: undefined,
    };

    if (activeTab === 'deposit') {
      setDepositFilters({
        ...commonFilters,
        endDateFrom: undefined,
        endDateTo: undefined,
      });
    } else {
      // Purchase doesn't have endDate fields
      setPurchaseFilters(commonFilters);
    }
  };

  // Advanced search handlers
  const handleAdvApply = (advFilters: any) => {
    const filters = {
      ...advFilters,
      size: getCurrentFilters().size || 10
    };

    setCurrentFilters(filters);
    setKeyword('');
    setIsAdvSearchOpen(false);
  };

  const handleResetFilters = () => {
    setKeyword('');
    if (activeTab === 'deposit') {
      setDepositFilters({ page: 1, size: 10, search: '' });
    } else {
      setPurchaseFilters({ page: 1, size: 10, search: '' });
    }
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

  // Stats configuration
  const stats = [
    {
      title: "Deposit Contracts",
      value: statsData.totalDepositContracts.toLocaleString(),
      trend: "",
      icon: Package,
      color: "text-blue-600"
    },
    {
      title: "Purchase Contracts",
      value: statsData.totalPurchaseContracts.toLocaleString(),
      trend: "",
      icon: FileText,
      color: "text-green-600"
    },
    {
      title: "Active Contracts",
      value: statsData.activeContracts.toString(),
      trend: "",
      icon: FileText,
      color: "text-purple-600"
    },
    {
      title: "Month Revenue",
      value: formatCurrency(statsData.monthRevenue),
      trend: "+5%",
      trendUp: true,
      icon: DollarSign,
      color: "text-red-600"
    },
  ];

  // Check if there are advanced filters applied
  const hasAdvancedFilters = (() => {
    if (activeTab === 'deposit') {
      const f = depositFilters;
      return !!(
        f.statuses?.length ||
        f.startDateFrom ||
        f.startDateTo ||
        f.endDateFrom ||
        f.endDateTo ||
        f.customerId ||
        f.agentId ||
        f.propertyId ||
        f.ownerId
      );
    } else {
      const f = purchaseFilters;
      return !!(
        f.statuses?.length ||
        f.startDateFrom ||
        f.startDateTo ||
        f.customerId ||
        f.agentId ||
        f.propertyId ||
        f.ownerId
      );
    }
  })();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Contracts Management</h2>
        <p className="text-sm text-gray-500">Manage deposit and purchase contracts</p>
      </div>

      {/* Stats Grid */}
      <StatsGrid stats={stats} />

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={`Search ${activeTab === 'deposit' ? 'deposit' : 'purchase'} contract number, property title...`}
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
                  Filters applied
                </span>
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-red-600 underline hover:text-red-700 whitespace-nowrap"
                >
                  Clear all
                </button>
              </div>
            )}

            {!hasAdvancedFilters && ((activeTab === 'deposit' && depositFilters.search) || (activeTab === 'purchase' && purchaseFilters.search)) && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600 bg-blue-50 px-2 py-1 rounded">
                  Search: "{activeTab === 'deposit' ? depositFilters.search : purchaseFilters.search}"
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
            className={`flex items-center gap-2 px-6 py-2.5 text-white font-bold rounded-xl shadow-sm transition-colors text-sm ${activeTab === 'deposit'
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-red-600 hover:bg-red-700'
              }`}
          >
            <Plus className="w-5 h-5" />
            Add {activeTab === 'deposit' ? 'Deposit' : 'Purchase'} Contract
          </button>
        </div>

        {/* Contract Type Tabs - Border Bottom Style */}
        <div className="flex gap-6 border-b border-gray-200">
          <button
            onClick={() => {
              setActiveTab('deposit');
              setKeyword('');
            }}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors px-2 ${activeTab === 'deposit'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            Deposit Contracts
          </button>
          <button
            onClick={() => {
              setActiveTab('purchase');
              setKeyword('');
            }}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors px-2 ${activeTab === 'purchase'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            Purchase Contracts
          </button>
        </div>
      </div>

      {/* Contract Tables */}
      {activeTab === 'deposit' ? (
        <DepositContractTable
          filters={depositFilters}
          onFilterChange={setDepositFilters}
        />
      ) : (
        <PurchaseContractTable
          filters={purchaseFilters}
          onFilterChange={setPurchaseFilters}
        />
      )}

      {/* Advanced Search Modal */}
      <Modal
        isOpen={isAdvSearchOpen}
        onClose={() => setIsAdvSearchOpen(false)}
        title={`Advanced Search - ${activeTab === 'deposit' ? 'Deposit' : 'Purchase'} Contracts`}
      >
        {activeTab === 'deposit' ? (
          <DepositContractAdvancedSearch
            key={isAdvSearchOpen ? 'open' : 'closed'}
            onApply={handleAdvApply}
            onReset={handleResetFilters}
          />
        ) : (
          <PurchaseContractAdvancedSearch
            key={isAdvSearchOpen ? 'open' : 'closed'}
            onApply={handleAdvApply}
            onReset={handleResetFilters}
          />
        )}
      </Modal>

      {/* Add Contract Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={`Create ${activeTab === 'deposit' ? 'Deposit' : 'Purchase'} Contract`}
      >
        {isAddModalOpen && (
          activeTab === 'deposit' ? (
            <AddDepositContractForm
              onSuccess={handleCreateSuccess}
              onCancel={() => setIsAddModalOpen(false)}
            />
          ) : (
            <AddPurchaseContractForm
              onSuccess={handleCreateSuccess}
              onCancel={() => setIsAddModalOpen(false)}
            />
          )
        )}
      </Modal>
    </div>
  );
}