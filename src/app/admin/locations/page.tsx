'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import Modal from '@/app/components/ui/Modal';
import LocationPicker, { LocationSelection } from '@/app/components/LocationPicker';
import LocationsTable from '@/app/components/features/admin/locations/LocationsTable';
import LocationAdvancedSearch from '@/app/components/features/admin/locations/LocationAdvancedSearch';

import { locationService, LocationCardResponse, LocationCardsFilters } from '@/lib/api/services/location.service';

export default function LocationsPage() {
  const [isAdvSearchOpen, setIsAdvSearchOpen] = useState(false);
  const [isLocPickerOpen, setIsLocPickerOpen] = useState(false);

  // State quản lý Location Selection (Array Object)
  const [selectedLocations, setSelectedLocations] = useState<LocationSelection[]>([]);

  // State Data & Filters
  const [data, setData] = useState<LocationCardResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [filters, setFilters] = useState<LocationCardsFilters>({
    page: 1,
    limit: 10,
    sortBy: 'updatedAt',
    sortType: 'desc',
    locationTypeEnum: 'CITY'
  });

  const [keyword, setKeyword] = useState('');

  // 1. Fetch Data
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

  useEffect(() => {
    fetchData();
  }, [filters]);

  // Handlers
  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, keyWord: keyword, page: 1 }));
  };

  const handleApplyAdvancedSearch = (newFilters: LocationCardsFilters) => {
    // Map selected locations to IDs
    const cityIds = selectedLocations.filter(l => l.type === 'CITY').map(l => l.id);
    const districtIds = selectedLocations.filter(l => l.type === 'DISTRICT').map(l => l.id);

    const finalFilters = {
      ...newFilters,
      cityIds: cityIds.length ? cityIds : undefined,
      districtIds: districtIds.length ? districtIds : undefined,
      page: 1
    };

    setFilters(prev => ({ ...prev, ...finalFilters }));
    setIsAdvSearchOpen(false);
  };

  const handleRemoveLocation = (id: string) => {
    setSelectedLocations(prev => prev.filter(l => l.id !== id));
  };

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold text-gray-900 mb-1">Locations Management</h2></div>

      <div className="space-y-4">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search locations..."
            className="w-full pl-12 pr-24 py-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-red-500"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-600 text-white font-bold px-6 py-1.5 rounded-lg text-sm hover:bg-red-700"
          >
            Search
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsAdvSearchOpen(true)} className="flex items-center gap-2 px-3 py-2 border bg-white rounded-lg text-sm font-medium hover:bg-gray-50">
            <Filter className="w-4 h-4" /> Advanced Search
          </button>

          <div className="flex bg-gray-100 p-1 rounded-lg ml-auto">
            {(['CITY', 'DISTRICT', 'WARD'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilters(prev => ({ ...prev, locationTypeEnum: type, page: 1 }))}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${filters.locationTypeEnum === type ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      <LocationsTable
        data={data}
        isLoading={loading}
        totalItems={totalItems}
        currentPage={filters.page || 1}
        itemsPerPage={filters.limit || 10}
        onPageChange={handlePageChange}
      />

      <Modal isOpen={isAdvSearchOpen} onClose={() => { if (!isLocPickerOpen) setIsAdvSearchOpen(false); }} title="Advanced Search">
        <LocationAdvancedSearch
          selectedLocations={selectedLocations}
          onRemoveLocation={handleRemoveLocation}
          onOpenLocationPicker={() => setIsLocPickerOpen(true)}
          onApply={handleApplyAdvancedSearch}
          onReset={() => {
            setFilters({ page: 1, limit: 10, sortBy: 'updatedAt', sortType: 'desc', locationTypeEnum: 'CITY' });
            setSelectedLocations([]);
          }}
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