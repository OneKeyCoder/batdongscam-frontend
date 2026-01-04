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

  const [customerFilters, setCustomerFilters] = useState<CustomerFilters>({ page: 1, limit: 10 });
  const [ownerFilters, setOwnerFilters] = useState<PropertyOwnerFilters>({ page: 1, limit: 10 });

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
    if (tab === 'customers') {
      setCustomerFilters({ page: 1, limit: 10 });
    } else {
      setOwnerFilters({ page: 1, limit: 10 });
    }
  };

  const getLocationIds = () => {
    const cityIds = locations.filter(l => ['CITY', 'PROVINCE'].includes(l.type?.toUpperCase())).map(l => l.id);
    const districtIds = locations.filter(l => l.type?.toUpperCase() === 'DISTRICT').map(l => l.id);
    const wardIds = locations.filter(l => l.type?.toUpperCase() === 'WARD').map(l => l.id);
    return { cityIds: cityIds.length > 0 ? cityIds : undefined, districtIds: districtIds.length > 0 ? districtIds : undefined, wardIds: wardIds.length > 0 ? wardIds : undefined };
  };

  const handleKeywordSearch = () => {
    if (activeTab === 'customers') {
      setCustomerFilters(prev => ({ ...prev, name: keyword, page: 1 }));
    } else {
      setOwnerFilters(prev => ({ ...prev, name: keyword, page: 1 }));
    }
  };

  const cleanFilters = (filters: any) => {
    return Object.fromEntries(Object.entries(filters).filter(([_, v]) => v != null && v !== '' && v !== 'All'));
  };

  const handleCustomerAdvApply = (filters: CustomerFilters) => {
    const locIds = getLocationIds();
    const newFilters = cleanFilters({ ...filters, ...locIds });
    setCustomerFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
    setIsAdvSearchOpen(false);
  };

  const handleOwnerAdvApply = (filters: PropertyOwnerFilters) => {
    const locIds = getLocationIds();
    const newFilters = cleanFilters({ ...filters, ...locIds });
    setOwnerFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
    setIsAdvSearchOpen(false);
  };

  // [FIX] Helper Logic Stats Chính Xác Hơn
  const currentMonth = new Date().getMonth() + 1;

  // Lấy giá trị tháng hiện tại (Nếu API trả về lũy kế thì dùng cái này là Total)
  const getCurrentVal = (record?: Record<number, number>) => record ? (record[currentMonth] || 0) : 0;

  // Tính tổng dồn (Nếu API trả về số lượng mới từng tháng)
  const getSumVal = (record?: Record<number, number>) => record ? Object.values(record).reduce((a, b) => a + b, 0) : 0;

  // [FIX] Format Tiền Việt Nam (Tỷ, Triệu)
  const formatVNCurrency = (amount: number) => {
    if (!amount) return '0 ₫';
    if (amount >= 1_000_000_000_000) return `${(amount / 1_000_000_000_000).toFixed(1)}T ₫`; // Nghìn tỷ
    if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)}B ₫`; // Tỷ
    if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M ₫`; // Triệu
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatNumber = (num: number) => new Intl.NumberFormat('en-US').format(num);

  // Giả định: 
  // - totalCustomers: Là số lượng tích lũy (Cumulative) -> Lấy tháng hiện tại là Total.
  // - totalSpending: Là số tiền chi tiêu trong tháng (Monthly) -> Cộng dồn là Total Year.
  // Bạn có thể đảo lại logic tùy thuộc vào thực tế API trả về cái gì.

  const activeStats = activeTab === 'customers' ?
    [
      // Total: Lấy giá trị mới nhất (tháng hiện tại)
      { title: "Total customers", value: formatNumber(getCurrentVal(customerStatsData?.totalCustomers)), trend: "", icon: Users },
      // New: (Tháng này - Tháng trước) hoặc nếu API trả về 'new' riêng thì dùng sum. Ở đây tạm tính là số tăng thêm.
      {
        title: "New this month",
        value: formatNumber((customerStatsData?.totalCustomers?.[currentMonth] || 0) - (customerStatsData?.totalCustomers?.[currentMonth - 1] || 0)),
        trend: "", icon: Users
      },
      // Spending: Cộng dồn cả năm
      { title: "Total Spending", value: formatVNCurrency(getSumVal(customerStatsData?.totalSpending)), trend: "", icon: TrendingUp },
      // Avg: Lấy trung bình tháng hiện tại
      { title: "Avg Spending", value: formatVNCurrency(getCurrentVal(customerStatsData?.avgSpendingPerCustomer)), trend: "", icon: Smile },
    ] :
    [
      { title: "Total owners", value: formatNumber(getCurrentVal(ownerStatsData?.totalOwners)), trend: "", icon: Users },
      {
        title: "New this month",
        value: formatNumber((ownerStatsData?.totalOwners?.[currentMonth] || 0) - (ownerStatsData?.totalOwners?.[currentMonth - 1] || 0)),
        trend: "", icon: Users
      },
      { title: "Contribution value", value: formatVNCurrency(getSumVal(ownerStatsData?.totalContributionValue)), trend: "", icon: TrendingUp },
      { title: "Avg Contribution", value: formatVNCurrency(getCurrentVal(ownerStatsData?.avgContributionPerOwner)), trend: "", icon: Award },
    ];

  const countFilters = () => {
    const currentFilters = activeTab === 'customers' ? customerFilters : ownerFilters;
    const count = Object.keys(currentFilters).length - 2;
    return count > 0 ? count : 0;
  };

  return (
    <div className="space-y-6 w-full">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Customer & Owners</h2>
        <p className="text-sm text-gray-500">Manage your user base</p>
      </div>

      <StatsGrid stats={activeStats} />

      <div className="space-y-4">
        {/* Search */}
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={activeTab === 'customers' ? "Search customer name..." : "Search property owner name..."}
            className="w-full pl-12 pr-24 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white shadow-sm"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleKeywordSearch()}
          />
          <button onClick={handleKeywordSearch} className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-1.5 rounded-lg text-sm transition-colors">
            Search
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button onClick={() => setIsAdvSearchOpen(true)} className="flex items-center gap-2 px-3 py-2 border border-gray-300 bg-white hover:bg-gray-50 font-medium rounded-lg text-sm text-gray-700 transition-all shadow-sm">
            <Filter className="w-4 h-4" /> Advanced Search
            {countFilters() > 0 && <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded ml-1">{countFilters()}</span>}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-gray-200">
          <button onClick={() => handleTabChange('customers')} className={`pb-3 text-sm font-bold border-b-2 transition-colors px-2 ${activeTab === 'customers' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Customers</button>
          <button onClick={() => handleTabChange('owners')} className={`pb-3 text-sm font-bold border-b-2 transition-colors px-2 ${activeTab === 'owners' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Property Owners</button>
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
            onReset={() => { setLocations([]); setCustomerFilters({ page: 1, limit: 10 }); }}
          />
        ) : (
          <OwnersAdvancedSearch
            selectedLocations={locations}
            onRemoveLocation={(id) => setLocations(prev => prev.filter(l => l.id !== id))}
            onOpenLocationPicker={() => setIsLocPickerOpen(true)}
            onApply={handleOwnerAdvApply}
            onReset={() => { setLocations([]); setOwnerFilters({ page: 1, limit: 10 }); }}
          />
        )}
      </Modal>

      <LocationPicker isOpen={isLocPickerOpen} onClose={() => setIsLocPickerOpen(false)} initialSelected={locations} onConfirm={(newLocs) => { setLocations(newLocs); setIsLocPickerOpen(false); }} />
    </div>
  );
}