'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, Bed, Bath, Maximize, MapPin } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';

export interface PropertyCardProps {
  id: number | string;
  image: string;
  title: string;
  price: string;
  priceUnit?: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  area: string;
  type: 'Sale' | 'Rent';
  status?: 'Available' | 'Sold' | 'Rented' | 'Pending';
  isFavorite?: boolean;
  onFavoriteToggle?: (id: number | string) => void;
  showFavorite?: boolean;
}

export default function PropertyCard({
  id,
  image,
  title,
  price,
  priceUnit = '/month',
  address,
  bedrooms,
  bathrooms,
  area,
  type,
  status = 'Available',
  isFavorite = false,
  onFavoriteToggle,
  showFavorite = true,
}: PropertyCardProps) {
  return (
    <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Type Badge */}
        <div className="absolute top-3 left-3">
          <Badge variant={type === 'Sale' ? 'danger' : 'info'}>
            For {type}
          </Badge>
        </div>

        {/* Status Badge */}
        {status && status !== 'Available' && (
          <div className="absolute top-3 right-12">
            <Badge variant={status === 'Sold' || status === 'Rented' ? 'success' : 'warning'}>
              {status}
            </Badge>
          </div>
        )}

        {/* Favorite Button */}
        {showFavorite && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onFavoriteToggle?.(id);
            }}
            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
              isFavorite
                ? 'bg-red-500 text-white'
                : 'bg-white/90 text-gray-600 hover:bg-red-50 hover:text-red-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        )}

        {/* Price Overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
            <p className="text-lg font-bold text-red-600">
              {price}
              <span className="text-sm font-normal text-gray-500">{type === 'Rent' ? priceUnit : ''}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <Link href={`/property/${id}`} className="block p-4">
        <h3 className="font-bold text-gray-900 text-base mb-2 line-clamp-1 group-hover:text-red-600 transition-colors">
          {title}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
          <MapPin className="w-4 h-4 text-red-500 shrink-0" />
          <span className="line-clamp-1">{address}</span>
        </div>

        {/* Features */}
        <div className="flex items-center gap-4 text-gray-600 text-sm">
          <div className="flex items-center gap-1">
            <Bed className="w-4 h-4" />
            <span>{bedrooms}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="w-4 h-4" />
            <span>{bathrooms}</span>
          </div>
          <div className="flex items-center gap-1">
            <Maximize className="w-4 h-4" />
            <span>{area}</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
