'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Grid, List, Loader2, MapPin } from 'lucide-react';
import PropertyCard from '@/app/components/cards/PropertyCard';
import { favoriteService, LikeType } from '@/lib/api/services/favorite.service';
import { PropertyCard as PropertyCardType } from '@/lib/api/types';

export default function FavoritesPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState<PropertyCardType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'SALE' | 'RENTAL'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch favorites from API
  useEffect(() => {
    const fetchFavorites = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await favoriteService.getFavoriteProperties(currentPage, 15);
        setFavorites(response.data || []);
        setTotalPages(response.paging?.totalPages || 1);
      } catch (err: any) {
        console.error('Failed to fetch favorites:', err);
        setError('Failed to load favorites. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, [currentPage]);

  const handleRemoveFavorite = async (id: string) => {
    try {
      await favoriteService.toggleLike(id, LikeType.PROPERTY);
      setFavorites(favorites.filter(f => f.id !== id));
    } catch (err) {
      console.error('Failed to remove favorite:', err);
    }
  };

  const filteredFavorites = filter === 'all' 
    ? favorites 
    : favorites.filter(f => f.transactionType === filter);

  const getImageUrl = (url: string | null | undefined): string => {
    const fallbackImage = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800';
    if (!url) return fallbackImage;
    if (!url.startsWith('http://') && !url.startsWith('https://')) return fallbackImage;
    if (url.includes('.pdf')) return fallbackImage;
    return url;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-600 fill-red-600" />
            My Favorites
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {favorites.length} properties saved
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Filter */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                filter === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('SALE')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                filter === 'SALE' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              For Sale
            </button>
            <button
              onClick={() => setFilter('RENTAL')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                filter === 'RENTAL' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              For Rent
            </button>
          </div>

          {/* View Mode */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-600'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-600'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="text-center py-16 text-red-600">
          <p>{error}</p>
          <button
            onClick={() => setCurrentPage(1)}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Properties Grid - Using PropertyCard component like /properties */}
      {!isLoading && !error && filteredFavorites.length > 0 && viewMode === 'grid' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFavorites.map((property) => (
            <PropertyCard
              key={property.id}
              id={property.id}
              image={getImageUrl(property.thumbnailUrl)}
              title={property.title}
              price={`${property.price.toLocaleString('vi-VN')} VND`}
              priceUnit={property.transactionType === 'RENTAL' ? '/tháng' : ''}
              address={property.location}
              area={`${property.totalArea}m²`}
              numberOfImages={property.numberOfImages}
              type={property.transactionType === 'SALE' ? 'Sale' : 'Rent'}
              isFavorite={true}
              onFavoriteToggle={() => handleRemoveFavorite(property.id)}
              showFavorite={true}
              variant="profile"
            />
          ))}
        </div>
      )}

      {/* List View */}
      {!isLoading && !error && filteredFavorites.length > 0 && viewMode === 'list' && (
        <div className="space-y-4">
          {filteredFavorites.map((property) => (
            <Link
              key={property.id}
              href={`/property/${property.id}`}
              className="flex bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="w-72 h-48 flex-shrink-0 overflow-hidden relative">
                <img
                  src={getImageUrl(property.thumbnailUrl)}
                  alt={property.title}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleRemoveFavorite(property.id);
                  }}
                  className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                >
                  <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                </button>
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
      {!isLoading && !error && filteredFavorites.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100">
          <Heart className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
          <p className="text-gray-500 text-sm text-center max-w-sm">
            Start exploring properties and save your favorites to view them here
          </p>
          <Link
            href="/properties"
            className="mt-4 px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
          >
            Explore Properties
          </Link>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
