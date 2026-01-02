'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, Home, Layout, Building2, MapPin, X } from 'lucide-react';
import StatsGrid from '@/app/components/StatsGrid';
import Modal from '@/app/components/ui/Modal';
import LocationPicker, { LocationSelection } from '@/app/components/LocationPicker';
import PropertiesTable from '@/app/components/features/admin/properties/PropertiesTable';
import AdvancedSearchForm from '@/app/components/features/admin/properties/AdvancedSearchForm';
import { propertyService } from '@/lib/api/services/property.service';
import { reportService, DashboardTopStats } from '@/lib/api/services/statistic-report.service';
import { PropertyCard, PropertyFilters } from '@/lib/api/types';
import { locationService } from '@/lib/api/services/location.service';

// Global Cache
let allLocationsCache: Array<{ id: string; name: string; type: 'CITY' | 'DISTRICT' | 'WARD' }> = [];
let cacheLoaded = false;

export default function PropertiesPage() {
  const [isAdvSearchOpen, setIsAdvSearchOpen] = useState(false);
  const [isLocPickerOpen, setIsLocPickerOpen] = useState(false);

  // State for Advanced Search Modal
  const [selectedLocations, setSelectedLocations] = useState<LocationSelection[]>([]);

  // State for Main Page Search
  const [locationSearchResults, setLocationSearchResults] = useState<any[]>([]);
  const [data, setData] = useState<PropertyCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  // Helper to store names of selected IDs (fixes UUID display issue)
  const [activeLocationNames, setActiveLocationNames] = useState<Record<string, string>>({});

  const [filters, setFilters] = useState<PropertyFilters>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortType: 'desc'
  });

  const [searchKeyword, setSearchKeyword] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Stats
  const [dashboardStats, setDashboardStats] = useState<DashboardTopStats | null>(null);
  const [forSaleCount, setForSaleCount] = useState<number>(0);
  const [forRentCount, setForRentCount] = useState<number>(0);

  // Load Cache
  useEffect(() => {
    const loadAllLocations = async () => {
      if (cacheLoaded) return;
      try {
        const [cities, districts, wards] = await Promise.all([
          locationService.getChildLocations('CITY'),
          locationService.getChildLocations('DISTRICT'),
          locationService.getChildLocations('WARD')
        ]);

        const cityList = Array.from(cities.entries()).map(([id, name]) => ({ id, name, type: 'CITY' as const }));
        const districtList = Array.from(districts.entries()).map(([id, name]) => ({ id, name, type: 'DISTRICT' as const }));
        const wardList = Array.from(wards.entries()).map(([id, name]) => ({ id, name, type: 'WARD' as const }));

        allLocationsCache = [...cityList, ...districtList, ...wardList];
        cacheLoaded = true;
      } catch (error) {
        console.error('Failed to load locations cache:', error);
      }
    };
    loadAllLocations();
  }, []);

  // Fetch Stats & Properties (Keep your existing useEffects here)
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await reportService.getDashboardTopStats();
        setDashboardStats(stats);
      } catch (error) { }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchPropertyCounts = async () => {
      try {
        const saleRes = await propertyService.getPropertyCards({ page: 1, limit: 1, transactionType: ['SALE'] });
        setForSaleCount(saleRes.paging?.total || 0);
        const rentRes = await propertyService.getPropertyCards({ page: 1, limit: 1, transactionType: ['RENT'] });
        setForRentCount(rentRes.paging?.total || 0);
      } catch (error) { }
    };
    fetchPropertyCounts();
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await propertyService.getPropertyCards(filters);
        setData(res.data);
        if (res.paging) setTotalItems(res.paging.total);
        else if ((res as any).meta) setTotalItems((res as any).meta.total);
      } catch (error) {
        console.error("Failed to fetch properties", error);
      } finally {
        setLoading(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [filters]);

  // Search Logic
  useEffect(() => {
    if (!searchKeyword || searchKeyword.trim().length < 2) {
      setLocationSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const searchLocations = async () => {
      setSearchLoading(true);
      try {
        const keyword = searchKeyword.trim().toLowerCase();
        const normalizeVietnamese = (str: string) => {
          return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'd');
        };
        const normalizedKeyword = normalizeVietnamese(keyword);

        let results: any[] = [];
        const cities = await locationService.getChildLocations('CITY');
        const cityMatches = Array.from(cities.entries())
          .filter(([id, name]) => normalizeVietnamese(name).includes(normalizedKeyword))
          .map(([id, name]) => ({ id, name, type: 'CITY', fullPath: name }));
        results = [...cityMatches];
        const allDistricts = await locationService.getChildLocations('DISTRICT');
        const districtMatches = Array.from(allDistricts.entries())
          .filter(([id, name]) => normalizeVietnamese(name).includes(normalizedKeyword))
          .map(([id, name]) => ({ id, name, type: 'DISTRICT', fullPath: name }));
        results = [...results, ...districtMatches];

        const allWards = await locationService.getChildLocations('WARD');
        const wardMatches = Array.from(allWards.entries())
          .filter(([id, name]) => normalizeVietnamese(name).includes(normalizedKeyword))
          .map(([id, name]) => ({ id, name, type: 'WARD', fullPath: name }));
        results = [...results, ...wardMatches];

        setLocationSearchResults(results.slice(0, 15)); // Limit to 15
        setShowDropdown(results.length > 0);
      } catch (error) {
        console.error('Failed to search locations:', error);
      } finally {
        setSearchLoading(false);
      }
    };

    const debounce = setTimeout(searchLocations, 300);
    return () => clearTimeout(debounce);
  }, [searchKeyword]);

  // --- Handlers ---

  const handleSelectLocation = (loc: any) => {
    // 1. Save name to state to fix UI issue
    setActiveLocationNames(prev => ({ ...prev, [loc.id]: loc.name }));

    // 2. Update Filter
    if (loc.type === 'CITY') {
      const existing = filters.cityIds || [];
      if (!existing.includes(loc.id)) setFilters(prev => ({ ...prev, cityIds: [...existing, loc.id], page: 1 }));
    } else if (loc.type === 'DISTRICT') {
      const existing = filters.districtIds || [];
      if (!existing.includes(loc.id)) setFilters(prev => ({ ...prev, districtIds: [...existing, loc.id], page: 1 }));
    } else if (loc.type === 'WARD') {
      const existing = filters.wardIds || [];
      if (!existing.includes(loc.id)) setFilters(prev => ({ ...prev, wardIds: [...existing, loc.id], page: 1 }));
    }

    setSearchKeyword('');
    setLocationSearchResults([]);
    setShowDropdown(false);
  };

  const handleRemoveFilter = (type: 'city' | 'district' | 'ward', id: string) => {
    if (type === 'city') setFilters(prev => ({ ...prev, cityIds: prev.cityIds?.filter(cid => cid !== id) }));
    else if (type === 'district') setFilters(prev => ({ ...prev, districtIds: prev.districtIds?.filter(did => did !== id) }));
    else if (type === 'ward') setFilters(prev => ({ ...prev, wardIds: prev.wardIds?.filter(wid => wid !== id) }));
  };

  const handlePageChange = (newPage: number) => setFilters(prev => ({ ...prev, page: newPage }));

  // Advanced Search Handler
  const handleAdvancedSearchApply = (newFilters: PropertyFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));

    // Sync names from Advanced Search to local state so tags appear correctly
    if (selectedLocations.length > 0) {
      const newNames: Record<string, string> = {};
      selectedLocations.forEach(loc => { newNames[loc.id] = loc.name; });
      setActiveLocationNames(prev => ({ ...prev, ...newNames }));
    }

    setIsAdvSearchOpen(false);
  };

  const handleRemoveLocation = (id: string) => {
    setSelectedLocations(prev => prev.filter(l => l.id !== id));
  };

  // Helper: Get Name safely
  const getLocationName = (id: string, type: string) => {
    // Priority 1: Local state (Active selections)
    if (activeLocationNames[id]) return activeLocationNames[id];

    // Priority 2: Global Cache
    const loc = allLocationsCache.find(l => l.id === id && l.type === type);
    if (loc) return loc.name;

    // Priority 3: Fallback
    return id.substring(0, 8) + '...';
  };

  const stats = [
    { title: "Total properties", value: dashboardStats?.totalProperties.toLocaleString() || totalItems.toLocaleString(), trend: "", icon: Home },
    { title: "For Sale", value: forSaleCount.toLocaleString(), trend: "", icon: Building2 },
    { title: "For Rent", value: forRentCount.toLocaleString(), trend: "", icon: Layout },
    { title: "Total Users", value: dashboardStats?.totalUsers.toLocaleString() || "---", trend: "", icon: MapPin },
  ];

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold text-gray-900 mb-1">Properties Management</h2></div>
      <StatsGrid stats={stats} />

      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
          <input
            type="text"
            placeholder="Search by location (e.g., Hồ Chí Minh)..."
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-red-500"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onFocus={() => { if (locationSearchResults.length > 0) setShowDropdown(true); }}
          />

          {/* Dropdown */}
          {showDropdown && locationSearchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
              <div className="px-4 py-2 bg-gray-50 border-b text-xs text-gray-500 font-medium">
                Found {locationSearchResults.length} location{locationSearchResults.length > 1 ? 's' : ''}
              </div>
              {locationSearchResults.map((loc) => (
                <button
                  key={`${loc.type}-${loc.id}`}
                  className="w-full text-left px-4 py-3 hover:bg-blue-50 flex items-center gap-3 border-b last:border-b-0 transition-colors"
                  onClick={() => handleSelectLocation(loc)}
                >
                  <div className={`p-2 rounded-lg ${loc.type === 'CITY' ? 'bg-blue-100' : loc.type === 'DISTRICT' ? 'bg-green-100' : 'bg-purple-100'}`}>
                    <MapPin className={`w-4 h-4 ${loc.type === 'CITY' ? 'text-blue-600' : loc.type === 'DISTRICT' ? 'text-green-600' : 'text-purple-600'}`} />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900">{loc.name}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${loc.type === 'CITY' ? 'bg-blue-100 text-blue-700' : loc.type === 'DISTRICT' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                    {loc.type}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Filters Tags */}
        {(filters.cityIds?.length || filters.districtIds?.length || filters.wardIds?.length) ? (
          <div className="flex flex-wrap gap-2">
            {filters.cityIds?.map(id => (
              <span key={id} className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2 font-medium">
                <MapPin className="w-3 h-3" />
                {getLocationName(id, 'CITY')}
                <button onClick={() => handleRemoveFilter('city', id)} className="hover:text-blue-900 ml-1"><X className="w-3.5 h-3.5" /></button>
              </span>
            ))}
            {filters.districtIds?.map(id => (
              <span key={id} className="px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-2 font-medium">
                <MapPin className="w-3 h-3" />
                {getLocationName(id, 'DISTRICT')}
                <button onClick={() => handleRemoveFilter('district', id)} className="hover:text-green-900 ml-1"><X className="w-3.5 h-3.5" /></button>
              </span>
            ))}
            {filters.wardIds?.map(id => (
              <span key={id} className="px-3 py-1.5 bg-purple-100 text-purple-800 rounded-full text-sm flex items-center gap-2 font-medium">
                <MapPin className="w-3 h-3" />
                {getLocationName(id, 'WARD')}
                <button onClick={() => handleRemoveFilter('ward', id)} className="hover:text-purple-900 ml-1"><X className="w-3.5 h-3.5" /></button>
              </span>
            ))}
          </div>
        ) : null}

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button onClick={() => setIsAdvSearchOpen(true)} className="flex items-center gap-2 px-3 py-2 border border-gray-300 bg-white hover:bg-gray-50 rounded-lg text-sm font-medium">
            <Filter className="w-4 h-4" /> Advanced Search
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
        onRefresh={() => setFilters({ ...filters })}
      />

      <Modal isOpen={isAdvSearchOpen} onClose={() => { if (!isLocPickerOpen) setIsAdvSearchOpen(false); }} title="Advanced Search">
        <AdvancedSearchForm
          selectedLocations={selectedLocations}
          onOpenLocationPicker={() => setIsLocPickerOpen(true)}
          onApply={handleAdvancedSearchApply}
          onReset={() => {
            setFilters({ page: 1, limit: 10, sortBy: 'createdAt', sortType: 'desc' });
            setSelectedLocations([]);
            setActiveLocationNames({}); // Reset names map
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
          // Sync names immediately
          const newNames: Record<string, string> = {};
          newLocs.forEach(loc => { newNames[loc.id] = loc.name; });
          setActiveLocationNames(prev => ({ ...prev, ...newNames }));

          setIsLocPickerOpen(false);
        }}
      />
    </div>
  );
}