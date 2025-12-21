'use client';

import React, { useState } from 'react';
import { Heart, Grid, List } from 'lucide-react';
import PropertyCard from '@/app/components/ui/PropertyCard';

// Mock data
const mockFavorites = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400',
    title: 'Modern Villa with Pool',
    price: '$850,000',
    location: 'District 7',
    city: 'Ho Chi Minh City',
    bedrooms: 4,
    bathrooms: 3,
    area: '280 m²',
    type: 'Sale' as const,
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400',
    title: 'Luxury Apartment Downtown',
    price: '$1,200/month',
    location: 'District 1',
    city: 'Ho Chi Minh City',
    bedrooms: 2,
    bathrooms: 2,
    area: '120 m²',
    type: 'Rent' as const,
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400',
    title: 'Family House with Garden',
    price: '$650,000',
    location: 'Thu Duc City',
    city: 'Ho Chi Minh',
    bedrooms: 5,
    bathrooms: 4,
    area: '350 m²',
    type: 'Sale' as const,
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400',
    title: 'Cozy Studio Near Park',
    price: '$450/month',
    location: 'Binh Thanh District',
    bedrooms: 1,
    bathrooms: 1,
    area: '45 m²',
    type: 'Rent' as const,
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400',
    title: 'Penthouse with City View',
    price: '$2,500,000',
    location: 'District 3',
    city: 'Ho Chi Minh City',
    bedrooms: 3,
    bathrooms: 3,
    area: '200 m²',
    type: 'Sale' as const,
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=400',
    title: 'Traditional Townhouse',
    price: '$380,000',
    location: 'Go Vap District',
    bedrooms: 3,
    bathrooms: 2,
    area: '150 m²',
    type: 'Sale' as const,
  },
];

export default function FavoritesPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState(mockFavorites);
  const [filter, setFilter] = useState<'all' | 'Sale' | 'Rent'>('all');

  const handleRemoveFavorite = (id: number) => {
    setFavorites(favorites.filter(f => f.id !== id));
  };

  const filteredFavorites = filter === 'all' 
    ? favorites 
    : favorites.filter(f => f.type === filter);

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
              onClick={() => setFilter('Sale')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                filter === 'Sale' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              For Sale
            </button>
            <button
              onClick={() => setFilter('Rent')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                filter === 'Rent' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
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

      {/* Properties Grid */}
      {filteredFavorites.length > 0 ? (
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' 
            : 'grid-cols-1'
        }`}>
          {filteredFavorites.map((property) => (
            <PropertyCard
              key={property.id}
              id={property.id}
              title={property.title}
              image={property.image}
              price={property.price}
              type={property.type}
              location={property.location}
              city={property.city}
              bedrooms={property.bedrooms}
              bathrooms={property.bathrooms}
              area={property.area}
              isFavorite={true}
              onToggleFavorite={handleRemoveFavorite}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100">
          <Heart className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
          <p className="text-gray-500 text-sm text-center max-w-sm">
            Start exploring properties and save your favorites to view them here
          </p>
          <a
            href="/properties"
            className="mt-4 px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
          >
            Explore Properties
          </a>
        </div>
      )}
    </div>
  );
}
