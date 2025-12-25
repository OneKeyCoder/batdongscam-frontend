'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Building, Loader2, Search, Users, Home, TrendingUp, Filter, ChevronDown, Grid, List } from 'lucide-react';
import NavBar from '@/app/components/layout/NavBar';
import Footer from '@/app/components/layout/Footer';
import { locationService, LocationCardResponse, LocationCardsFilters } from '@/lib/api/services/location.service';

export default function LocationsPage() {
  // View mode
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [locationType, setLocationType] = useState<'CITY' | 'DISTRICT' | 'WARD'>('CITY');
  
  // Location data
  const [locations, setLocations] = useState<LocationCardResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Advanced filters
  const [minPopulation, setMinPopulation] = useState<number | undefined>();
  const [maxPopulation, setMaxPopulation] = useState<number | undefined>();
  const [minArea, setMinArea] = useState<number | undefined>();
  const [maxArea, setMaxArea] = useState<number | undefined>();
  const [minAvgLandPrice, setMinAvgLandPrice] = useState<number | undefined>();
  const [maxAvgLandPrice, setMaxAvgLandPrice] = useState<number | undefined>();

  // Fetch locations
  useEffect(() => {
    const fetchLocations = async () => {
      setIsLoading(true);
      try {
        const filters: LocationCardsFilters = {
          page: currentPage,
          limit: 12,
          sortType: 'desc',
          sortBy: 'createdAt',
          locationTypeEnum: locationType,
        };

        if (searchTerm.trim()) filters.keyWord = searchTerm.trim();
        if (selectedCities.length > 0) filters.cityIds = selectedCities;
        if (selectedDistricts.length > 0) filters.districtIds = selectedDistricts;
        if (minPopulation) filters.minPopulation = minPopulation;
        if (maxPopulation) filters.maxPopulation = maxPopulation;
        if (minArea) filters.minArea = minArea;
        if (maxArea) filters.maxArea = maxArea;
        if (minAvgLandPrice) filters.minAvgLandPrice = minAvgLandPrice;
        if (maxAvgLandPrice) filters.maxAvgLandPrice = maxAvgLandPrice;

        const response = await locationService.getLocationCards(filters);
        setLocations(response.data || []);
        setTotalPages(response.paging?.totalPages || 1);
        setTotalElements(response.paging?.total || 0);
      } catch (error) {
        console.error('Failed to fetch locations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocations();
  }, [
    currentPage,
    locationType,
    searchTerm,
    selectedCities,
    selectedDistricts,
    minPopulation,
    maxPopulation,
    minArea,
    maxArea,
    minAvgLandPrice,
    maxAvgLandPrice,
  ]);

  const formatNumber = (num: number | undefined) => {
    if (!num) return 'N/A';
    return num.toLocaleString('vi-VN');
  };

  const formatPrice = (price: number | undefined) => {
    if (!price) return 'N/A';
    if (price >= 1000000000) return `${(price / 1000000000).toFixed(1)}B VND/m²`;
    if (price >= 1000000) return `${(price / 1000000).toFixed(1)}M VND/m²`;
    return `${price.toLocaleString('vi-VN')} VND/m²`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      <div className="pt-4 max-w-[90%] mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Explore Locations</h1>
          <p className="text-gray-600 mt-2">
            {isLoading ? 'Loading...' : `${totalElements} locations found`}
          </p>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          {/* Location Type Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => {
                setLocationType('CITY');
                setCurrentPage(1);
              }}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                locationType === 'CITY' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Cities
            </button>
            <button
              onClick={() => {
                setLocationType('DISTRICT');
                setCurrentPage(1);
              }}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                locationType === 'DISTRICT' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Districts
            </button>
            <button
              onClick={() => {
                setLocationType('WARD');
                setCurrentPage(1);
              }}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                locationType === 'WARD' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Wards
            </button>
          </div>

          {/* Search Bar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by location name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>
          </div>

          {/* Filter Row */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4 text-gray-900" />
              <span className="text-sm font-medium text-gray-900">Advanced Filters</span>
              <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showAdvancedFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Population Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Population Range</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPopulation || ''}
                      onChange={(e) => setMinPopulation(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPopulation || ''}
                      onChange={(e) => setMaxPopulation(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    />
                  </div>
                </div>

                {/* Area Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Area Range (km²)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minArea || ''}
                      onChange={(e) => setMinArea(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxArea || ''}
                      onChange={(e) => setMaxArea(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    />
                  </div>
                </div>

                {/* Avg Land Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Avg Land Price (VND/m²)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minAvgLandPrice || ''}
                      onChange={(e) => setMinAvgLandPrice(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxAvgLandPrice || ''}
                      onChange={(e) => setMaxAvgLandPrice(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => {
                    setMinPopulation(undefined);
                    setMaxPopulation(undefined);
                    setMinArea(undefined);
                    setMaxArea(undefined);
                    setMinAvgLandPrice(undefined);
                    setMaxAvgLandPrice(undefined);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Locations Grid/List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {locations.map((location) => (
              <Link
                key={location.id}
                href={`/locations/${location.id}?type=${location.locationTypeEnum}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={location.imgUrl || 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400'}
                    alt={location.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-500 text-white">
                      {location.locationTypeEnum}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 text-lg mb-3">{location.name}</h3>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    {location.population && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span>{formatNumber(location.population)} people</span>
                      </div>
                    )}
                    {location.totalArea && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{formatNumber(location.totalArea)} km²</span>
                      </div>
                    )}
                    {location.avgLandPrice && (
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-gray-400" />
                        <span>{formatPrice(location.avgLandPrice)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {locations.map((location) => (
              <Link
                key={location.id}
                href={`/locations/${location.id}?type=${location.locationTypeEnum}`}
                className="flex bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="w-64 h-40 flex-shrink-0 overflow-hidden">
                  <img
                    src={location.imgUrl || 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400'}
                    alt={location.name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900 text-xl">{location.name}</h3>
                        <span className="px-2 py-1 text-xs font-bold rounded-full bg-blue-500 text-white">
                          {location.locationTypeEnum}
                        </span>
                      </div>
                      <div className="flex items-center gap-6 mt-4 text-gray-600">
                        {location.population && (
                          <span className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            {formatNumber(location.population)} people
                          </span>
                        )}
                        {location.totalArea && (
                          <span className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            {formatNumber(location.totalArea)} km²
                          </span>
                        )}
                        {location.avgLandPrice && (
                          <span className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-gray-400" />
                            {formatPrice(location.avgLandPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && locations.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <Building className="w-16 h-16 mx-auto mb-3 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No locations found</h3>
            <p className="text-gray-500 text-sm mb-4">
              Try adjusting your filters or search term
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCities([]);
                setSelectedDistricts([]);
                setMinPopulation(undefined);
                setMaxPopulation(undefined);
                setMinArea(undefined);
                setMaxArea(undefined);
                setMinAvgLandPrice(undefined);
                setMaxAvgLandPrice(undefined);
              }}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-12">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
              >
                Previous
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === pageNum
                        ? 'bg-red-600 text-white'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
