'use client';

import React, { useState, useEffect } from 'react';
import { Heart, Grid, List, Loader2 } from 'lucide-react';
import Link from 'next/link';
import PropertyCard from '@/app/components/cards/PropertyCard';
import { favoriteService, LikeType } from '@/lib/api/services/favorite.service';
import { PropertyCard as PropertyCardType } from '@/lib/api/types';

export default function FavoritesPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState<PropertyCardType[]>([]);
  const [filter, setFilter] = useState<'all' | 'SALE' | 'RENTAL'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Fetch favorite properties
  useEffect(() => {
    const fetchFavorites = async () => {
      setIsLoading(true);
      try {
        const response = await favoriteService.getFavoriteProperties(currentPage, 12);
        setFavorites(response.data || []);
        setTotalPages(response.paging?.totalPages || 1);
        setTotalElements(response.paging?.total || 0);
      } catch (error) {
        console.error('Failed to fetch favorites:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, [currentPage]);

  const handleRemoveFavorite = async (id: string | number) => {
    try {
      await favoriteService.toggleLike(id as string, LikeType.PROPERTY);
      // Remove from local state
      setFavorites(favorites.filter(f => f.id !== id));
      setTotalElements(prev => prev - 1);
    } catch (error) {
      console.error('Failed to remove favorite:', error);
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
            {isLoading ? 'Loading...' : `${totalElements} properties saved`}
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
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
        </div>
      ) : filteredFavorites.length > 0 ? (
        <>
          {/* Properties Grid */}
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
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
                status={property.status === 'AVAILABLE' ? 'Available' : property.status === 'SOLD' ? 'Sold' : property.status === 'RENTED' ? 'Rented' : 'Pending'}
                isFavorite={true}
                onFavoriteToggle={handleRemoveFavorite}
                showFavorite={true}
                variant="profile"
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
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
        </>
      ) : (
        /* Empty State */
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
    </div>
  );
}
