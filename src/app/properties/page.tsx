'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Building, Search, MapPin, Grid, List, SlidersHorizontal, ChevronDown, Loader2, AlertCircle, Filter } from 'lucide-react';
import NavBar from '@/app/components/layout/NavBar';
import Footer from '@/app/components/layout/Footer';
import PropertyCard from '@/app/components/cards/PropertyCard';
import AdvancedSearchModal, { AdvancedSearchFilters } from '@/app/components/search/AdvancedSearchModal';
import LocationSelector from '@/app/components/search/LocationSelector';
import { propertyService } from '@/lib/api/services/property.service';
import { locationService } from '@/lib/api/services/location.service';
import { favoriteService, LikeType } from '@/lib/api/services/favorite.service';
import { useAuth } from '@/contexts/AuthContext';
import { PropertyCard as PropertyCardType } from '@/lib/api/types';

const priceRanges = [
  { label: 'Any Price', value: 'all', min: undefined, max: undefined },
  { label: 'Under 500M', value: 'low', min: undefined, max: 500000000 },
  { label: '500M - 1B', value: 'mid', min: 500000000, max: 1000000000 },
  { label: '1B - 3B', value: 'high', min: 1000000000, max: 3000000000 },
  { label: 'Above 3B', value: 'premium', min: 3000000000, max: undefined },
];

const areaRanges = [
  { label: 'Any Area', value: 'all', min: undefined, max: undefined },
  { label: 'Under 50m²', value: 'small', min: undefined, max: 50 },
  { label: '50-100m²', value: 'medium', min: 50, max: 100 },
  { label: '100-200m²', value: 'large', min: 100, max: 200 },
  { label: 'Above 200m²', value: 'xlarge', min: 200, max: undefined },
];

