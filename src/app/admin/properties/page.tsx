'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, Home, Layout, Building2, MapPin } from 'lucide-react';
import StatsGrid from '@/app/components/StatsGrid';
import Modal from '@/app/components/ui/Modal';
import LocationPicker, { LocationSelection } from '@/app/components/LocationPicker';
import PropertiesTable from '@/app/components/features/admin/properties/PropertiesTable';
import AdvancedSearchForm from '@/app/components/features/admin/properties/AdvancedSearchForm';

// Import Service & Types
import { propertyService } from '@/lib/api/services/property.service';
import { PropertyCard, PropertyFilters } from '@/lib/api/types';
import { reportService } from '@/lib/api/services/statistic-report.service';

export default function PropertiesPage() {
  const [isAdvSearchOpen, setIsAdvSearchOpen] = useState(false);
  const [isLocPickerOpen, setIsLocPickerOpen] = useState(false);
  const [data, setData] = useState<PropertyCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [filters, setFilters] = useState<PropertyFilters>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortType: 'desc'
  });

  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedLocations, setSelectedLocations] = useState<LocationSelection[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await propertyService.getPropertyCards(filters);
      setData(res.data);
      if (res.paging) {
        setTotalItems(res.paging.total);
      }
    } catch (error) {
      console.error("Failed to fetch properties", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, page: 1 }));
    fetchData();
  };

  const handleAdvancedSearchApply = (newFilters: PropertyFilters) => {
    const finalFilters = { ...newFilters };
    const cityIds = selectedLocations.filter(l => l.type === 'CITY').map(l => l.id);
    const districtIds = selectedLocations.filter(l => l.type === 'DISTRICT').map(l => l.id);
    const wardIds = selectedLocations.filter(l => l.type === 'WARD').map(l => l.id);

    if (cityIds.length) finalFilters.cityIds = cityIds;
    if (districtIds.length) finalFilters.districtIds = districtIds;
    if (wardIds.length) finalFilters.wardIds = wardIds;

    setFilters(prev => ({ ...prev, ...finalFilters, page: 1 }));
    setIsAdvSearchOpen(false);
  };

  const handleRemoveLocation = (id: string) => {
    setSelectedLocations(prev => prev.filter(l => l.id !== id));
  };

  const stats = [
    { title: "Total properties", value: `${totalItems}`, trend: "", icon: Home },
    { title: "For Sale", value: "---", trend: "", icon: Building2 },
    { title: "For Rent", value: "---", trend: "", icon: Layout },
    { title: "Active Locations", value: "---", trend: "", icon: MapPin },
  ];

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold text-gray-900 mb-1">Properties Management</h2></div>
      <StatsGrid stats={stats} />

      <div className="space-y-4">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search properties (Name, Address)..."
            className="w-full pl-12 pr-24 py-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-red-500"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-600 text-white font-bold px-6 py-1.5 rounded-lg text-sm hover:bg-red-700 transition-colors"
          >
            Search
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAdvSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 bg-white hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors"
          >
            <Filter className="w-4 h-4" /> Advanced Search
            {/* Đếm số lượng filter đang active (trừ page/limit/sort) */}
            <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded ml-1">
              {Object.keys(filters).length - 4 > 0 ? Object.keys(filters).length - 4 : 0}
            </span>
          </button>
        </div>
      </div>

      <PropertiesTable
        data={data}
        isLoading={loading}
        totalItems={totalItems}
        currentPage={filters.page || 1}
        itemsPerPage={filters.limit || 10}
        onPageChange={handlePageChange}
        onRefresh={fetchData}
      />

      <Modal isOpen={isAdvSearchOpen} onClose={() => { if (!isLocPickerOpen) setIsAdvSearchOpen(false); }} title="Advanced Search">
        <AdvancedSearchForm
          selectedLocations={selectedLocations}
          onOpenLocationPicker={() => setIsLocPickerOpen(true)}
          onApply={handleAdvancedSearchApply}
          onReset={() => {
            setFilters({ page: 1, limit: 10, sortBy: 'createdAt', sortType: 'desc' });
            setSelectedLocations([]);
          }}
          onRemoveLocation={handleRemoveLocation}
        />
      </Modal>

      <LocationPicker
        isOpen={isLocPickerOpen}
        onClose={() => setIsLocPickerOpen(false)}
        initialSelected={selectedLocations}
        onConfirm={(newLocs) => {
          setSelectedLocations(newLocs);
          setIsLocPickerOpen(false);
        }}
      />
    </div>
  );
}