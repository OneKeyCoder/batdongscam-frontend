'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building, Search, MapPin, Bed, Bath, Square, Heart, Grid, List, SlidersHorizontal, ChevronDown, X, Menu, Loader2, AlertCircle } from 'lucide-react';
import NavBar from '@/app/components/layout/NavBar';
import Footer from '@/app/components/layout/Footer';
import { propertyService } from '@/lib/api/services/property.service';
import { favoriteService, LikeType } from '@/lib/api/services/favorite.service';
import { useAuth } from '@/contexts/AuthContext';
import { PropertyCard as PropertyCardType } from '@/lib/api/types';

const categories = ['All', 'House', 'Apartment', 'Villa', 'Studio', 'Penthouse', 'Commercial', 'Land'];
const locations = ['All Locations', 'District 1', 'District 2', 'District 3', 'District 7', 'Binh Thanh', 'Thu Duc City', 'Vung Tau'];

export default function PropertiesPage() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [propertyType, setPropertyType] = useState<'all' | 'SALE' | 'RENT'>('all');
  const [category, setCategory] = useState('All');
  const [location, setLocation] = useState('All Locations');
  const [priceRange, setPriceRange] = useState<'all' | 'low' | 'mid' | 'high'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // API state
  const [properties, setProperties] = useState<PropertyCardType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1); // 1-indexed for API
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

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

        // Add transaction type filter
        if (propertyType !== 'all') {
          filters.transactionType = [propertyType];
        }

        // Add price range filter
        if (priceRange === 'low') {
          filters.maxPrice = 500000;
        } else if (priceRange === 'mid') {
          filters.minPrice = 500000;
          filters.maxPrice = 1500000;
        } else if (priceRange === 'high') {
          filters.minPrice = 1500000;
        }

        const response = await propertyService.getPropertyCards(filters);
        
        setProperties(response.data);
        setTotalPages(response.paging.totalPages);
        setTotalElements(response.paging.total);
      } catch (err: any) {
        console.error('Failed to fetch properties:', err);
        setError('Failed to load properties. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, [currentPage, propertyType, priceRange]);

  // Filter properties locally (for search and category) - with safety check
  const filteredProperties = (properties || []).filter(p => {
    const matchesSearch = searchTerm === '' || 
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const formatPrice = (amount: number, transactionType: 'SALE' | 'RENT' | null) => {
    if (transactionType === 'RENT') {
      return `$${amount.toLocaleString()}/month`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const handleToggleFavorite = async (e: React.MouseEvent, propertyId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      window.location.href = '/login';
      return;
    }

    try {
      await favoriteService.toggleLike(propertyId, LikeType.PROPERTY);
      // Optionally refresh properties to update favorite status
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  // Helper to convert image URLs
  const getImageUrl = (url: string | null | undefined): string => {
    // Fallback placeholder image
    const fallback = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800';
    
    if (!url) return fallback;
    
    // Reject PDF files
    if (url.toLowerCase().includes('.pdf')) {
      return fallback;
    }
    
    // If already absolute URL, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // If relative path, prepend API base URL
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      <div className="pt-20 max-w-[85%] mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Properties for {propertyType === 'RENT' ? 'Rent' : propertyType === 'SALE' ? 'Sale' : 'Sale & Rent'}
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
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 lg:hidden"
            >
              <SlidersHorizontal className="w-5 h-5" />
              Filters
            </button>
          </div>

          {/* Type Tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setPropertyType('all')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                propertyType === 'all' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setPropertyType('SALE')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                propertyType === 'SALE' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              For Sale
            </button>
            <button
              onClick={() => setPropertyType('RENT')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                propertyType === 'RENT' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              For Rent
            </button>
          </div>

          {/* Advanced Filters */}
          <div className={`grid sm:grid-cols-2 lg:grid-cols-4 gap-4 ${showFilters ? 'block' : 'hidden lg:grid'}`}>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm"
            >
              {locations.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value as any)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm"
            >
              <option value="all">Any Price</option>
              <option value="low">Under $500,000</option>
              <option value="mid">$500,000 - $1,500,000</option>
              <option value="high">Over $1,500,000</option>
            </select>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-red-100 text-red-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-red-100 text-red-600' : 'text-gray-400 hover:text-gray-600'}`}
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
            {filteredProperties.map((property) => (
              <Link
                key={property.id}
                href={`/property/${property.id}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={getImageUrl(property.thumbnailUrl)}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                      property.transactionType === 'SALE' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
                    }`}>
                      For {property.transactionType === 'SALE' ? 'Sale' : 'Rent'}
                    </span>
                  </div>
                  <button 
                    onClick={(e) => handleToggleFavorite(e, property.id)}
                    className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-all"
                  >
                    <Heart className="w-4 h-4 text-gray-600 hover:text-red-500" />
                  </button>
                </div>

                <div className="p-4">
                  <p className="text-xl font-bold text-red-600">{formatPrice(property.price, property.transactionType)}</p>
                  <h3 className="font-semibold text-gray-900 mt-1 line-clamp-1">{property.title}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-2">
                    <MapPin className="w-3 h-3" />
                    {property.location}
                  </p>

                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Square className="w-4 h-4 text-gray-400" />
                      {property.totalArea}m²
                    </span>
                    <span className="flex items-center gap-1 text-gray-400">
                      {property.numberOfImages} photos
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProperties.map((property) => (
              <Link
                key={property.id}
                href={`/property/${property.id}`}
                className="flex flex-col lg:flex-row bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100"
              >
                <div className="relative w-full lg:w-72 h-48 lg:h-auto shrink-0 overflow-hidden">
                  <img
                    src={getImageUrl(property.thumbnailUrl)}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                      property.transactionType === 'SALE' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
                    }`}>
                      For {property.transactionType === 'SALE' ? 'Sale' : 'Rent'}
                    </span>
                  </div>
                </div>

                <div className="flex-1 p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-2xl font-bold text-red-600">{formatPrice(property.price, property.transactionType)}</p>
                      <h3 className="text-lg font-semibold text-gray-900 mt-1">{property.title}</h3>
                      <p className="text-gray-500 flex items-center gap-1 mt-2">
                        <MapPin className="w-4 h-4" />
                        {property.location}
                      </p>
                    </div>
                    <button 
                      onClick={(e) => handleToggleFavorite(e, property.id)}
                      className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-all"
                    >
                      <Heart className="w-5 h-5 text-gray-400 hover:text-red-500" />
                    </button>
                  </div>

                  <div className="flex items-center gap-6 mt-4 text-gray-600">
                    <span className="flex items-center gap-2">
                      <Square className="w-5 h-5 text-gray-400" />
                      {property.totalArea}m²
                    </span>
                    <span className="flex items-center gap-2 text-gray-400">
                      {property.numberOfImages} photos
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-gray-700"
            >
              Previous
            </button>
            
            <div className="flex items-center gap-2">
              {(() => {
                const pages: React.ReactNode[] = [];
                const delta = 2; // Show 2 pages before and after current
                
                // Helper to add page button
                const addPage = (pageNum: number) => {
                  pages.push(
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-lg font-medium ${
                        currentPage === pageNum
                          ? 'bg-red-600 text-white'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                };
                
                // Helper to add ellipsis
                const addEllipsis = (key: string) => {
                  pages.push(
                    <span key={key} className="px-2 text-gray-400">...</span>
                  );
                };
                
                // Calculate range (1-indexed)
                let startPage = Math.max(1, currentPage - delta);
                let endPage = Math.min(totalPages, currentPage + delta);
                
                // Adjust if at boundaries
                if (currentPage <= delta + 1) {
                  endPage = Math.min(totalPages, delta * 2 + 1);
                }
                if (currentPage >= totalPages - delta) {
                  startPage = Math.max(1, totalPages - delta * 2);
                }
                
                // Add first page if not in range
                if (startPage > 1) {
                  addPage(1);
                  if (startPage > 2) {
                    addEllipsis('start-ellipsis');
                  }
                }
                
                // Add pages in range
                for (let i = startPage; i <= endPage; i++) {
                  addPage(i);
                }
                
                // Add last page if not in range
                if (endPage < totalPages) {
                  if (endPage < totalPages - 1) {
                    addEllipsis('end-ellipsis');
                  }
                  addPage(totalPages);
                }
                
                return pages;
              })()}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-gray-700"
            >
              Next
            </button>
          </div>
        )}

        {/* Results info */}
        {!isLoading && properties.length > 0 && (
          <p className="text-center text-sm text-gray-500 mt-4">
            Showing {(currentPage - 1) * 12 + 1} - {Math.min(currentPage * 12, totalElements)} of {totalElements} properties
          </p>
        )}
        {!isLoading && filteredProperties.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100">
            <Building className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-500 text-sm">
              {(properties || []).length === 0 
                ? 'No properties available at the moment' 
                : 'Try adjusting your search or filters'}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
