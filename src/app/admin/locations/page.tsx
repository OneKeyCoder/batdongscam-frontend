'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, Building2, Map, Home, Plus, ChevronDown } from 'lucide-react';
import Modal from '@/app/components/ui/Modal';
import LocationPicker, { LocationSelection } from '@/app/components/LocationPicker';
import LocationsTable from '@/app/components/features/admin/locations/LocationsTable';
import LocationAdvancedSearch from '@/app/components/features/admin/locations/LocationAdvancedSearch';
import AddLocationModal from '@/app/components/features/admin/locations/AddLocationModal';

import { locationService, LocationCardResponse, LocationCardsFilters } from '@/lib/api/services/location.service';

export default function LocationsPage() {
  const [isAdvSearchOpen, setIsAdvSearchOpen] = useState(false);
  const [isLocPickerOpen, setIsLocPickerOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [selectedLocations, setSelectedLocations] = useState<LocationSelection[]>([]);
  const [data, setData] = useState<LocationCardResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  const [statsCount, setStatsCount] = useState({ cities: 0, districts: 0, wards: 0 });

  const [filters, setFilters] = useState<LocationCardsFilters>({
    page: 1, limit: 10, sortBy: 'updatedAt', sortType: 'desc', locationTypeEnum: 'CITY'
  });
  const [keyword, setKeyword] = useState('');

  // 1. Fetch List
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await locationService.getLocationCards(filters);
      setData(res.data);
      if (res.paging) setTotalItems(res.paging.total);
    } catch (error) {
      console.error("Failed to fetch locations", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch Stats
  const fetchStats = async () => {
    try {
      const [citiesRes, districtsRes, wardsRes] = await Promise.all([
        locationService.getLocationCards({ page: 1, limit: 1, locationTypeEnum: 'CITY' }),
        locationService.getLocationCards({ page: 1, limit: 1, locationTypeEnum: 'DISTRICT' }),
        locationService.getLocationCards({ page: 1, limit: 1, locationTypeEnum: 'WARD' })
      ]);

      setStatsCount({
        cities: citiesRes.paging?.total || 0,
        districts: districtsRes.paging?.total || 0,
        wards: wardsRes.paging?.total || 0
      });
    } catch (error) {
      console.error("Failed to fetch stats", error);
    }
  };

  useEffect(() => { fetchData(); }, [filters]);
  useEffect(() => { fetchStats(); }, []);

  const handlePageChange = (newPage: number) => setFilters(prev => ({ ...prev, page: newPage }));
  const handleSearch = () => setFilters(prev => ({ ...prev, keyWord: keyword, page: 1 }));

  const handleApplyAdvancedSearch = (newFilters: LocationCardsFilters) => {
    const cityIds = selectedLocations.filter(l => l.type === 'CITY').map(l => l.id);
    const districtIds = selectedLocations.filter(l => l.type === 'DISTRICT').map(l => l.id);
    const finalFilters = { ...newFilters, cityIds: cityIds.length ? cityIds : undefined, districtIds: districtIds.length ? districtIds : undefined, page: 1 };
    setFilters(prev => ({ ...prev, ...finalFilters }));
    setIsAdvSearchOpen(false);
  };

  // --- Handle Reset & Check Filters ---
  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      sortBy: 'updatedAt',
      sortType: 'desc',
      locationTypeEnum: 'CITY',
      keyWord: ''
    });
    setKeyword('');
    setSelectedLocations([]);
  };

  const hasAdvancedFilters = !!(
    // Array checks
    filters.cityIds?.length ||
    filters.districtIds?.length ||
    // Boolean checks
    filters.isActive !== undefined ||
    // Range/Number checks
    filters.minAvgLandPrice !== undefined ||
    filters.maxAvgLandPrice !== undefined ||
    filters.minArea !== undefined ||
    filters.maxArea !== undefined ||
    filters.minPopulation !== undefined ||
    filters.maxPopulation !== undefined
  );
  // ------------------------------------------

  const stats = [
    { title: 'Total Cities', value: statsCount.cities.toLocaleString(), icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Total Districts', value: statsCount.districts.toLocaleString(), icon: Map, color: 'text-green-600', bg: 'bg-green-50' },
    { title: 'Total Wards', value: statsCount.wards.toLocaleString(), icon: Home, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Locations Management</h2>
        <p className="text-sm text-gray-500">Manage all your Locations</p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
              <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {/* SEARCH */}
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text" placeholder="Search location name..."
            className="w-full pl-12 pr-24 py-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-red-500 shadow-sm text-sm"
            value={keyword} onChange={(e) => setKeyword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch} className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-600 text-white font-bold px-6 py-1.5 rounded-lg text-sm hover:bg-red-700 transition-colors">
            Search
          </button>
        </div>

        {/* CONTROLS */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsAdvSearchOpen(true)} className="flex items-center gap-2 px-4 py-2 border bg-white rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm transition-colors text-gray-700">
              <Filter className="w-4 h-4" />
              Advanced Search
            </button>

            {/* Filter Summary & Clear */}
            {hasAdvancedFilters && (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                  Filtered
                </span>
                <button onClick={handleResetFilters} className="text-xs text-red-600 underline hover:text-red-700 whitespace-nowrap">
                  Clear all
                </button>
              </div>
            )}

            <div className="relative">
              <select
                value={filters.locationTypeEnum}
                onChange={(e) => setFilters(prev => ({ ...prev, locationTypeEnum: e.target.value as any, page: 1 }))}
                className="appearance-none pl-4 pr-10 py-2 border border-gray-300 bg-white rounded-lg text-sm font-medium text-gray-700 cursor-pointer shadow-sm focus:outline-none focus:border-red-500 hover:border-gray-400 transition-colors min-w-[120px]"
              >
                <option value="CITY">City</option>
                <option value="DISTRICT">District</option>
                <option value="WARD">Ward</option>
              </select>
              <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-bold rounded-lg text-sm hover:bg-red-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Location
          </button>
        </div>
      </div>

      {/* TABLE */}
      <LocationsTable
        data={data}
        isLoading={loading}
        totalItems={totalItems}
        currentPage={filters.page || 1}
        itemsPerPage={filters.limit || 10}
        onPageChange={handlePageChange}
        onRefresh={() => { fetchData(); fetchStats(); }}
      />

      {/* MODALS */}
      <Modal isOpen={isAdvSearchOpen} onClose={() => { if (!isLocPickerOpen) setIsAdvSearchOpen(false); }} title="Advanced Search">
        <LocationAdvancedSearch selectedLocations={selectedLocations} onRemoveLocation={(id) => setSelectedLocations(prev => prev.filter(l => l.id !== id))} onOpenLocationPicker={() => setIsLocPickerOpen(true)} onApply={handleApplyAdvancedSearch} onReset={handleResetFilters} />
      </Modal>

      <LocationPicker isOpen={isLocPickerOpen} onClose={() => setIsLocPickerOpen(false)} initialSelected={selectedLocations} onConfirm={(newLocs) => { setSelectedLocations(newLocs); setIsLocPickerOpen(false); }} />

      <AddLocationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => { fetchData(); fetchStats(); setIsAddModalOpen(false); }}
      />
    </div>
  );
}