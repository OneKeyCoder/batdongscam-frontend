'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, Bed, Bath, Maximize, MapPin, Image, Eye, Edit, Trash2 } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';

export interface PropertyCardProps {
  id: number | string;
  image: string;
  title: string;
  price: string;
  priceUnit?: string;
  address: string;
  bedrooms?: number;
  bathrooms?: number;
  area: string;
  numberOfImages?: number;
  type: 'Sale' | 'Rent';
  status?: 'Available' | 'Sold' | 'Rented' | 'Pending';
  isFavorite?: boolean;
  onFavoriteToggle?: (id: number | string) => void;
  showFavorite?: boolean;
  variant?: 'default' | 'profile'; // New variant prop for different layouts
  // Management actions (for /my/properties)
  showActions?: boolean;
  onEdit?: (id: number | string) => void;
  onDelete?: (id: number | string) => void;
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
  numberOfImages,
  type,
  status = 'Available',
  isFavorite = false,
  onFavoriteToggle,
  showFavorite = true,
  variant = 'default',
  showActions = false,
  onEdit,
  onDelete,
}: PropertyCardProps) {
  return (
    <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative">
      <Link href={`/property/${id}`} className="block">
        {/* Image Container */}
        <div className="relative h-56 overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          
          {/* Type Badge and Status Badge - Side by side for profile variant */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <Badge variant={type === 'Sale' ? 'danger' : 'info'}>
              FOR {type.toUpperCase()}
            </Badge>
            
            {/* Status Badge next to Type Badge for profile variant */}
            {variant === 'profile' && status && status !== 'Available' && (
              <Badge variant={status === 'Sold' || status === 'Rented' ? 'success' : 'warning'}>
                {status.toUpperCase()}
              </Badge>
            )}
          </div>

          {/* Status Badge - Right aligned for default variant */}
          {variant === 'default' && status && status !== 'Available' && (
            <div className="absolute top-3 right-12">
              <Badge variant={status === 'Sold' || status === 'Rented' ? 'success' : 'warning'}>
                {status}
              </Badge>
            </div>
          )}

          {/* Price Overlay - Only for default variant */}
          {variant === 'default' && (
            <div className="absolute bottom-3 left-3 right-3">
              <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
                <p className="text-lg font-bold text-red-600">
                  {price}
                  <span className="text-sm font-normal text-gray-500">{type === 'Rent' ? priceUnit : ''}</span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Price - Above title for profile variant */}
          {variant === 'profile' && (
            <p className="text-lg font-bold text-red-600 mb-0.5">
              {price}
              <span className="text-sm font-normal text-gray-500">{type === 'Rent' ? priceUnit : ''}</span>
            </p>
          )}

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
            {bedrooms !== undefined && (
              <div className="flex items-center gap-1">
                <Bed className="w-4 h-4" />
                <span>{bedrooms}</span>
              </div>
            )}
            {bathrooms !== undefined && (
              <div className="flex items-center gap-1">
                <Bath className="w-4 h-4" />
                <span>{bathrooms}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Maximize className="w-4 h-4" />
              <span>{area}</span>
            </div>
            {numberOfImages !== undefined && (
              <div className="flex items-center gap-1">
                <Image className="w-4 h-4" />
                <span>{numberOfImages}</span>
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Action Buttons - For management (hover to show) */}
      {showActions && (
        <div className="absolute top-1 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <div className="flex items-center gap-1.5 bg-white rounded-lg p-1.5 shadow-lg">
            <Link
              href={`/property/${id}`}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              onClick={(e) => e.stopPropagation()}
              title="View"
            >
              <Eye className="w-4 h-4" />
            </Link>
            <Link
              href={`/my/properties/${id}/edit`}
              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
              onClick={(e) => e.stopPropagation()}
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </Link>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete?.(id);
              }}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Favorite Button - Outside Link for proper event handling (only when not showing actions) */}
      {showFavorite && !showActions && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onFavoriteToggle?.(id);
          }}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 z-10 ${
            isFavorite
              ? 'bg-red-500 text-white'
              : 'bg-white/90 text-gray-600 hover:bg-red-50 hover:text-red-500'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      )}
    </div>
  );
}
