'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, Users, TrendingUp, Smile, Award } from 'lucide-react';
import StatsGrid from '@/app/components/StatsGrid';
import Modal from '@/app/components/ui/Modal';
import LocationPicker, { LocationSelection } from '@/app/components/LocationPicker';
import CustomersTable from '@/app/components/features/admin/customers/CustomersTable';
import OwnersTable from '@/app/components/features/admin/customers/OwnersTable';
import CustomersAdvancedSearch from '@/app/components/features/admin/customers/CustomersAdvancedSearch';
import OwnersAdvancedSearch from '@/app/components/features/admin/customers/OwnersAdvancedSearch';
import { reportService, CustomerStats, PropertyOwnerStats } from '@/lib/api/services/statistic-report.service';
import { CustomerFilters, PropertyOwnerFilters } from '@/lib/api/services/account.service';

export default function CustomersPage() {
  const [activeTab, setActiveTab] = useState<'customers' | 'owners'>('customers');
  const [isAdvSearchOpen, setIsAdvSearchOpen] = useState(false);
  const [isLocPickerOpen, setIsLocPickerOpen] = useState(false);

  const [locations, setLocations] = useState<LocationSelection[]>([]);
  const [keyword, setKeyword] = useState('');

  // Filters State
  const [customerFilters, setCustomerFilters] = useState<CustomerFilters>({});
  const [ownerFilters, setOwnerFilters] = useState<PropertyOwnerFilters>({});

  // Stats Data
  const [customerStatsData, setCustomerStatsData] = useState<CustomerStats | null>(null);
  const [ownerStatsData, setOwnerStatsData] = useState<PropertyOwnerStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const currentYear = new Date().getFullYear();
        const [cStats, oStats] = await Promise.all([
          reportService.getCustomerStats(currentYear),
          reportService.getPropertyOwnerStats(currentYear)
        ]);
        setCustomerStatsData(cStats);
        setOwnerStatsData(oStats);
      } catch (error) {
        console.error("Failed to fetch stats", error);
      }
    };
    fetchStats();
  }, []);

  const handleTabChange = (tab: 'customers' | 'owners') => {
    setActiveTab(tab);
    setLocations([]);
    setKeyword('');
    setCustomerFilters({});
    setOwnerFilters({});
  };

  const getLocationIds = () => {
    const cityIds = locations
      .filter(l => ['CITY', 'PROVINCE'].includes(l.type?.toUpperCase()))
      .map(l => l.id);

    const districtIds = locations
      .filter(l => l.type?.toUpperCase() === 'DISTRICT')
      .map(l => l.id);

    const wardIds = locations
      .filter(l => l.type?.toUpperCase() === 'WARD')
      .map(l => l.id);

    return {
      cityIds: cityIds.length > 0 ? cityIds : undefined,
      districtIds: districtIds.length > 0 ? districtIds : undefined,
      wardIds: wardIds.length > 0 ? wardIds : undefined
    };
  };

  // --- HANDLERS ---

  const handleKeywordSearch = () => {
    if (activeTab === 'customers') {
      setCustomerFilters(prev => ({ ...prev, name: keyword, page: 1 }));
    } else {
      setOwnerFilters(prev => ({ ...prev, name: keyword, page: 1 }));
    }
  };

  const handleCustomerAdvApply = (filters: CustomerFilters) => {
    const locIds = getLocationIds();
    const newFilters = cleanFilters({
      ...filters,
      ...locIds
    });
    setCustomerFilters(prev => ({
      ...prev,
      ...filters,
      ...locIds,
      ...newFilters,
      page: 1
    }));
    setIsAdvSearchOpen(false);
  };

  // Handler cho Owner Apply
  const handleOwnerAdvApply = (filters: PropertyOwnerFilters) => {
    const locIds = getLocationIds();
    const newFilters = cleanFilters({
      ...filters,
      ...locIds
    });
    setOwnerFilters(prev => ({
      ...prev,
      ...filters,
      ...locIds,
      ...newFilters,
      page: 1
    }));
    setIsAdvSearchOpen(false);
  };

  const cleanFilters = (filters: any) => {
    return Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v != null && v !== '' && v !== 'All')
    );
  };

  // Helper Stats Format
  const sumValues = (record?: Record<number, number>) => record ? Object.values(record).reduce((a, b) => a + b, 0) : 0;
  const getCurrentMonthValue = (record?: Record<number, number>) => record ? (record[new Date().getMonth() + 1] || 0) : 0;
  const formatCompact = (num: number, isCurrency = false) => {
    if (num === undefined || num === null) return "---";
    const formatter = new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short", maximumFractionDigits: 1 });
    const value = formatter.format(num);
    return isCurrency ? `${value} VND` : value;
  };

  const activeStats = activeTab === 'customers' ?
    [
      { title: "Total customers", value: formatCompact(sumValues(customerStatsData?.totalCustomers)), trend: "", icon: Users },
      { title: "New this month", value: formatCompact(getCurrentMonthValue(customerStatsData?.totalCustomers)), trend: "", icon: Users },
      { title: "Total Spending", value: formatCompact(sumValues(customerStatsData?.totalSpending), true), trend: "", icon: TrendingUp },
      { title: "Avg Spending", value: formatCompact(sumValues(customerStatsData?.avgSpendingPerCustomer) / 12, true), trend: "", icon: Smile },
    ] :
    [
      { title: "Total owners", value: formatCompact(sumValues(ownerStatsData?.totalOwners)), trend: "", icon: Users },
      { title: "New this month", value: formatCompact(getCurrentMonthValue(ownerStatsData?.totalOwners)), trend: "", icon: Users },
      { title: "Contribution value", value: formatCompact(sumValues(ownerStatsData?.totalContributionValue), true), trend: "", icon: TrendingUp },
      { title: "Avg Contribution", value: formatCompact(sumValues(ownerStatsData?.avgContributionPerOwner) / 12, true), trend: "", icon: Award },
    ];

  return (
    <div className="space-y-6 w-full">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Customer & Owners</h2>
        <p className="text-sm text-gray-500">Manage your user base</p>
      </div>

      <StatsGrid stats={activeStats} />

      <div className="space-y-4">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={activeTab === 'customers' ? "Customer's name" : "Property owner's name"}
            className="w-full pl-12 pr-24 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleKeywordSearch()}
          />
          <button
            onClick={handleKeywordSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-1.5 rounded-lg text-sm transition-colors"
          >
            Search
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setIsAdvSearchOpen(true)} className="flex items-center gap-2 px-3 py-2 border border-gray-300 bg-white hover:bg-gray-50 font-medium rounded-lg text-sm text-gray-700 transition-all">
            <Filter className="w-4 h-4" /> Advanced Search
            {(Object.keys(activeTab === 'customers' ? customerFilters : ownerFilters).length > 2) &&
              <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded ml-1">
                {Object.keys(activeTab === 'customers' ? customerFilters : ownerFilters).length - 2}
              </span>
            }
          </button>
        </div>

        <div className="flex gap-6 border-b border-gray-200 pb-0 mt-4">
          <button onClick={() => handleTabChange('customers')} className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'customers' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Customers</button>
          <button onClick={() => handleTabChange('owners')} className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'owners' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Property Owners</button>
        </div>
      </div>

      {activeTab === 'customers' ? (
        <CustomersTable filters={customerFilters} onFilterChange={setCustomerFilters} />
      ) : (
        <OwnersTable filters={ownerFilters} onFilterChange={setOwnerFilters} />
      )}


      <Modal isOpen={isAdvSearchOpen} onClose={() => { if (!isLocPickerOpen) setIsAdvSearchOpen(false); }} title="Advanced Search">
        {activeTab === 'customers' ? (
          <CustomersAdvancedSearch
            selectedLocations={locations}
            onRemoveLocation={(id) => setLocations(prev => prev.filter(l => l.id !== id))}
            onOpenLocationPicker={() => setIsLocPickerOpen(true)}
            onApply={handleCustomerAdvApply}
            onReset={() => { setLocations([]); setCustomerFilters({}); }}
          />
        ) : (
          <OwnersAdvancedSearch
            selectedLocations={locations}
            onRemoveLocation={(id) => setLocations(prev => prev.filter(l => l.id !== id))}
            onOpenLocationPicker={() => setIsLocPickerOpen(true)}
            onApply={handleOwnerAdvApply}
            onReset={() => { setLocations([]); setOwnerFilters({}); }}
          />
        )}
      </Modal>

      <LocationPicker
        isOpen={isLocPickerOpen}
        onClose={() => setIsLocPickerOpen(false)}
        initialSelected={locations}
        onConfirm={(newLocs) => {
          setLocations(newLocs);
          setIsLocPickerOpen(false);
        }}
      />
    </div>
  );
}