export default function PropertiesPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  
  // Read type from URL parameters
  const typeParam = searchParams.get('type');
  const initialType: 'all' | 'SALE' | 'RENTAL' = 
    typeParam === 'rent' ? 'RENTAL' : 
    typeParam === 'sale' ? 'SALE' : 
    'all';
  
  // Basic filters
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [propertyType, setPropertyType] = useState<'all' | 'SALE' | 'RENTAL'>(initialType);
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [selectedAreaRange, setSelectedAreaRange] = useState('all');
  
  // Property type filter
  const [propertyTypes, setPropertyTypes] = useState<Array<{id: string; typeName: string}>>([]);
  const [selectedPropertyTypeId, setSelectedPropertyTypeId] = useState<string>('');
  
  // Location filters
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [selectedWards, setSelectedWards] = useState<string[]>([]);
  
  // Advanced search
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedSearchFilters>({});
  const [advancedFilterCount, setAdvancedFilterCount] = useState(0);
  
  // API state
  const [properties, setProperties] = useState<PropertyCardType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Update propertyType when URL parameter changes
  useEffect(() => {
    const typeParam = searchParams.get('type');
    const newType: 'all' | 'SALE' | 'RENTAL' = 
      typeParam === 'rent' ? 'RENTAL' : 
      typeParam === 'sale' ? 'SALE' : 
      'all';
    
    setPropertyType(newType);
    setCurrentPage(1);
  }, [searchParams]);

  // Fetch property types on mount
  useEffect(() => {
    const fetchPropertyTypes = async () => {
      try {
        const types = await locationService.getPropertyTypes();
        setPropertyTypes(types);
      } catch (error) {
        console.error('Failed to fetch property types:', error);
      }
    };
    fetchPropertyTypes();
  }, []);

  // Count advanced filters
  useEffect(() => {
    let count = 0;
    if (advancedFilters.minPrice) count++;
    if (advancedFilters.maxPrice) count++;
    if (advancedFilters.minArea) count++;
    if (advancedFilters.maxArea) count++;
    if (advancedFilters.ownerName) count++;
    if (advancedFilters.ownerTier) count++;
    if (advancedFilters.numberOfRooms) count++;
    if (advancedFilters.numberOfBathrooms) count++;
    if (advancedFilters.numberOfBedrooms) count++;
    if (advancedFilters.numberOfFloors) count++;
    if (advancedFilters.houseOrientation) count++;
    if (advancedFilters.balconyOrientation) count++;
    setAdvancedFilterCount(count);
  }, [advancedFilters]);

  // Fetch properties from API
  useEffect(() => {
    const fetchProperties = async () => {
      setIsLoading(true);
      setError('');

      try {
        const filters: any = {
          page: currentPage,
          limit: 12,
          sortType: 'desc',
          sortBy: 'createdAt',
        };

        // Transaction type filter
        if (propertyType !== 'all') {
          filters.transactionType = [propertyType];
        }
        
        // Always show only AVAILABLE properties
        filters.statuses = ['AVAILABLE'];

        // Price range filter
        const priceRange = priceRanges.find(r => r.value === selectedPriceRange);
        if (priceRange) {
          if (priceRange.min) filters.minPrice = priceRange.min;
          if (priceRange.max) filters.maxPrice = priceRange.max;
        }

        // Area range filter
        const areaRange = areaRanges.find(r => r.value === selectedAreaRange);
        if (areaRange) {
          if (areaRange.min) filters.minArea = areaRange.min;
          if (areaRange.max) filters.maxArea = areaRange.max;
        }

        // Property type filter
        if (selectedPropertyTypeId) {
          filters.propertyTypeId = selectedPropertyTypeId;
        }

        // Location filters
        if (selectedCities.length > 0) filters.cityIds = selectedCities;
        if (selectedDistricts.length > 0) filters.districtIds = selectedDistricts;
        if (selectedWards.length > 0) filters.wardIds = selectedWards;

        // Search term
        if (searchTerm.trim()) {
          filters.keyword = searchTerm.trim();
        }

        // Advanced filters
        if (advancedFilters.minPrice) filters.minPrice = advancedFilters.minPrice;
        if (advancedFilters.maxPrice) filters.maxPrice = advancedFilters.maxPrice;
        if (advancedFilters.minArea) filters.minArea = advancedFilters.minArea;
        if (advancedFilters.maxArea) filters.maxArea = advancedFilters.maxArea;
        if (advancedFilters.ownerName) filters.ownerName = advancedFilters.ownerName;
        if (advancedFilters.ownerTier) filters.ownerTier = advancedFilters.ownerTier;
        if (advancedFilters.numberOfRooms) filters.numberOfRooms = advancedFilters.numberOfRooms;
        if (advancedFilters.numberOfBathrooms) filters.numberOfBathrooms = advancedFilters.numberOfBathrooms;
        if (advancedFilters.numberOfBedrooms) filters.numberOfBedrooms = advancedFilters.numberOfBedrooms;
        if (advancedFilters.numberOfFloors) filters.numberOfFloors = advancedFilters.numberOfFloors;
        if (advancedFilters.houseOrientation) filters.houseOrientation = advancedFilters.houseOrientation;
        if (advancedFilters.balconyOrientation) filters.balconyOrientation = advancedFilters.balconyOrientation;

        const response = await propertyService.getPropertyCards(filters);
        setProperties(response.data || []);
        setTotalPages(response.paging?.totalPages || 1);
        setTotalElements(response.paging?.total || 0);
      } catch (err: any) {
        console.error('Failed to fetch properties:', err);
        setError('Failed to load properties. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, [
    currentPage, 
    propertyType, 
    selectedPriceRange, 
    selectedAreaRange, 
    selectedPropertyTypeId,
    selectedCities, 
    selectedDistricts, 
    selectedWards, 
    searchTerm,
    advancedFilters
  ]);

  // Client-side filter (for immediate search feedback)
  const filteredProperties = properties.filter((property) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        property.title.toLowerCase().includes(searchLower) ||
        property.location.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }
    return true;
  });

  const handleToggleFavorite = async (e: React.MouseEvent, propertyId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      window.location.href = '/login';
      return;
    }

    try {
      await favoriteService.toggleLike(propertyId, LikeType.PROPERTY);
      
      setProperties(prev => prev.map(p => 
        p.id === propertyId ? { ...p, favorite: !p.favorite } : p
      ));
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const handleApplyAdvancedFilters = (filters: AdvancedSearchFilters) => {
    setAdvancedFilters(filters);
    setCurrentPage(1);
  };

  const getImageUrl = (url: string | null | undefined): string => {
    const fallbackImage = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800';
    if (!url) return fallbackImage;
    if (!url.startsWith('http://') && !url.startsWith('https://')) return fallbackImage;
    if (url.includes('.pdf')) return fallbackImage;
    return url;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      <div className="pt-4 max-w-[90%] mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Properties for {propertyType === 'RENTAL' ? 'Rent' : propertyType === 'SALE' ? 'Sale' : 'Sale & Rent'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isLoading ? 'Loading...' : `${totalElements} properties found`}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="text-sm text-red-600 hover:text-red-700 underline mt-1"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Search & Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          {/* Type Tabs - Moved to top */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setPropertyType('all')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                propertyType === 'all' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setPropertyType('RENTAL')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                propertyType === 'RENTAL' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              For Rent
            </button>
            <button
              onClick={() => setPropertyType('SALE')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                propertyType === 'SALE' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              For Sale
            </button>
          </div>

          {/* Search Bar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by property name, location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>
          </div>

          {/* Filter Row */}
          <div className="flex items-center gap-4 mb-4">
            {/* Property Type Selector */}
            <div className="w-50">
              <div className="relative">
                <select
                  value={selectedPropertyTypeId}
                  onChange={(e) => {
                    setSelectedPropertyTypeId(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg text-gray-900 bg-white appearance-none cursor-pointer focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                >
                  <option value="">All Property Types</option>
                  {propertyTypes.map((type) => (
                    <option key={type.id} value={type.id}>{type.typeName}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
              </div>
            </div>

            {/* Location Selector */}
            <div className="flex-1">
              <LocationSelector
                selectedCities={selectedCities}
                selectedDistricts={selectedDistricts}
                selectedWards={selectedWards}
                onCitiesChange={(cities) => {
                  setSelectedCities(cities);
                  setCurrentPage(1);
                }}
                onDistrictsChange={(districts) => {
                  setSelectedDistricts(districts);
                  setCurrentPage(1);
                }}
                onWardsChange={(wards) => {
                  setSelectedWards(wards);
                  setCurrentPage(1);
                }}
              />
            </div>

            {/* Property Features Button */}
            <button
              onClick={() => setShowAdvancedSearch(true)}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap text-gray-900 w-50"
            >
              <Filter className="w-4 h-4" />
              <span>Property Features</span>
              {advancedFilterCount > 0 && (
                <span className="px-2 py-0.5 bg-red-600 text-white text-xs font-medium rounded-full">
                  {advancedFilterCount}
                </span>
              )}
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
        </div>

        {/* Properties Grid/List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProperties.map((property) => {
              const isSale = property.transactionType === 'SALE';
              const isRent = property.transactionType === 'RENTAL';
              
              return (
                <PropertyCard
                  key={property.id}
                  id={property.id}
                  image={getImageUrl(property.thumbnailUrl)}
                  title={property.title}
                  price={`${property.price.toLocaleString('vi-VN')} VND`}
                  priceUnit={isRent ? '/tháng' : ''}
                  address={property.location}
                  area={`${property.totalArea}m²`}
                  numberOfImages={property.numberOfImages}
                  type={isSale ? 'Sale' : 'Rent'}
                  status={property.status === 'AVAILABLE' ? 'Available' : property.status === 'SOLD' ? 'Sold' : property.status === 'RENTED' ? 'Rented' : 'Pending'}
                  isFavorite={property.favorite}
                  onFavoriteToggle={(id) => handleToggleFavorite(new MouseEvent('click') as any, id as string)}
                  showFavorite={true}
                  variant="profile"
                />
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProperties.map((property) => (
              <Link
                key={property.id}
                href={`/property/${property.id}`}
                className="flex bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="w-72 h-48 flex-shrink-0 overflow-hidden">
                  <img
                    src={getImageUrl(property.thumbnailUrl)}
                    alt={property.title}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-2xl font-bold text-red-600">
                        {property.price.toLocaleString('vi-VN')} VND
                        {property.transactionType === 'RENTAL' && (
                          <span className="text-sm font-normal text-gray-500">/tháng</span>
                        )}
                      </p>
                      <h3 className="font-semibold text-gray-900 mt-1 text-lg">{property.title}</h3>
                      <p className="text-gray-500 flex items-center gap-1 mt-2">
                        <MapPin className="w-4 h-4" />
                        {property.location}
                      </p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                      property.transactionType === 'SALE' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
                    }`}>
                      For {property.transactionType === 'SALE' ? 'Sale' : 'Rent'}
                    </span>
                  </div>
                  <div className="flex items-center gap-6 mt-4 text-gray-600">
                    <span>{property.totalArea}m²</span>
                    <span>{property.numberOfImages} photos</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredProperties.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <Building className="w-16 h-16 mx-auto mb-3 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-500 text-sm mb-4">
              Try adjusting your filters or search term
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setPropertyType('all');
                setSelectedPriceRange('all');
                setSelectedAreaRange('all');
                setSelectedPropertyTypeId('');
                setSelectedCities([]);
                setSelectedDistricts([]);
                setSelectedWards([]);
                setAdvancedFilters({});
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
              
              {(() => {
                const pages: (number | string)[] = [];
                
                if (totalPages <= 9) {
                  // Show all pages if total is 9 or less
                  for (let i = 1; i <= totalPages; i++) {
                    pages.push(i);
                  }
                } else {
                  // Always show first 2 pages
                  pages.push(1);
                  pages.push(2);
                  
                  if (currentPage > 5) {
                    pages.push('...');
                  }
                  
                  // Show pages around current page (3 pages range)
                  const start = Math.max(3, currentPage - 1);
                  const end = Math.min(totalPages - 2, currentPage + 1);
                  
                  for (let i = start; i <= end; i++) {
                    if (i > 2 && i < totalPages - 1) {
                      pages.push(i);
                    }
                  }
                  
                  if (currentPage < totalPages - 4) {
                    pages.push('...');
                  }
                  
                  // Always show last 2 pages
                  pages.push(totalPages - 1);
                  pages.push(totalPages);
                }
                
                return pages.map((page, index) => (
                  page === '...' ? (
                    <span key={`ellipsis-${index}`} className="w-10 h-10 flex items-center justify-center text-gray-500">
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page as number)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-red-600 text-white'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  )
                ));
              })()}
              
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

      {/* Advanced Search Modal */}
      <AdvancedSearchModal
        isOpen={showAdvancedSearch}
        onClose={() => setShowAdvancedSearch(false)}
        onApply={handleApplyAdvancedFilters}
        initialFilters={advancedFilters}
      />
    </div>
  );
}
